<?php

namespace App\Http\Controllers;

use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeMappingExternalId;
use App\Services\TmdbService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class PeopleController extends Controller
{
    protected TmdbService $tmdbService;

    public function __construct(TmdbService $tmdbService)
    {
        $this->tmdbService = $tmdbService;
    }

    public function show(string $id)
    {
        $personData = Cache::remember(
            "person_details_{$id}",
            seconds_until('next sunday at 8 am'),
            function () use ($id) {
                $jsonData = json_encode($this->tmdbService->getPersonDetails($id));

                return Collection::fromJson($jsonData);
            }
        );

        $movieCredits = $personData['movie_credits'] ?? [];
        $tvCredits = $personData['tv_credits'] ?? [];

        // Process credits and separate anime from regular movies/TV
        $processedCredits = $this->processAndCategorizeCredits($movieCredits['cast'] ?? [], $tvCredits['cast'] ?? [], $movieCredits['crew'] ?? [], $tvCredits['crew'] ?? []);

        $userWatchedStats = $this->getUserWatchedStats(
            $processedCredits['movies']['cast'],
            $processedCredits['tv']['cast'],
            $processedCredits['anime']['cast']
        );

        return Inertia::render('Person', [
            'person' => $personData->only([
                'id', 'name', 'profile_path', 'biography', 'birthday',
                'place_of_birth', 'gender', 'known_for_department',
            ])->toArray(),
            'external_ids' => $personData['external_ids'] ?? [],
            'credits' => [
                'movie_cast' => array_values($processedCredits['movies']['cast']),
                'movie_crew' => array_values($processedCredits['movies']['crew']),
                'tv_cast' => array_values($processedCredits['tv']['cast']),
                'tv_crew' => array_values($processedCredits['tv']['crew']),
                'anime_cast' => array_values($processedCredits['anime']['cast']),
                'anime_crew' => array_values($processedCredits['anime']['crew']),
            ],
            'watchedStats' => Inertia::defer(function () use ($userWatchedStats) {
                return $userWatchedStats;
            }),
        ]);
    }

    private function processAndCategorizeCredits(array $movieCast, array $tvCast, array $movieCrew, array $tvCrew): array
    {
        $result = [
            'movies' => [
                'cast' => [],
                'crew' => [],
            ],
            'tv' => [
                'cast' => [],
                'crew' => [],
            ],
            'anime' => [
                'cast' => [],
                'crew' => [],
            ],
        ];

        // Get all TMDB IDs from both movie and TV credits
        $movieIds = array_column($movieCast, 'id');
        $tvIds = array_column($tvCast, 'id');
        $allTmdbIds = array_merge($movieIds, $tvIds);

        // Get anime mappings for these IDs
        $animeMappings = AnimeMappingExternalId::whereIn('themoviedb_id', $allTmdbIds)
            ->whereNotNull('anidb_id')
            ->get()
            ->keyBy('themoviedb_id');

        // Get AnidbAnime records for the found mappings
        if ($animeMappings->isNotEmpty()) {
            $anidbIds = $animeMappings->pluck('anidb_id')->unique();
            $anidbAnimes = AnidbAnime::whereIn('id', $anidbIds)
                ->whereNotNull('map_id')
                ->get()
                ->keyBy('id');

            // Create lookup maps
            $animeMapInfo = [];
            foreach ($animeMappings as $tmdbId => $mapping) {
                $anidbAnime = $anidbAnimes->get($mapping->anidb_id);
                if ($anidbAnime && $anidbAnime->map_id) {
                    $animeMapInfo[$tmdbId] = [
                        'is_anime' => true,
                        'map_id' => $anidbAnime->map_id,
                    ];
                }
            }

            // Process movie cast
            $result['movies']['cast'] = $this->processMovieCast($movieCast, $animeMapInfo);

            // Process movie crew
            $result['movies']['crew'] = $this->processMovieCrew($movieCrew, $animeMapInfo);

            // Process TV cast
            $result['tv']['cast'] = $this->processTvCast($tvCast, $animeMapInfo);

            // Process TV crew
            $result['tv']['crew'] = $this->processTvCrew($tvCrew, $animeMapInfo);

            // Process anime cast (from both movie and TV sources)
            $result['anime']['cast'] = array_merge(
                $this->processAnimeCast($movieCast, $animeMapInfo, 'movie'),
                $this->processAnimeCast($tvCast, $animeMapInfo, 'tv')
            );

            // Process anime crew (from both movie and TV sources)
            $result['anime']['crew'] = array_merge(
                $this->processAnimeCrew($movieCrew, $animeMapInfo, 'movie'),
                $this->processAnimeCrew($tvCrew, $animeMapInfo, 'tv')
            );
        } else {
            // If no anime mappings found, process normally
            $result['movies']['cast'] = $this->processMovieCast($movieCast, []);
            $result['movies']['crew'] = $this->processMovieCrew($movieCrew, []);
            $result['tv']['cast'] = $this->processTvCast($tvCast, []);
            $result['tv']['crew'] = $this->processTvCrew($tvCrew, []);
        }

        return $result;
    }

    private function processMovieCast(array $castData, array $animeMapInfo): array
    {
        $today = now()->format('Y-m-d');
        $nextYear = now()->addYear()->format('Y-m-d');

        return collect($castData)
            ->filter(function ($item) use ($animeMapInfo) {
                // Filter out items that are classified as anime
                return ! isset($animeMapInfo[$item['id'] ?? null]);
            })
            ->map(function ($item) use ($today, $nextYear) {
                $releaseDate = $item['release_date'] ?? null;

                return [
                    'backdrop_path' => $item['backdrop_path'] ?? null,
                    'character' => $item['character'] ?? '',
                    'id' => $item['id'] ?? null,
                    'poster_path' => $item['poster_path'] ?? null,
                    'year' => isset($releaseDate) ? substr($releaseDate, 0, 4) : null,
                    'title' => $item['title'] ?? '',
                    'popularity' => $item['popularity'] ?? 0,
                    'rating' => isset($item['vote_average']) ? round($item['vote_average'] * 10) / 10 : null,
                    'vote_count' => $item['vote_count'] ?? 0,
                    'release_date' => $releaseDate,
                    'priority' => $this->calculatePriority($releaseDate, $today, $nextYear),
                ];
            })
            ->groupBy('id')
            ->map(function ($group) {
                $first = $group->first();
                $first['character'] = $group->pluck('character')->filter()->unique()->implode(', ');

                return $first;
            })
            ->values()
            ->sortByDesc(function ($item) {
                return ($item['priority'] * 1000) + min(999, $item['popularity']);
            })
            ->map(function ($item) {
                unset($item['release_date']);

                return $item;
            })
            ->toArray();
    }

    private function processMovieCrew(array $crewData, array $animeMapInfo): array
    {
        $today = now()->format('Y-m-d');
        $nextYear = now()->addYear()->format('Y-m-d');

        return collect($crewData)
            ->filter(function ($item) use ($animeMapInfo) {
                // Filter out items that are classified as anime
                return ! isset($animeMapInfo[$item['id'] ?? null]);
            })
            ->map(function ($item) use ($today, $nextYear) {
                $releaseDate = $item['release_date'] ?? null;

                return [
                    'backdrop_path' => $item['backdrop_path'] ?? null,
                    'department' => $item['department'] ?? '',
                    'job' => $item['job'] ?? '',
                    'id' => $item['id'] ?? null,
                    'poster_path' => $item['poster_path'] ?? null,
                    'year' => isset($releaseDate) ? substr($releaseDate, 0, 4) : null,
                    'title' => $item['title'] ?? '',
                    'popularity' => $item['popularity'] ?? 0,
                    'rating' => isset($item['vote_average']) ? round($item['vote_average'] * 10) / 10 : null,
                    'vote_count' => $item['vote_count'] ?? 0,
                    'release_date' => $releaseDate,
                    'priority' => $this->calculatePriority($releaseDate, $today, $nextYear),
                ];
            })
            ->groupBy('id')
            ->map(function ($group) {
                $first = $group->first();
                $jobInfo = $group->map(function ($item) {
                    return $item['department'].': '.$item['job'];
                })->unique()->implode(', ');
                $first['department'] = $jobInfo;

                return $first;
            })
            ->values()
            ->sortByDesc(function ($item) {
                return ($item['priority'] * 1000) + min(999, $item['popularity']);
            })
            ->map(function ($item) {
                unset($item['release_date']);

                return $item;
            })
            ->toArray();
    }

    private function processTvCast(array $castData, array $animeMapInfo): array
    {
        $today = now()->format('Y-m-d');
        $nextYear = now()->addYear()->format('Y-m-d');

        return collect($castData)
            ->filter(function ($item) use ($animeMapInfo) {
                // Filter out items that are classified as anime
                return ! isset($animeMapInfo[$item['id'] ?? null]);
            })
            ->map(function ($item) use ($today, $nextYear) {
                $firstAirDate = $item['first_air_date'] ?? null;

                return [
                    'backdrop_path' => $item['backdrop_path'] ?? null,
                    'character' => $item['character'] ?? '',
                    'id' => $item['id'] ?? null,
                    'poster_path' => $item['poster_path'] ?? null,
                    'year' => isset($firstAirDate) ? substr($firstAirDate, 0, 4) : null,
                    'title' => $item['name'] ?? '',
                    'popularity' => $item['popularity'] ?? 0,
                    'rating' => isset($item['vote_average']) ? round($item['vote_average'] * 10) / 10 : null,
                    'vote_count' => $item['vote_count'] ?? 0,
                    'release_date' => $firstAirDate,
                    'priority' => $this->calculatePriority($firstAirDate, $today, $nextYear),
                ];
            })
            ->groupBy('id')
            ->map(function ($group) {
                $first = $group->first();
                $first['character'] = $group->pluck('character')->filter()->unique()->implode(', ');

                return $first;
            })
            ->values()
            ->sortByDesc(function ($item) {
                return ($item['priority'] * 1000) + min(999, $item['popularity']);
            })
            ->map(function ($item) {
                unset($item['release_date']);

                return $item;
            })
            ->toArray();
    }

    private function processTvCrew(array $crewData, array $animeMapInfo): array
    {
        $today = now()->format('Y-m-d');
        $nextYear = now()->addYear()->format('Y-m-d');

        return collect($crewData)
            ->filter(function ($item) use ($animeMapInfo) {
                // Filter out items that are classified as anime
                return ! isset($animeMapInfo[$item['id'] ?? null]);
            })
            ->map(function ($item) use ($today, $nextYear) {
                $firstAirDate = $item['first_air_date'] ?? null;

                return [
                    'backdrop_path' => $item['backdrop_path'] ?? null,
                    'department' => $item['department'] ?? '',
                    'job' => $item['job'] ?? '',
                    'id' => $item['id'] ?? null,
                    'poster_path' => $item['poster_path'] ?? null,
                    'year' => isset($firstAirDate) ? substr($firstAirDate, 0, 4) : null,
                    'title' => $item['name'] ?? '',
                    'popularity' => $item['popularity'] ?? 0,
                    'rating' => isset($item['vote_average']) ? round($item['vote_average'] * 10) / 10 : null,
                    'vote_count' => $item['vote_count'] ?? 0,
                    'release_date' => $firstAirDate,
                    'priority' => $this->calculatePriority($firstAirDate, $today, $nextYear),
                ];
            })
            ->groupBy('id')
            ->map(function ($group) {
                $first = $group->first();
                $jobInfo = $group->map(function ($item) {
                    return $item['department'].': '.$item['job'];
                })->unique()->implode(', ');
                $first['department'] = $jobInfo;

                return $first;
            })
            ->values()
            ->sortByDesc(function ($item) {
                return ($item['priority'] * 1000) + min(999, $item['popularity']);
            })
            ->map(function ($item) {
                unset($item['release_date']);

                return $item;
            })
            ->toArray();
    }

    private function processAnimeCast(array $castData, array $animeMapInfo, string $sourceType): array
    {
        $today = now()->format('Y-m-d');
        $nextYear = now()->addYear()->format('Y-m-d');
        $dateField = $sourceType === 'movie' ? 'release_date' : 'first_air_date';
        $titleField = $sourceType === 'movie' ? 'title' : 'name';

        return collect($castData)
            ->filter(function ($item) use ($animeMapInfo) {
                // Keep only items that are classified as anime
                return isset($animeMapInfo[$item['id'] ?? null]);
            })
            ->map(function ($item) use ($today, $nextYear, $dateField, $titleField, $animeMapInfo) {
                $releaseDate = $item[$dateField] ?? null;
                $mapId = $animeMapInfo[$item['id']]['map_id'] ?? null;

                return [
                    'backdrop_path' => $item['backdrop_path'] ?? null,
                    'character' => $item['character'] ?? '',
                    'id' => $mapId, // Use map_id from AnidbAnime as the ID
                    'original_id' => $item['id'], // Keep original TMDB ID for reference
                    'poster_path' => $item['poster_path'] ?? null,
                    'year' => isset($releaseDate) ? substr($releaseDate, 0, 4) : null,
                    'title' => $item[$titleField] ?? '',
                    'popularity' => $item['popularity'] ?? 0,
                    'rating' => isset($item['vote_average']) ? round($item['vote_average'] * 10) / 10 : null,
                    'vote_count' => $item['vote_count'] ?? 0,
                    'release_date' => $releaseDate,
                    'priority' => $this->calculatePriority($releaseDate, $today, $nextYear),
                ];
            })
            ->groupBy('id')
            ->map(function ($group) {
                $first = $group->first();
                $first['character'] = $group->pluck('character')->filter()->unique()->implode(', ');

                return $first;
            })
            ->values()
            ->sortByDesc(function ($item) {
                return ($item['priority'] * 1000) + min(999, $item['popularity']);
            })
            ->map(function ($item) {
                unset($item['release_date']);

                return $item;
            })
            ->toArray();
    }

    private function processAnimeCrew(array $crewData, array $animeMapInfo, string $sourceType): array
    {
        $today = now()->format('Y-m-d');
        $nextYear = now()->addYear()->format('Y-m-d');
        $dateField = $sourceType === 'movie' ? 'release_date' : 'first_air_date';
        $titleField = $sourceType === 'movie' ? 'title' : 'name';

        return collect($crewData)
            ->filter(function ($item) use ($animeMapInfo) {
                // Keep only items that are classified as anime
                return isset($animeMapInfo[$item['id'] ?? null]);
            })
            ->map(function ($item) use ($today, $nextYear, $dateField, $titleField, $animeMapInfo) {
                $releaseDate = $item[$dateField] ?? null;
                $mapId = $animeMapInfo[$item['id']]['map_id'] ?? null;

                return [
                    'backdrop_path' => $item['backdrop_path'] ?? null,
                    'department' => $item['department'] ?? '',
                    'job' => $item['job'] ?? '',
                    'id' => $mapId, // Use map_id from AnidbAnime as the ID
                    'original_id' => $item['id'], // Keep original TMDB ID for reference
                    'poster_path' => $item['poster_path'] ?? null,
                    'year' => isset($releaseDate) ? substr($releaseDate, 0, 4) : null,
                    'title' => $item[$titleField] ?? '',
                    'popularity' => $item['popularity'] ?? 0,
                    'rating' => isset($item['vote_average']) ? round($item['vote_average'] * 10) / 10 : null,
                    'vote_count' => $item['vote_count'] ?? 0,
                    'release_date' => $releaseDate,
                    'priority' => $this->calculatePriority($releaseDate, $today, $nextYear),
                ];
            })
            ->groupBy('id')
            ->map(function ($group) {
                $first = $group->first();
                $jobInfo = $group->map(function ($item) {
                    return $item['department'].': '.$item['job'];
                })->unique()->implode(', ');
                $first['department'] = $jobInfo;

                return $first;
            })
            ->values()
            ->sortByDesc(function ($item) {
                return ($item['priority'] * 1000) + min(999, $item['popularity']);
            })
            ->map(function ($item) {
                unset($item['release_date']);

                return $item;
            })
            ->toArray();
    }

    private function calculatePriority(?string $releaseDate, string $today, string $nextYear): int
    {
        if (! $releaseDate) {
            return 0;
        }

        if ($releaseDate >= $today && $releaseDate <= $nextYear) {
            return 3;
        }

        if ($releaseDate > $nextYear) {
            return 2;
        }

        if ($releaseDate >= now()->subMonths(3)->format('Y-m-d') && $releaseDate < $today) {
            return 1;
        }

        return 0;
    }

    private function getUserWatchedStats(array $movieCast, array $tvCast, array $animeCast = []): array
    {
        if (! Auth::check()) {
            return [
                'movies' => [
                    'watched' => 0,
                    'total' => count(array_unique(array_column($movieCast, 'id'))),
                ],
                'shows' => [
                    'watched' => 0,
                    'total' => count(array_unique(array_column($tvCast, 'id'))),
                ],
                'anime' => [
                    'watched' => 0,
                    'total' => count(array_unique(array_column($animeCast, 'id'))),
                ],
            ];
        }

        $user = Auth::user();

        $uniqueMovieIds = array_unique(array_column($movieCast, 'id'));
        $uniqueTvIds = array_unique(array_column($tvCast, 'id'));
        $uniqueAnimeIds = array_unique(array_column($animeCast, 'id'));

        $watchedMovies = $user->movies()
            ->whereIn('movie_id', $uniqueMovieIds)
            ->get();

        $watchedShows = $user->shows()
            ->whereIn('show_id', $uniqueTvIds)
            ->get();

        // Get the user's library
        $userLibrary = $user->library;

        // If the user has a library, get their anime collections
        $watchedAnime = collect();
        if ($userLibrary) {
            $watchedAnime = $user->animeCollections()
                ->whereIn('map_id', $uniqueAnimeIds)
                ->get();
        }

        return [
            'movies' => [
                'watched' => $watchedMovies->count(),
                'total' => count($uniqueMovieIds),
                'watched_ids' => $watchedMovies->pluck('movie_id')->toArray() ?? null,
            ],
            'shows' => [
                'watched' => $watchedShows->count(),
                'total' => count($uniqueTvIds),
                'watched_ids' => $watchedShows->pluck('show_id')->toArray() ?? null,
            ],
            'anime' => [
                'watched' => $watchedAnime->count(),
                'total' => count($uniqueAnimeIds),
                'watched_ids' => $watchedAnime->pluck('map_id')->toArray() ?? null,
            ],
        ];
    }
}
