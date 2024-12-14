<?php

namespace App\Actions\Anime;

use App\Http\Resources\AnidbAnimeResource;
use App\Models\AnidbAnime;
use App\Models\AnidbCharacter;
use App\Models\AnimeMap;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;

class GetAnidbData
{
    public function execute(AnimeMap $animeMap): array
    {
        $allIds = array_merge(
            $animeMap->data['other_related_ids'],
            Arr::flatten($animeMap->data['prequel_sequel_chains'])
        );

        $anidbAnimeData = AnidbAnimeResource::collection(
            AnidbAnime::whereIn('id', $allIds)->get()
        )->keyBy('id')->toArray(request());

        $otherRelatedIds = array_map(function ($id) use ($anidbAnimeData) {
            return $anidbAnimeData[$id];
        }, $animeMap->data['other_related_ids']);

        $prequelSequelChains = array_map(function ($chain) use ($anidbAnimeData) {
            return array_map(function ($id) use ($anidbAnimeData) {
                return $anidbAnimeData[$id];
            }, $chain);
        }, $animeMap->data['prequel_sequel_chains']);

        // Get all characters with their seiyuus, filtering out those without seiyuus
        $characters = AnidbCharacter::with(['seiyuus' => function ($query) {
            $query->select('anidb_seiyuus.id', 'anidb_seiyuus.seiyuu_id', 'anidb_seiyuus.name', 'anidb_seiyuus.picture');
        }])
            ->whereIn('anime_id', $allIds)
            ->get()
            ->map(function ($character) {
                return [
                    'id' => $character->character_id,
                    'name' => $character->name,
                    'character_type' => $character->character_type,
                    'picture' => $character->picture,
                    'rating' => $character->rating,
                    'rating_votes' => $character->rating_votes,
                    'seiyuus' => $character->seiyuus->map(function ($seiyuu) {
                        return [
                            'id' => $seiyuu->seiyuu_id,
                            'name' => $seiyuu->name,
                            'picture' => $seiyuu->picture,
                        ];
                    })->values()->toArray(),
                ];
            })
            ->filter(function ($character) {
                return !empty($character['seiyuus']);
            })
            ->values()
            ->toArray();


        return [
            'other_related_ids' => $otherRelatedIds,
            'prequel_sequel_chains' => $prequelSequelChains,
            'characters' => $characters
        ];
    }
}
