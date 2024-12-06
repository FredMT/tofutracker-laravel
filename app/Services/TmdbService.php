<?php

namespace App\Services;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\RateLimiter;

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

    /**
     * Handle rate limiting for API requests
     */
    private function handleRateLimit(): void
    {
        $executed = RateLimiter::attempt(
            'tmdb-api',
            self::MAX_REQUESTS_PER_SECOND,
            function () {
                // The request will be executed
            },
            1 // Time window in seconds
        );


        if (!$executed) {
            // If we couldn't execute, wait a bit and try again
            usleep(100000); // 100ms
            $this->handleRateLimit();
        }
    }

    public function getMovie(string $movieId)
    {
        $this->handleRateLimit();
        return $this->client->get("/movie/{$movieId}", [
            'language' => 'en-US',
            'append_to_response' => 'credits,external_ids,images,keywords,release_dates,similar,videos,translations,watch/providers,recommendations',
            'include_image_language' => 'en,null',
            'include_video_language' => 'en'
        ])->json();
    }

    public function getTv(string $movieId)
    {
        $this->handleRateLimit();
        return $this->client->get("/tv/{$movieId}", [
            'language' => 'en-US',
            'append_to_response' => 'aggregate_credits,external_ids,images,keywords,content_ratings,recommendations,similar,videos,translations,watch/providers',
            'include_image_language' => 'en,null',
            'include_video_language' => 'en'
        ]);
    }

    public function getSeason(int $tvShowId, int $seasonNumber)
    {
        $this->handleRateLimit();
        return $this->client->get("/tv/{$tvShowId}/season/{$seasonNumber}", [
            'language' => 'en-US',
            'append_to_response' => 'credits,external_ids,images,videos'
        ])->json();
    }

    public function getTrendingMovies()
    {
        $this->handleRateLimit();
        return $this->client->get('/trending/movie/day', [
            'language' => 'en-US',
        ])->json();
    }

    public function getTrendingTv()
    {
        $this->handleRateLimit();
        return $this->client->get('/trending/tv/day', [
            'language' => 'en-US',
        ])->json();
    }

    public function getTrendingAll()
    {
        $movies = $this->getTrendingMovies();
        $tv = $this->getTrendingTv();

        return [
            'movies' => $movies['results'] ?? [],
            'tv' => $tv['results'] ?? [],
        ];
    }
}
