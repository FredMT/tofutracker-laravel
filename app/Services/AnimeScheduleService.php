<?php

namespace App\Services;

use App\Models\AnimeScheduleMap;
use Exception;
use Illuminate\Http\Client\RequestException;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AnimeScheduleService
{
    private string $baseUrl = 'https://animeschedule.net/api/v3';

    private string $bearerToken;

    private int $requestsRemaining = 120;

    private int $rateLimitReset = 0;

    private int $maxRetries = 3;

    public function __construct()
    {
        $this->bearerToken = config('services.animeschedule.bearer');

        if (empty($this->bearerToken)) {
            Log::error('AnimeSchedule API bearer token is not configured');
        }
    }

    /**
     * Get the anime schedule for a specific year and week
     */
    public function getWeeklySchedule(?int $year = null, ?int $week = null): Collection
    {
        $year = $year ?? now()->year;
        $week = $week ?? now()->weekOfYear();

        $response = $this->makeRequest('timetables/sub', [
            'year' => $year,
            'week' => $week,
        ]);

        return collect($response);
    }

    /**
     * Get detailed information about an anime by its route
     */
    public function getAnimeDetails(string $route): array
    {
        $response = $this->makeRequest("anime/{$route}");

        return $response;
    }

    /**
     * Extract AniDB ID from anime details
     */
    public function extractAnidbId(array $animeDetails): ?int
    {
        if (! isset($animeDetails['websites']['anidb'])) {
            return null;
        }

        $anidbUrl = $animeDetails['websites']['anidb'];
        preg_match('/anidb\.net\/anime\/(\d+)/', $anidbUrl, $matches);

        if (! isset($matches[1])) {
            Log::info("Could not extract AniDB ID from URL: {$anidbUrl}");

            return null;
        }

        return (int) $matches[1];
    }

    /**
     * Get all scheduled anime with their AniDB IDs for a specific week
     * Skips anime without AniDB IDs and avoids fetching details for routes that already exist
     * Only includes episodes with future dates
     */
    public function getScheduledAnimeWithAnidbIds(?int $year = null, ?int $week = null): Collection
    {
        $year = $year ?? now()->year;
        $week = $week ?? now()->weekOfYear();

        $schedules = $this->getWeeklySchedule($year, $week);
        $result = collect();

        // Get all existing routes with their mapping data
        $existingRouteMap = AnimeScheduleMap::pluck('animeschedule_id', 'animeschedule_route')->toArray();

        foreach ($schedules as $anime) {
            if (! $this->isAnimeValid($anime)) {
                continue;
            }

            $route = $anime['route'];

            // If we already have a mapping for this route, use it
            if ($this->handleExistingMapping($route, $existingRouteMap, $anime, $result, $year, $week)) {
                continue;
            }

            $this->processNewAnime($route, $anime, $result, $year, $week);
        }

        return $result;
    }

    /**
     * Check if anime has valid data for processing
     */
    private function isAnimeValid(array $anime): bool
    {
        if (! isset($anime['route'])) {
            return false;
        }

        // Check if the episode date exists and is in the future
        if (! isset($anime['episodeDate']) || empty($anime['episodeDate'])) {
            return false;
        }

        try {
            $episodeDate = Carbon::parse($anime['episodeDate']);
            if ($episodeDate->isPast()) {
                return false;
            }
        } catch (Exception $e) {
            return false;
        }

        return true;
    }

    /**
     * Handle anime that already has a mapping in the database
     */
    private function handleExistingMapping(string $route, array $existingRouteMap, array $anime, Collection &$result, int $year, int $week): bool
    {
        if (isset($existingRouteMap[$route])) {
            $animeScheduleId = $existingRouteMap[$route];

            $result->push([
                'animeschedule_id' => $animeScheduleId,
                'title' => $anime['title'] ?? null,
                'episode_date' => $this->formatEpisodeDate($anime['episodeDate'] ?? null),
                'year' => $year,
                'week' => $week,
            ]);

            return true;
        }

        return false;
    }

    /**
     * Process a new anime that doesn't have an existing mapping
     */
    private function processNewAnime(string $route, array $anime, Collection &$result, int $year, int $week): void
    {
        try {
            $this->checkRateLimit();

            // Get detailed information about the anime
            $details = $this->getAnimeDetails($route);

            // Extract the AnimeShedule ID and AniDB ID from the details
            $animeScheduleId = $details['id'] ?? null;
            $anidbId = $this->extractAnidbId($details);

            // Only include anime with valid AniDB IDs
            if ($anidbId) {
                // Store the mapping
                $this->storeAnimeScheduleMap($animeScheduleId, $route, $anidbId);

                $result->push([
                    'animeschedule_id' => $animeScheduleId,
                    'title' => $anime['title'] ?? null,
                    'episode_date' => $this->formatEpisodeDate($anime['episodeDate'] ?? null),
                    'year' => $year,
                    'week' => $week,
                ]);
            }
        } catch (Exception $e) {
            Log::error("Failed to get details for anime {$route}: ".$e->getMessage());
        }
    }

    /**
     * Store a mapping between AnimeSchedule ID, route, and AniDB ID
     * Returns true if a new mapping was created, false otherwise
     */
    private function storeAnimeScheduleMap(string $animeScheduleId, string $route, int $anidbId): bool
    {
        try {
            // Log the data being stored
            Log::info("Storing map: AnimeShedule ID {$animeScheduleId}, Route {$route}, AniDB ID {$anidbId}");

            $map = AnimeScheduleMap::updateOrCreate(
                ['animeschedule_id' => $animeScheduleId],
                [
                    'animeschedule_route' => $route,
                    'anidb_id' => $anidbId,
                ]
            );

            // Check if this was a new record or an update
            return $map->wasRecentlyCreated;
        } catch (Exception $e) {
            Log::error('Failed to store anime schedule map: '.$e->getMessage());

            return false;
        }
    }

    /**
     * Format the episode date to ensure it's in the correct format
     */
    private function formatEpisodeDate(?string $date): ?string
    {
        if (empty($date)) {
            return null;
        }

        try {
            return Carbon::parse($date)->toDateTimeString();
        } catch (Exception $e) {
            Log::warning("Failed to parse episode date: {$date}");

            return null;
        }
    }

    /**
     * Make an API request to the AnimeShedule API with retry logic
     */
    private function makeRequest(string $endpoint, array $queryParams = []): array
    {
        $this->checkRateLimit();

        $url = "{$this->baseUrl}/{$endpoint}";
        $attempts = 0;

        while ($attempts < $this->maxRetries) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => "Bearer {$this->bearerToken}",
                ])->get($url, $queryParams);

                $this->updateRateLimitInfo($response);

                if ($response->successful()) {
                    return $response->json();
                }

                // Handle rate limiting specifically
                if ($response->status() === 429) {
                    $retryAfter = $response->header('Retry-After', 60);
                    Log::warning("Rate limited by AnimeSchedule API. Retrying after {$retryAfter} seconds.");
                    sleep((int) $retryAfter);
                    $attempts++;

                    continue;
                }

                throw new RequestException($response);
            } catch (Exception $e) {
                $attempts++;

                if ($attempts >= $this->maxRetries) {
                    Log::error("Failed to make request to {$url} after {$this->maxRetries} attempts: ".$e->getMessage());
                    throw $e;
                }

                $backoff = pow(2, $attempts);
                Log::warning("Request to {$url} failed. Retrying in {$backoff} seconds...");
                sleep($backoff);
            }
        }

        throw new Exception("Failed to make request to {$url} after {$this->maxRetries} attempts");
    }

    /**
     * Update rate limit information from response headers
     */
    private function updateRateLimitInfo($response): void
    {
        $this->requestsRemaining = (int) $response->header('X-RateLimit-Remaining', 0);
        $this->rateLimitReset = (int) $response->header('X-RateLimit-Reset', 0);
    }

    /**
     * Check if we need to wait before making another request
     */
    private function checkRateLimit(): void
    {
        if ($this->requestsRemaining <= 0) {
            $now = time();
            $waitTime = max(0, $this->rateLimitReset - $now);

            if ($waitTime > 0) {
                Log::info("Rate limit reached, waiting for {$waitTime} seconds");
                sleep($waitTime + 1); // Add 1 second buffer
            }
        }
    }
}
