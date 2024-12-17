<?php

namespace App\Services;

use App\Models\AnimeMappingExternalId;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Log;

class TmdbService
{
    private PendingRequest $client;
    private string $baseUrl = 'https://api.themoviedb.org/3';
    private const MAX_REQUESTS_PER_SECOND = 45;

    public function __construct()
    {
        $this->client = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('services.tmdb.token'),
            'Accept' => 'application/json',
        ])->baseUrl($this->baseUrl);
    }


    public function getMovie(string $id): array
    {
        try {
            $response = Http::withToken(config('services.tmdb.token'))
                ->get("{$this->baseUrl}/movie/{$id}", [
                    'append_to_response' => 'credits,external_ids,images,keywords,release_dates,similar,videos,translations,watch/providers,recommendations',
                    'include_image_language' => 'en,null',
                    'include_video_language' => 'en'
                ]);

            return [
                'data' => $response->json(),
                'etag' => $response->header('etag')
            ];
        } catch (\Exception $e) {
            Log::error("TMDB API error: " . $e->getMessage());
            throw $e;
        }
    }

    public function getMovieAnime(string $id): array
    {
        try {
            $response = Http::withToken(config('services.tmdb.token'))
                ->get("{$this->baseUrl}/movie/{$id}", [
                    'append_to_response' => 'images,recommendations,videos,release_dates',
                    'include_image_language' => 'en,null',
                    'include_video_language' => 'en'
                ]);

            $data = $response->json();

            // Extract logo path
            $highestVotedLogo = collect($data['images']['logos'])->sortByDesc('vote_count')->first();
            $data['logo_path'] = $highestVotedLogo['file_path'];
            unset($data['images']);

            // Extract US certification
            $usCertification = collect($data['release_dates']['results'])->firstWhere('iso_3166_1', 'US');
            $data['certification'] = $usCertification['release_dates'][0]['certification'];
            unset($data['release_dates']);

            // Extract year from release_date
            $data['year'] = substr($data['release_date'], 0, 4);

            return [
                'data' => $data,
                'etag' => $response->header('etag')
            ];
        } catch (\Exception $e) {
            Log::error("TMDB API error: " . $e->getMessage());
            throw $e;
        }
    }

    public function getTv(string $id)
    {

        try {
            $response = Http::withToken(config('services.tmdb.token'))
                ->get("{$this->baseUrl}/tv/{$id}", [
                    'append_to_response' => 'aggregate_credits,external_ids,images,keywords,content_ratings,similar,videos,translations,watch/providers,recommendations',
                    'include_image_language' => 'en,null',
                    'include_video_language' => 'en'
                ]);

            return [
                'data' => $response->json(),
                'etag' => $response->header('etag')
            ];
        } catch (\Exception $e) {
            Log::error("TMDB API error: " . $e->getMessage());
            throw $e;
        }
    }

    public function getTvAnime(string $id): array
    {
        try {
            $response = Http::withToken(config('services.tmdb.token'))
                ->get("{$this->baseUrl}/tv/{$id}", [
                    'append_to_response' => 'images,recommendations,videos,content_ratings',
                    'include_image_language' => 'en,null',
                    'include_video_language' => 'en'
                ]);

            $data = $response->json();

            // Extract logo path
            try {
                $logos = $data['images']['logos'] ?? [];
                $highestVotedLogo = collect($logos)->sortByDesc('vote_count')->first();
                $data['logo_path'] = $highestVotedLogo['file_path'] ?? null;
            } catch (\Exception $e) {
                Log::warning("Failed to extract logo path for TV show ID: {$id}", [
                    'error' => $e->getMessage()
                ]);
                $data['logo_path'] = null;
            }
            unset($data['images']);

            // Extract US rating
            try {
                $contentRatings = $data['content_ratings']['results'] ?? [];
                $usRating = collect($contentRatings)->firstWhere('iso_3166_1', 'US');
                $data['certification'] = $usRating['rating'] ?? null;
            } catch (\Exception $e) {
                Log::warning("Failed to extract content rating for TV show ID: {$id}", [
                    'error' => $e->getMessage()
                ]);
                $data['content_rating'] = null;
            }
            unset($data['content_ratings']);
            unset($data['seasons']);

            // Set title
            try {
                $data['title'] = $data['name'] ?? null;
                unset($data['name']);
            } catch (\Exception $e) {
                Log::warning("Failed to set title for TV show ID: {$id}", [
                    'error' => $e->getMessage()
                ]);
                $data['title'] = null;
            }

            return [
                'data' => $data,
                'etag' => $response->header('etag')
            ];
        } catch (\Exception $e) {
            Log::error("TMDB API error: " . $e->getMessage());
            throw $e;
        }
    }

    public function getSeason(int $tvShowId, int $seasonNumber)
    {

        try {
            $response = $this->client->get("/tv/{$tvShowId}/season/{$seasonNumber}", [
                'language' => 'en-US',
                'append_to_response' => 'credits,external_ids,images,videos'
            ]);

            return [
                'data' => $response->json(),
                'etag' => $response->header('etag')
            ];
        } catch (\Exception $e) {
            Log::error("TMDB API error: " . $e->getMessage());
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

    public function getRandomTrendingBackdropImage(): ?string
    {
        return cache()->remember('trending_backdrops', now()->addDay(), function () {
            $trending = $this->getTrendingAll();
            $allBackdrops = array_merge($trending['movies'], $trending['tv']);

            return collect($allBackdrops)
                ->pluck('backdrop_path')
                ->filter()
                ->values()
                ->all();
        })[array_rand(cache()->get('trending_backdrops', []))] ?? null;
    }

    public function getBackdropAndLogoForAnidbId(int $anidbId): ?array
    {
        try {
            $externalId = AnimeMappingExternalId::where('anidb_id', $anidbId)
                ->whereNotNull('themoviedb_id')
                ->first();

            if (!$externalId) {
                return null;
            }

            $endpoint = $externalId->type === 'MOVIE' ? 'movie' : 'tv';

            $response = $this->client
                ->get("/{$endpoint}/{$externalId->themoviedb_id}/images", [
                    'include_image_language' => 'en,null'
                ]);

            if (!$response->successful()) {
                return null;
            }

            $data = $response->json();

            $backdrop = collect($data['backdrops'])
                ->sortByDesc('vote_count')
                ->first();

            $logo = collect($data['logos'])
                ->sortByDesc('vote_count')
                ->first();

            return [
                'backdrop_path' => $backdrop['file_path'] ?? null,
                'logo_path' => $logo['file_path'] ?? null
            ];
        } catch (\Exception $e) {
            Log::error("Error getting TMDB ID for AniDB ID {$anidbId}: " . $e->getMessage());
            return null;
        }
    }
}
