<?php

namespace App\Actions\Controller\Anime;

use App\Http\Controllers\Comment\CommentController;
use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeChainEntry;
use App\Models\Anime\AnimeMap;
use App\Repositories\Anime\AnimeSeasonControllerRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class AnimeSeasonControllerAction
{
    public function __construct(private AnimeSeasonControllerRepository $repository, private CommentController $commentController)
    {
        $this->repository = $repository;
        $this->commentController = $commentController;
    }

    public function validateSeasonAccess(int $accessId, int $seasonId): void
    {
        if (! $this->repository->verifySeasonRelationship($accessId, $seasonId)) {
            abort(400, 'Season not found');
        }

        $animeType = $this->repository->getAnimeType($seasonId);
        if ($animeType === 'Music Video' || $animeType === 'unknown') {
            throw new \Exception('Music videos or unknown type are not supported');
        }
    }

    public function processAnimeData(AnidbAnime $anime, int $seasonId): array
    {
        $credits = $this->processCredits($anime);
        $relatedAnime = $this->processRelatedAnime($anime->relatedAnime);
        $similarAnime = $this->processSimilarAnime($anime->similarAnime);
        $externalContent = $this->processExternalContent($anime, $seasonId);
        $episodes = $this->processEpisodes($anime->mapped_episodes);

        $animeData = $anime->toArray();
        unset($animeData['characters']);

        return array_merge($animeData, [
            'map_id' => $anime->map(),
            'credits' => $credits,
            'related_anime' => $relatedAnime,
            'similar_anime' => $similarAnime,
            'external_links' => $externalContent['links'],
            'videos' => $externalContent['videos'],
            'backdrop_path' => $externalContent['backdrop_path'] ?? null,
            'logo_path' => $externalContent['logo_path'] ?? null,
            'startdate' => $this->repository->formatDate($animeData['startdate']),
            'enddate' => $this->repository->formatDate($animeData['enddate']),
            'mapped_episodes' => $episodes['episodes'],
            'total_runtime' => $episodes['total_runtime'],
        ]);
    }

    private function processCredits(AnidbAnime $anime): array
    {
        $mainCharacters = $this->filterCharacters($anime->characters, true);
        $otherCharacters = $this->filterCharacters($anime->characters, false);

        if ($mainCharacters->isEmpty() && $otherCharacters->isEmpty()) {
            return ['cast' => null, 'seiyuu' => null];
        }

        $charactersByName = $mainCharacters->concat($otherCharacters)->groupBy('name');

        return [
            'cast' => $this->processCast($charactersByName),
            'seiyuu' => $this->processSeiyuu($charactersByName, $mainCharacters->concat($otherCharacters)),
        ];
    }

    private function filterCharacters(Collection $characters, bool $isMain): Collection
    {
        return $characters
            ->where('character_type', $isMain ? 'main character in' : '!=', 'main character in')
            ->whereNotNull('picture')
            ->where('name', '!=', "\n")
            ->filter(function ($character) {
                return $character->seiyuus->whereNotNull('picture')->isNotEmpty();
            })
            ->when(! $isMain, function ($query) {
                return $query->sortByDesc('rating_votes')->take(20);
            });
    }

    private function processCast(Collection $charactersByName): array
    {
        return $charactersByName->map(function ($characterGroup) {
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
                'seiyuu' => $seiyuuNames,
            ];
        })->values()->toArray();
    }

    private function processSeiyuu(Collection $charactersByName, Collection $characters): array
    {
        return $characters->pluck('seiyuus')
            ->flatten(1)
            ->unique('seiyuu_id')
            ->map(function ($seiyuu) use ($charactersByName) {
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
                    'characters' => $characterNames,
                ];
            })
            ->values()
            ->toArray();
    }

    private function processRelatedAnime(Collection $relatedAnime): array
    {
        return $relatedAnime->map(function ($related) {
            $mapId = $related->relatedEntry?->map_id ?? $related->chainEntry?->chain?->map_id;

            return [
                'id' => $related->id,
                'related_anime_id' => $related->related_anime_id,
                'name' => $related->name,
                'relation_type' => $related->relation_type,
                'picture' => $related->relatedAnime?->picture,
                'map_id' => $mapId,
            ];
        })->filter()->values()->toArray();
    }

    private function processSimilarAnime(Collection $similarAnime): array
    {
        return $similarAnime->map(function ($similar) {
            $mapId = $similar->relatedEntry?->map_id ?? $similar->chainEntry?->chain?->map_id;

            return [
                'id' => $similar->id,
                'similar_anime_id' => $similar->similar_anime_id,
                'name' => $similar->name,
                'picture' => $similar->similarAnime?->picture,
                'map_id' => $mapId,
            ];
        })->filter()->values()->toArray();
    }

    private function processExternalContent(AnidbAnime $anime, int $seasonId): array
    {
        $videos = [];
        $externalLinks = $anime->externalLinks->filter(function ($link) use (&$videos) {
            if ($link->type === 'youtube') {
                $videos[] = [
                    'id' => $link->id,
                    'url' => $link->identifier ? "https://youtube.com/{$link->identifier}" : null,
                    'type' => $link->type,
                ];

                return false;
            }

            return ! in_array($link->type, ['myanimelist', 'animenewsnetwork', 'youtube']);
        })->values()->toArray();

        $externalIds = $this->repository->getExternalIds($seasonId);
        $combinedLinks = array_merge($externalLinks, [
            ['type' => 'myanimelist', 'identifier' => $externalIds?->mal_id],
            ['type' => 'themoviedb', 'identifier' => $externalIds?->themoviedb_id],
            ['type' => 'thetvdb', 'identifier' => $externalIds?->thetvdb_id],
            ['type' => 'livechart', 'identifier' => $externalIds?->livechart_id],
            ['type' => 'anime_planet', 'identifier' => $externalIds?->anime_planet_id],
            ['type' => 'imdb', 'identifier' => $externalIds?->imdb_id],
        ]);

        $tmdbImages = $this->repository->getTmdbImages($seasonId);

        return [
            'links' => array_values(array_filter($combinedLinks, fn ($link) => ! is_null($link['identifier']))),
            'videos' => $videos,
            'backdrop_path' => $tmdbImages['backdrop_path'] ?? null,
            'logo_path' => $tmdbImages['logo_path'] ?? null,
        ];
    }

    private function processEpisodes(?array $mappedEpisodes): array
    {
        if (! $mappedEpisodes) {
            return ['episodes' => null, 'total_runtime' => null];
        }

        $totalRuntime = null;
        if (isset($mappedEpisodes['mainEpisodes'])) {
            $totalRuntime = $this->calculateTotalRuntime($mappedEpisodes['mainEpisodes']);
            $mappedEpisodes['mainEpisodes'] = $this->formatEpisodes($mappedEpisodes['mainEpisodes']);
        }

        if (isset($mappedEpisodes['specialEpisodes'])) {
            $mappedEpisodes['specialEpisodes'] = $this->formatEpisodes($mappedEpisodes['specialEpisodes']);
        }

        return [
            'episodes' => $mappedEpisodes,
            'total_runtime' => $totalRuntime,
        ];
    }

    private function calculateTotalRuntime(array $episodes): ?string
    {
        $totalMinutes = collect($episodes)->sum('runtime');
        if ($totalMinutes <= 0) {
            return null;
        }

        $hours = floor($totalMinutes / 60);
        $minutes = $totalMinutes % 60;

        return $hours > 0
            ? "{$hours}h ".($minutes > 0 ? "{$minutes}m" : '')
            : "{$minutes}m";
    }

    private function formatEpisodes(array $episodes): array
    {
        return collect($episodes)
            ->map(function ($episode) {
                return [
                    'season' => $episode['season'] ?? ($episode['is_special'] ?? false ? 0 : 1),
                    'episode_number' => $episode['episode'] ?? null,
                    'id' => $episode['tvdb_id'] ?? null,
                    'name' => $episode['name'] ?? null,
                    'air_date' => isset($episode['aired']) ? $this->repository->formatDate($episode['aired']) : null,
                    'runtime' => $episode['runtime'] ?? null,
                    'overview' => $episode['overview'] ?? null,
                    'still_path' => $episode['image'] ?? null,
                ];
            })
            ->toArray();
    }

    public function getUserContent(Request $request, int $seasonId): array
    {
        if (! Auth::check()) {
            return ['library' => null, 'lists' => null];
        }

        return [
            'library' => $this->getUserLibrary($seasonId),
            'lists' => $this->getUserLists($request, $seasonId),
        ];
    }

    private function getUserLibrary(int $seasonId): ?array
    {
        $userAnime = $this->repository->getUserAnime($seasonId);
        if (! $userAnime) {
            return null;
        }

        return [
            'id' => $userAnime->id,
            'watch_status' => $userAnime->watch_status,
            'rating' => $userAnime->rating,
            'episodes' => $userAnime->episodes->map(function ($episode) {
                return [
                    'id' => $episode->id,
                    'user_id' => $episode->user_id,
                    'user_anime_id' => $episode->user_anime_id,
                    'episode_id' => $episode->episode_id,
                    'watch_status' => $episode->watch_status,
                    'rating' => $episode->rating,
                    'is_special' => $episode->is_special,
                ];
            })->toArray(),
        ];
    }

    private function getUserLists(Request $request, int $seasonId): ?array
    {
        $lists = $request->user()
            ->customLists()
            ->select('id', 'title')
            ->orderBy('title', 'ASC')
            ->withExists(['items as has_item' => function ($query) use ($seasonId) {
                $query->where('listable_type', AnidbAnime::class)
                    ->where('listable_id', $seasonId);
            }])
            ->get();

        return $lists->isEmpty() ? null : $lists->toArray();
    }

    public function generateNavigationLinks(int $accessId, int $seasonId): ?array
    {
        try {
            $animeMap = $this->repository->getAnimeMap($accessId);
            $chainEntry = $this->repository->getChainEntry($seasonId);

            if ($chainEntry) {
                return $this->generateChainLinks($chainEntry, $accessId, $seasonId, $animeMap);
            }

            $relatedEntry = $this->repository->getRelatedEntry($seasonId);
            if ($relatedEntry) {
                return $this->generateRelatedLinks($accessId, $seasonId, $animeMap);
            }

            return null;
        } catch (\Exception $e) {
            logger()->error('Error generating navigation links', [
                'error' => $e->getMessage(),
                'access_id' => $accessId,
                'season_id' => $seasonId,
            ]);

            return null;
        }
    }

    private function generateChainLinks(AnimeChainEntry $chainEntry, int $accessId, int $seasonId, AnimeMap $animeMap): array
    {
        $chainEntries = $this->repository->getChainEntries($chainEntry->chain_id);

        return [
            'show' => [
                'url' => url("/anime/{$accessId}"),
                'name' => $animeMap->collection_name,
            ],
            'seasons' => $chainEntries->map(function ($entry) use ($accessId, $seasonId) {
                return [
                    'url' => url("/anime/{$accessId}/season/{$entry->anime_id}"),
                    'name' => $entry->anime->title ?? 'Unknown Season',
                    'season_number' => $entry->sequence_order,
                    'is_current' => $entry->anime_id === $seasonId,
                ];
            })->values()->all(),
        ];
    }

    private function generateRelatedLinks(int $accessId, int $seasonId, AnimeMap $animeMap): array
    {
        $relatedEntries = $this->repository->getRelatedEntries($accessId);

        return [
            'show' => [
                'url' => url("/anime/{$accessId}"),
                'name' => $animeMap->collection_name,
            ],
            'seasons' => $relatedEntries->map(function ($entry) use ($accessId, $seasonId) {
                return [
                    'url' => url("/anime/{$accessId}/season/{$entry->anime_id}"),
                    'name' => $entry->anime->title ?? 'Unknown Season',
                    'is_current' => $entry->anime_id === $seasonId,
                ];
            })->values()->all(),
        ];
    }
}
