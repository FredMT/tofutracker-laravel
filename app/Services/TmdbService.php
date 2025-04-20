<?php

namespace App\Services;

use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeMap;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TmdbService
{
    private PendingRequest $client;

    private string $baseUrl = 'https://api.themoviedb.org/3';

    public function __construct()
    {
        $this->client = Http::withHeaders([
            'Accept' => 'application/json',
        ])->baseUrl($this->baseUrl)->withQueryParameters([
            'api_key' => config('services.tmdb.key'),
        ]);
    }

    public function getMovieBasic(string $id)
    {
        try {
            return Cache::remember("tmdb_movie_basic_{$id}", now()->addMonth(), function () use ($id) {

                $response = $this->client->get("/movie/{$id}");

                $movieData = $response->json();

                return [
                    'title' => $movieData['title'],
                    'poster_path' => $movieData['poster_path'],
                    'genres' => collect($movieData['genres'])->map(fn ($genre) => [
                        'id' => $genre['id'],
                        'name' => $genre['name'],
                    ]),
                    'release_date' => substr($movieData['release_date'], 0, 4),
                ];
            });
        } catch (\Exception $e) {
            logger()->error('TMDB API error: '.$e->getMessage());
            throw $e;
        }
    }

    public function getTvBasic(string $id)
    {
        try {
            return Cache::remember("tmdb_tv_basic_{$id}", now()->addDay(), function () use ($id) {

                $response = $this->client->get("/tv/{$id}");

                $tvData = $response->json();

                return [
                    'title' => $tvData['name'],
                    'poster_path' => $tvData['poster_path'],
                    'genres' => collect($tvData['genres'])->map(fn ($genre) => [
                        'id' => $genre['id'],
                        'name' => $genre['name'],
                    ]),
                    'release_date' => substr($tvData['first_air_date'], 0, 4),
                    'popularity' => $tvData['popularity'],
                ];
            });
        } catch (\Exception $e) {
            logger()->error('TMDB API error: '.$e->getMessage());
            throw $e;
        }
    }

    public function getMovie(string $id, ?string $etag = null)
    {
        try {
            $request = $this->client;

            if ($etag) {
                $request = $request->withHeaders([
                    'If-None-Match' => $etag,
                ]);
            }

            $response = $request->get("/movie/{$id}", [
                'append_to_response' => 'credits,external_ids,images,keywords,release_dates,similar,videos,translations,watch/providers,recommendations',
                'include_image_language' => 'en,null',
                'include_video_language' => 'en',
            ]);

            if ($response->status() === 304) {
                Log::info("TMDB movie ID {$id} not modified");

                return null;
            }

            return [
                'data' => $response->json(),
                'etag' => $response->header('etag'),
            ];
        } catch (\Exception $e) {
            logger()->error('TMDB API error: '.$e->getMessage());
            throw $e;
        }
    }

    public function getMovieAnime(string $id, ?string $etag = null)
    {
        try {
            $request = $this->client;

            if ($etag) {
                $request = $request->withHeaders([
                    'If-None-Match' => $etag,
                ]);
            }

            $response = $request->get("/movie/{$id}", [
                'append_to_response' => 'images,recommendations,videos,release_dates',
                'include_image_language' => 'en,null',
                'include_video_language' => 'en',
            ]);

            if ($response->status() === 304) {
                Log::info("TMDB movie ID {$id} not modified");

                return null;
            }

            $data = $response->json();

            $highestVotedLogo = collect($data['images']['logos'])->sortByDesc('vote_count')->first();
            $data['logo_path'] = $highestVotedLogo['file_path'];
            unset($data['images']);

            $usCertification = collect($data['release_dates']['results'])->firstWhere('iso_3166_1', 'US');
            $data['certification'] = $usCertification['release_dates'][0]['certification'];
            unset($data['release_dates']);

            $data['year'] = substr($data['release_date'], 0, 4);

            return [
                'data' => $data,
                'etag' => $response->header('etag'),
            ];
        } catch (\Exception $e) {
            logger()->error('TMDB API error: '.$e->getMessage());
            throw $e;
        }
    }

    public function getTv(string $id, ?string $etag = null)
    {
        try {
            $request = $this->client;

            if ($etag) {
                $request = $request->withHeaders([
                    'If-None-Match' => $etag,
                ]);
            }

            $response = $request->get("/tv/{$id}", [
                'append_to_response' => 'aggregate_credits,external_ids,images,keywords,content_ratings,similar,videos,translations,watch/providers,recommendations',
                'include_image_language' => 'en,null',
                'include_video_language' => 'en',
            ]);

            if ($response->status() === 304) {
                Log::info("TMDB TV show ID {$id} not modified");

                return null;
            }

            return [
                'data' => $response->json(),
                'etag' => $response->header('etag'),
            ];
        } catch (\Exception $e) {
            logger()->error('TMDB API error: '.$e->getMessage());
            throw $e;
        }
    }

    public function getTvAnime(string $id): array
    {
        try {

            $response = $this->client->get("/tv/{$id}", [
                'append_to_response' => 'images,recommendations,videos,content_ratings',
                'include_image_language' => 'en,null',
                'include_video_language' => 'en',
            ]);

            $data = $response->json();

            try {
                $logos = $data['images']['logos'] ?? [];
                $highestVotedLogo = collect($logos)->sortByDesc('vote_count')->first();
                $data['logo_path'] = $highestVotedLogo['file_path'] ?? null;
            } catch (\Exception $e) {
                logger()->warning("Failed to extract logo path for TV show ID: {$id}", [
                    'error' => $e->getMessage(),
                ]);
                $data['logo_path'] = null;
            }
            unset($data['images']);

            try {
                $contentRatings = $data['content_ratings']['results'] ?? [];
                $usRating = collect($contentRatings)->firstWhere('iso_3166_1', 'US');
                $data['certification'] = $usRating['rating'] ?? null;
            } catch (\Exception $e) {
                logger()->warning("Failed to extract content rating for TV show ID: {$id}", [
                    'error' => $e->getMessage(),
                ]);
                $data['content_rating'] = null;
            }
            unset($data['content_ratings']);
            unset($data['seasons']);

            try {
                $data['title'] = $data['name'] ?? null;
                unset($data['name']);
            } catch (\Exception $e) {
                logger()->warning("Failed to set title for TV show ID: {$id}", [
                    'error' => $e->getMessage(),
                ]);
                $data['title'] = null;
            }

            return [
                'data' => $data,
                'etag' => $response->header('etag'),
            ];
        } catch (\Exception $e) {
            logger()->error('TMDB API error: '.$e->getMessage());
            throw $e;
        }
    }

    public function getSeason(int $tvShowId, int $seasonNumber, ?string $etag = null)
    {
        try {
            $request = $this->client;

            if ($etag) {
                $request = $request->withHeaders([
                    'If-None-Match' => $etag,
                ]);
            }

            $response = $request->get("/tv/{$tvShowId}/season/{$seasonNumber}", [
                'language' => 'en-US',
                'append_to_response' => 'credits,external_ids,images,videos',
            ]);

            if ($response->status() === 304) {
                return null;
            }

            return [
                'data' => $response->json(),
                'etag' => $response->header('etag'),
            ];
        } catch (\Exception $e) {
            logger()->error('TMDB API error: '.$e->getMessage());
            throw $e;
        }
    }

    public function getTrendingMovies()
    {

        return $this->client->get('/trending/movie/day', [
            'language' => 'en-US',
        ])->json();
    }

    public function getTrendingTv()
    {

        return $this->client->get('/trending/tv/day', [
            'language' => 'en-US',
        ])->json();
    }

    public function getTrendingAll(): array
    {
        return cache()->remember('trending_all', now()->addDay(), function () {
            $movies = $this->getTrendingMovies();
            $tv = $this->getTrendingTv();

            return [
                'movies' => $movies['results'] ?? [],
                'tv' => $tv['results'] ?? [],
            ];
        });
    }

    public function getTrendingAllPaginated(int $page = 1): array
    {
        try {

            $response = $this->client->get('/trending/all/day', [
                'language' => 'en-US',
                'page' => $page,
            ]);

            if (! $response->successful()) {
                throw new \Exception('TMDB trending request failed');
            }

            $data = $response->json();

            $data['results'] = collect($data['results'])
                ->filter(fn ($item) => $item['media_type'] !== 'person')
                ->values()
                ->all();

            return $data;
        } catch (\Exception $e) {
            logger()->error('TMDB Trending API error: '.$e->getMessage());
            throw $e;
        }
    }

    public function getTrendingTvPaginated(int $page = 1): array
    {
        $CACHE_KEY = 'trending_tv_paginated_'.$page;
        $CACHE_TTL = seconds_until('tomorrow 8 am');

        return cache()->remember($CACHE_KEY, $CACHE_TTL, function () use ($page) {
            try {
                $response = $this->client->get('/trending/tv/day', [
                    'language' => 'en-US',
                    'page' => $page,
                ]);

                if (! $response->successful()) {
                    throw new \Exception('TMDB trending TV request failed');
                }

                return $response->json();
            } catch (\Exception $e) {
                logger()->error('TMDB Trending TV API error: '.$e->getMessage());
                throw $e;
            }
        });
    }

    public function getRandomTrendingBackdropImage(): ?string
    {
        $CACHE_KEY = 'trending_backdrops';
        $CACHE_TTL = seconds_until('tomorrow 8 am');

        return cache()->remember($CACHE_KEY, $CACHE_TTL, function () {
            $trending = $this->getTrendingAll();
            $allBackdrops = array_merge($trending['movies'], $trending['tv']);

            return collect($allBackdrops)
                ->pluck('backdrop_path')
                ->filter()
                ->values()
                ->all();
        })[array_rand(cache()->get($CACHE_KEY, []))] ?? null;
    }

    public function getBackdropAndLogoForAnidbId(int $anidbId): ?array
    {
        try {
            $anidbAnime = AnidbAnime::find($anidbId);

            if (! $anidbAnime) {
                return null;
            }

            $mapId = $anidbAnime->map;
            if (! $mapId) {
                return null;
            }

            $animeMap = AnimeMap::find($mapId);
            if (! $animeMap) {
                return null;
            }

            $tmdbModel = $animeMap->getTmdbModel();
            if (! $tmdbModel) {
                return null;
            }

            return [
                'backdrop_path' => $tmdbModel->backdrop ?? '',
                'logo_path' => $tmdbModel->highestVotedLogoPath ?? '',
            ];

        } catch (\Exception $e) {
            logger()->error("Error getting backdrop and logo for AniDB ID {$anidbId}: ".$e->getMessage());

            return null;
        }
    }

    public function search(string $query, int $page = 1): array
    {
        try {

            $response = $this->client->get('/search/multi', [
                'query' => $query,
                'include_adult' => false,
                'language' => 'en-US',
                'page' => $page,
            ]);

            if (! $response->successful()) {
                throw new \Exception('TMDB search request failed');
            }

            return $response->json();
        } catch (\Exception $e) {
            logger()->error('TMDB Search API error: '.$e->getMessage());
            throw $e;
        }
    }

    public function getMediaChanges(string $type = 'movie', int $page = 1): array
    {
        try {
            if (! in_array($type, ['movie', 'tv'])) {
                throw new \InvalidArgumentException('Type must be either "movie" or "tv"');
            }

            $today = now()->format('Y-m-d');
            $yesterday = now()->subDay()->format('Y-m-d');

            $response = $this->client->get("/{$type}/changes", [
                'start_date' => $yesterday,
                'end_date' => $today,
                'page' => $page,
            ]);

            if (! $response->successful()) {
                throw new \Exception("TMDB {$type} changes request failed");
            }

            return $response->json();
        } catch (\Exception $e) {
            logger()->error("TMDB {$type} Changes API error: ".$e->getMessage(), [
                'type' => $type,
                'page' => $page,
                'start_date' => $yesterday,
                'end_date' => $today,
            ]);
            throw $e;
        }
    }

    public function getCreditsForPerson(int $personId): ?array
    {
        try {

            $response = $this->client->get("/person/{$personId}", [
                'append_to_response' => 'combined_credits',
                'language' => 'en-US',
            ]);

            return $response->json();
        } catch (\Exception $e) {
            logger()->error('TMDB Credits API error: '.$e->getMessage());

            return null;
        }
    }

    public function getAiringTvShows(int $timeframeInDays = 30): array
    {
        try {
            $today = now()->format('Y-m-d');
            $endDate = now()->addDays($timeframeInDays)->format('Y-m-d');

            Log::info("Fetching TV shows airing between {$today} and {$endDate}");

            $results = [];
            $totalPages = 1;
            $currentPage = 1;
            $processedIds = [];

            do {
                $response = $this->client->get('/discover/tv', [
                    'air_date.gte' => $today,
                    'air_date.lte' => $endDate,
                    'include_adult' => false,
                    'include_null_first_air_dates' => false,
                    'language' => 'en-US',
                    'page' => $currentPage,
                    'sort_by' => 'vote_count.desc',
                ]);

                if (! $response->successful()) {
                    Log::error('TMDB Airing TV Shows API error: Failed to fetch page '.$currentPage, [
                        'status' => $response->status(),
                        'response' => $response->body(),
                    ]);
                    break;
                }

                $data = $response->json();
                $totalPages = $data['total_pages'] ?? 1;

                foreach ($data['results'] as $show) {
                    $showId = $show['id'];

                    if ($show['vote_count'] <= 10) {
                        Log::info("Stopping at show ID: {$showId} with vote_count: {$show['vote_count']}");
                        break 2;
                    }

                    if (! in_array($showId, $processedIds)) {
                        $processedIds[] = $showId;
                        $results[] = $show;
                    }
                }

                $currentPage++;
            } while ($currentPage <= $totalPages);

            return [
                'results' => $results,
                'total_pages' => $totalPages,
                'total_results' => count($results),
            ];
        } catch (\Exception $e) {
            Log::error('TMDB Airing TV Shows API error: '.$e->getMessage());
            throw $e;
        }
    }
}
