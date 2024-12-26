<?php

namespace App\Http\Controllers;

use App\Actions\Anime\GetAnidbData;
use App\Actions\Anime\GetAnimeTypeAction;
use App\Actions\Anime\GetTmdbData;
use App\Models\AnidbAnime;
use App\Models\AnimeMap;
use App\Models\AnimeMappingExternalId;
use App\Models\UserAnime;
use App\Models\UserAnimeCollection;
use App\Services\TmdbService;
use Carbon\Carbon;
use Exception;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AnimeController extends Controller
{
    private GetTmdbData $getTmdbData;
    private GetAnidbData $getAnidbData;
    private GetAnimeTypeAction $getAnimeType;
    private TmdbService $tmdbService;

    public function __construct(GetTmdbData $getTmdbData, GetAnidbData $getAnidbData, GetAnimeTypeAction $getAnimeType, TmdbService $tmdbService)
    {
        $this->getTmdbData = $getTmdbData;
        $this->getAnidbData = $getAnidbData;
        $this->getAnimeType = $getAnimeType;
        $this->tmdbService = $tmdbService;
    }


    public function show($accessId)
    {
        try {
            $animeMap = AnimeMap::where('id', $accessId)->firstOrFail();
            $tmdbData = $this->getTmdbData->execute($accessId);
            $anidbData = $this->getAnidbData->execute($animeMap);

            $collectionName = $animeMap->collection_name ?? json_decode($tmdbData->getContent(), true)['data']['title'];
            $type = $this->getAnimeType->execute($accessId);

            // Get first entry from prequel_sequel_chains
            $firstChainEntry = null;
            if (!empty($anidbData['prequel_sequel_chains'])) {
                $firstChain = array_values($anidbData['prequel_sequel_chains'])[0] ?? [];
                $firstChainEntry = $firstChain[0] ?? null;
            }

            // Get user's anime library entry if it exists
            $userLibrary = null;
            if (Auth::check()) {
                $userAnimeCollection = UserAnimeCollection::where('map_id', $accessId)
                    ->whereHas('userLibrary', function ($query) {
                        $query->where('user_id', Auth::id());
                    })
                    ->with(['anime' => function ($query) {
                        $query->select(['id', 'user_anime_collection_id', 'anidb_id', 'is_movie', 'rating', 'watch_status']);
                    }])
                    ->first();

                if ($userAnimeCollection) {
                    $userLibrary = [
                        'collection' => [
                            'id' => $userAnimeCollection->id,
                            'user_library_id' => $userAnimeCollection->user_library_id,
                            'map_id' => $userAnimeCollection->map_id,
                            'rating' => $userAnimeCollection->rating,
                            'watch_status' => $userAnimeCollection->watch_status,
                        ],
                        'anime' => $userAnimeCollection->anime->map(function ($anime) {
                            return [
                                'id' => $anime->id,
                                'anidb_id' => $anime->anidb_id,
                                'is_movie' => $anime->is_movie,
                                'rating' => $anime->rating,
                                'watch_status' => $anime->watch_status,
                            ];
                        })->toArray()
                    ];
                }
            }

            return Inertia::render('AnimeContent', [
                'type' => $type,
                $type => [
                    'tmdbData' => json_decode($tmdbData->getContent(), true),
                    'anidbData' => $anidbData,
                    'collection_name' => $collectionName,
                    'map_id' => $firstChainEntry ? $firstChainEntry['map_id'] : $accessId,
                    'anidb_id' => $firstChainEntry ? $firstChainEntry['id'] : null,
                ],
                'user_library' => $userLibrary
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            abort(400, "Could not find this anime");
        } catch (\JsonException $e) {
            abort(500, "Problem on our end finding this anime");
        } catch (\Exception $e) {
            logger()->error('Error processing anime data', [
                'error' => $e->getMessage(),
            ]);
            abort(500, "Problem on our end finding this anime");
        }
    }


    public function showSeason($accessId, $seasonId): Response
    {
        try {
            if (!$this->verifySeasonRelationship($accessId, $seasonId)) {
                return abort(400, "Season not found");
            }

            $this->checkAnimeType($seasonId);

            $anime = AnidbAnime::with([
                'characters.seiyuus',
                'relatedAnime.relatedEntry',
                'relatedAnime.chainEntry.chain',
                'relatedAnime.relatedAnime',
                'similarAnime.relatedEntry',
                'similarAnime.chainEntry.chain',
                'similarAnime.similarAnime',
                'creators',
                'externalLinks',
            ])->findOrFail($seasonId);


            $anime->setAttribute('mapped_episodes', $anime->mappedEpisodes());

            // Process characters and seiyuus
            $mainCharacters = $anime->characters
                ->where('character_type', 'main character in')
                ->whereNotNull('picture')
                ->where('name', '!=', "\n")
                ->filter(function ($character) {
                    return $character->seiyuus->whereNotNull('picture')->isNotEmpty();
                });

            $otherCharacters = $anime->characters
                ->where('character_type', '!=', 'main character in')
                ->whereNotNull('picture')
                ->where('name', '!=', "\n")
                ->filter(function ($character) {
                    return $character->seiyuus->whereNotNull('picture')->isNotEmpty();
                })
                ->sortByDesc('rating_votes')
                ->take(20);

            // If no valid characters found, return null for both cast and seiyuu
            if ($mainCharacters->isEmpty() && $otherCharacters->isEmpty()) {
                $anime['credits'] = [
                    'cast' => null,
                    'seiyuu' => null
                ];
            } else {
                // Group characters by name
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

                // Process seiyuus
                $seiyuus = $mainCharacters->concat($otherCharacters)
                    ->pluck('seiyuus')
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
                            'characters' => $characterNames
                        ];
                    })
                    ->values();

                $anime['credits'] = [
                    'cast' => $cast,
                    'seiyuu' => $seiyuus
                ];
            }

            $relatedAnime = $anime->relatedAnime->map(function ($related) {
                // First check if there's a direct related entry
                $mapId = $related->relatedEntry?->map_id;

                // If no direct related entry, check chain entry
                if (!$mapId && $related->chainEntry) {
                    $mapId = $related->chainEntry->chain?->map_id;
                }

                return [
                    'id' => $related->id,
                    'related_anime_id' => $related->related_anime_id,
                    'name' => $related->name,
                    'relation_type' => $related->relation_type,
                    'picture' => $related->relatedAnime?->picture,
                    'map_id' => $mapId
                ];
            })->filter()->values()->toArray();

            $similarAnime = $anime->similarAnime->map(function ($similar) {
                // First check if there's a direct related entry
                $mapId = $similar->relatedEntry?->map_id;

                // If no direct related entry, check chain entry
                if (!$mapId && $similar->chainEntry) {
                    $mapId = $similar->chainEntry->chain?->map_id;
                }

                return [
                    'id' => $similar->id,
                    'similar_anime_id' => $similar->similar_anime_id,
                    'name' => $similar->name,
                    'picture' => $similar->similarAnime?->picture,
                    'map_id' => $mapId
                ];
            })->filter()->values()->toArray();

            // Process external links and videos
            $videos = [];
            $externalLinks = $anime->externalLinks->filter(function ($link) use (&$videos) {
                if ($link->type === 'youtube') {
                    $videos[] = [
                        'id' => $link->id,
                        'url' => $link->identifier ? "https://youtube.com/{$link->identifier}" : null,
                        'type' => $link->type
                    ];
                    return false;
                }
                return !in_array($link->type, ['myanimelist', 'animenewsnetwork', 'youtube']);
            })->values()->toArray();

            // Get external IDs
            $externalIds = AnimeMappingExternalId::where('anidb_id', $seasonId)
                ->select([
                    'mal_id',
                    'themoviedb_id',
                    'thetvdb_id',
                    'livechart_id',
                    'anime_planet_id',
                    'imdb_id'
                ])
                ->first();

            // Combine external links and IDs
            $externalLinks = array_merge($externalLinks, [
                ['type' => 'myanimelist', 'identifier' => $externalIds?->mal_id],
                ['type' => 'themoviedb', 'identifier' => $externalIds?->themoviedb_id],
                ['type' => 'thetvdb', 'identifier' => $externalIds?->thetvdb_id],
                ['type' => 'livechart', 'identifier' => $externalIds?->livechart_id],
                ['type' => 'anime_planet', 'identifier' => $externalIds?->anime_planet_id],
                ['type' => 'imdb', 'identifier' => $externalIds?->imdb_id],
            ]);

            // Filter out null identifiers
            $externalLinks = array_filter($externalLinks, function ($link) {
                return !is_null($link['identifier']);
            });

            $mapId = $anime->map();

            unset($anime['characters']);

            // Convert to array and set all properties
            $anime = $anime->toArray();

            $anime['map_id'] = $mapId;

            // Get TMDB backdrop and logo
            $tmdbImages = $this->tmdbService->getBackdropAndLogoForAnidbId($seasonId);
            if ($tmdbImages) {
                $anime['backdrop_path'] = $tmdbImages['backdrop_path'];
                $anime['logo_path'] = $tmdbImages['logo_path'];
            }

            // Format dates using Carbon
            $anime['startdate'] = $this->formatDate($anime['startdate']);
            $anime['enddate'] = $this->formatDate($anime['enddate']);
            $totalRuntime = null;


            // Format dates in mapped_episodes using Carbon
            if (isset($anime['mapped_episodes'])) {
                if (isset($anime['mapped_episodes']['mainEpisodes'])) {
                    $totalRuntime = collect($anime['mapped_episodes']['mainEpisodes'])
                        ->sum('runtime');

                    if ($totalRuntime > 0) {
                        $hours = floor($totalRuntime / 60);
                        $minutes = $totalRuntime % 60;

                        $totalRuntime = $hours > 0
                            ? "{$hours}h " . ($minutes > 0 ? "{$minutes}m" : "")
                            : "{$minutes}m";
                    }

                    $anime['mapped_episodes']['mainEpisodes'] = collect($anime['mapped_episodes']['mainEpisodes'])
                        ->map(function ($episode) {
                            return [
                                'season' => $episode['season'] ?? 1,
                                'episode_number' => $episode['episode'] ?? null,
                                'id' => $episode['tvdb_id'] ?? null,
                                'name' => $episode['name'] ?? null,
                                'air_date' => isset($episode['aired'])
                                    ? $this->formatDate($episode['aired'])
                                    : null,
                                'runtime' => $episode['runtime'] ?? null,
                                'overview' => $episode['overview'] ?? null,
                                'still_path' => $episode['image'] ?? null,
                            ];
                        })
                        ->toArray();
                }

                if (isset($anime['mapped_episodes']['specialEpisodes'])) {
                    $anime['mapped_episodes']['specialEpisodes'] = collect($anime['mapped_episodes']['specialEpisodes'])
                        ->map(function ($episode) {
                            return [
                                'season' => $episode['season'] ?? 0,
                                'episode_number' => $episode['episode'] ?? null,
                                'id' => $episode['tvdb_id'] ?? null,
                                'name' => $episode['name'] ?? null,
                                'air_date' => isset($episode['aired'])
                                    ? $this->formatDate($episode['aired'])
                                    : null,
                                'runtime' => $episode['runtime'] ?? null,
                                'overview' => $episode['overview'] ?? null,
                                'still_path' => $episode['image'] ?? null,
                            ];
                        })
                        ->toArray();
                }
            }

            $anime['related_anime'] = $relatedAnime;
            $anime['similar_anime'] = $similarAnime;
            $anime['total_runtime'] = $totalRuntime;
            $anime['external_links'] = array_values($externalLinks);
            $anime['videos'] = $videos;

            $userLibrary = null;

            if (Auth::check()) {
                $userAnime = UserAnime::with('episodes')
                    ->whereHas('collection', function ($query) use ($seasonId) {
                        $query->whereHas('userLibrary', function ($query) {
                            $query->where('user_id', Auth::id());
                        });
                    })
                    ->where('anidb_id', $seasonId)
                    ->select(['id', 'watch_status', 'rating'])
                    ->first();

                if ($userAnime) {
                    $userLibrary = [
                        'id' => $userAnime->id,
                        'watch_status' => $userAnime->watch_status,
                        'rating' => $userAnime->rating,
                        'type' => 'animeseason',
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
                        })->toArray()
                    ];
                }
            }

            return Inertia::render(
                'AnimeSeasonContent',
                [
                    'animeseason' => $anime,
                    'user_library' => $userLibrary,
                    'type' => 'animeseason'
                ]
            );
        } catch (ModelNotFoundException $e) {
            return response()->json(['error' => 'Anime not found'], 404);
        } catch (\Exception $e) {
            logger()->error('Error fetching anime season', [
                'error' => $e->getMessage(),
                'access_id' => $accessId,
                'season_id' => $seasonId
            ]);
            return response()->json(['error' => 'An error occurred while fetching anime data'], 500);
        }
    }

    private function verifySeasonRelationship(int $accessId, int $seasonId): bool
    {
        try {
            $hasRelatedEntry = AnimeMap::where('id', $accessId)
                ->whereHas('relatedEntries', function ($query) use ($seasonId) {
                    $query->where('anime_id', $seasonId);
                })
                ->exists();

            $hasChainEntry = AnimeMap::where('id', $accessId)
                ->whereHas('chains.entries', function ($query) use ($seasonId) {
                    $query->where('anime_id', $seasonId);
                })
                ->exists();

            return $hasRelatedEntry || $hasChainEntry;
        } catch (\Exception $e) {
            logger()->error('Error verifying season relationship', [
                'error' => $e->getMessage(),
                'access_id' => $accessId,
                'season_id' => $seasonId
            ]);
            abort(400, 'Season not found');
        }
    }

    private function checkAnimeType(int $seasonId): void
    {
        try {
            $animeType = AnidbAnime::where('id', $seasonId)
                ->value('type');

            if ($animeType === 'Music Video' || $animeType === "unknown") {
                throw new Exception('Music videos or unknown type are not supported');
            }
        } catch (\Exception $e) {
            logger()->error('Error checking anime type', [
                'error' => $e->getMessage(),
                'season_id' => $seasonId
            ]);

            abort(500, 'Error checking anime type');
        }
    }

    /**
     * Format date string to readable format or null if invalid
     */
    private function formatDate(?string $date): ?string
    {
        if (empty($date) || $date === '1970-01-01T00:00:00.000000Z') {
            return null;
        }

        try {
            return Carbon::parse($date)->format('jS F, Y');
        } catch (\Exception $e) {
            return null;
        }
    }
}
