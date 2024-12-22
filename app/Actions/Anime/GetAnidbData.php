<?php

namespace App\Actions\Anime;

use App\Http\Resources\AnidbAnimeResource;
use App\Models\AnidbAnime;
use App\Models\AnimeMap;
use App\Models\AnimePrequelSequelChain;
use App\Models\AnimeChainEntry;
use App\Models\AnimeRelatedEntry;
use App\Models\AnidbCharacter;

class GetAnidbData
{
    public function execute(AnimeMap $animeMap): array
    {
        try {
            // Get all chain entries for this map
            $chainEntries = AnimeChainEntry::whereIn(
                'chain_id',
                AnimePrequelSequelChain::where('map_id', $animeMap->id)
                    ->pluck('id')
            )->orderBy('sequence_order')->get();

            // Get all related entries for this map
            $relatedEntries = AnimeRelatedEntry::where('map_id', $animeMap->id)->get();

            // Collect all unique anime IDs
            $allAnimeIds = array_unique(array_merge(
                $chainEntries->pluck('anime_id')->toArray(),
                $relatedEntries->pluck('anime_id')->toArray()
            ));

            // Get all anime data at once
            $anidbAnimeData = AnidbAnimeResource::collection(
                AnidbAnime::whereIn('id', $allAnimeIds)->get()
            )->keyBy('id')->toArray(request());

            // Process related entries
            $otherRelatedIds = $relatedEntries->map(function ($relatedEntry) use ($anidbAnimeData) {
                $data = $anidbAnimeData[$relatedEntry->anime_id] ?? null;
                return $data ? [
                    'id' => $data['id'],
                    'type' => $data['type'],
                    'episode_count' => $data['episode_count'],
                    'season' => $data['season'],
                    'title' => $data['title_main'],
                    'rating' => $data['rating'] === '0.00' ? null : $data['rating'],
                    'picture' => $data['picture'],
                    'map_id' => $relatedEntry->map_id,
                ] : null;
            })->filter()->values()->toArray();

            // Process chain entries
            $chains = AnimePrequelSequelChain::where('map_id', $animeMap->id)
                ->orderBy('importance_order')
                ->get();

            $prequelSequelChains = [];
            foreach ($chains as $chain) {
                $chainAnime = $chain->entries()
                    ->orderBy('sequence_order')
                    ->get()
                    ->map(function ($entry) use ($anidbAnimeData, $chain) {
                        $data = $anidbAnimeData[$entry->anime_id] ?? null;
                        return $data ? [
                            'id' => $data['id'],
                            'type' => $data['type'],
                            'episode_count' => $data['episode_count'],
                            'season' => $data['season'],
                            'title' => $data['title_main'],
                            'rating' => $data['rating'] === '0.00' ? null : $data['rating'],
                            'picture' => $data['picture'],
                            'map_id' => $chain->map_id,
                        ] : null;
                    })
                    ->filter()
                    ->values()
                    ->toArray();

                if (!empty($chainAnime)) {
                    $prequelSequelChains[$chain->name] = $chainAnime;
                }
            }

            // Get characters for all anime IDs
            $mainCharacters = AnidbCharacter::whereIn('anime_id', $allAnimeIds)
                ->whereNotNull('picture')
                ->where('name', '!=', "\n")
                ->where('character_type', 'main character in')
                ->with(['seiyuus' => function ($query) {
                    $query->whereNotNull('anidb_seiyuus.picture')
                        ->select(
                            'anidb_seiyuus.id',
                            'anidb_seiyuus.seiyuu_id',
                            'anidb_seiyuus.name',
                            'anidb_seiyuus.picture'
                        );
                }])
                ->get();

            $otherCharacters = AnidbCharacter::whereIn('anime_id', $allAnimeIds)
                ->whereNotNull('picture')
                ->where('name', '!=', "\n")
                ->where('character_type', '!=', 'main character in')
                ->orderByDesc('rating_votes')
                ->limit(50)
                ->with(['seiyuus' => function ($query) {
                    $query->whereNotNull('anidb_seiyuus.picture')
                        ->select(
                            'anidb_seiyuus.id',
                            'anidb_seiyuus.seiyuu_id',
                            'anidb_seiyuus.name',
                            'anidb_seiyuus.picture'
                        );
                }])
                ->get();

            // Process characters and seiyuus into credits structure
            $charactersByName = $mainCharacters->concat($otherCharacters)
                ->groupBy('name');

            // Process cast (characters)
            $cast = $charactersByName->map(function ($characterGroup) {
                $primaryCharacter = $characterGroup->sortByDesc('rating_votes')->first();
                $seiyuuNames = $characterGroup->pluck('seiyuus')
                    ->flatten(1)
                    ->unique('seiyuu_id')
                    ->pluck('name')
                    ->join(', ');

                return [
                    'id' => $primaryCharacter->character_id,
                    'name' => $primaryCharacter->name,
                    'picture' => "https://anidb.net/images/main/{$primaryCharacter->picture}",
                    'seiyuu' => $seiyuuNames
                ];
            })->values();

            // Process crew (seiyuus)
            $seiyuus = $mainCharacters->concat($otherCharacters)
                ->pluck('seiyuus')
                ->flatten(1)
                ->unique('seiyuu_id')
                ->map(function ($seiyuu) use ($charactersByName) {
                    // Find all characters voiced by this seiyuu
                    $characterNames = $charactersByName
                        ->filter(function ($characterGroup) use ($seiyuu) {
                            return $characterGroup->contains(function ($character) use ($seiyuu) {
                                return $character->seiyuus->contains('seiyuu_id', $seiyuu->seiyuu_id);
                            });
                        })
                        ->map(function ($characterGroup) {
                            return $characterGroup->first()->name;
                        })
                        ->join(', ');

                    return [
                        'id' => $seiyuu->seiyuu_id,
                        'name' => $seiyuu->name,
                        'picture' => "https://anidb.net/images/main/{$seiyuu->picture}",
                        'characters' => $characterNames
                    ];
                })
                ->values();

            return [
                'other_related_ids' => $otherRelatedIds,
                'prequel_sequel_chains' => $prequelSequelChains,
                'credits' => [
                    'cast' => $cast,
                    'seiyuu' => $seiyuus
                ]
            ];
        } catch (\Exception $e) {
            logger()->error('Error processing anime data', [
                'error' => $e->getMessage(),
                'map_id' => $animeMap->id
            ]);
            return [
                'other_related_ids' => [],
                'prequel_sequel_chains' => [],
                'credits' => [
                    'cast' => [],
                    'seiyuu' => []
                ]
            ];
        }
    }
}
