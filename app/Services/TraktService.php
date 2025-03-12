<?php

namespace App\Services;

use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TraktService
{
    private string $baseUrl = 'https://api.trakt.tv';
    private array $headers;

    public function __construct()
    {
        $this->headers = [
            'Content-Type' => 'application/json',
            'trakt-api-version' => config('services.trakt.trakt_api_version'),
            'trakt-api-key' => config('services.trakt.trakt_api_key'),
        ];
    }

    /**
     * Get all TV shows and their episodes airing for the next X days
     *
     * @param string $startDate The start date in YYYY-MM-DD format
     * @param int $days The number of days to fetch
     * @return array The response from the Trakt API
     * @throws \Exception If the API request fails
     */
    public function getShowsCalendar(string $startDate, int $days = 30): array
    {
        $url = "{$this->baseUrl}/calendars/all/shows/{$startDate}/{$days}";

        $response = Http::withHeaders($this->headers)->get($url);

        if (!$response->successful()) {
            Log::error('Failed to fetch data from Trakt API', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            throw new \Exception('Failed to fetch data from Trakt API: ' . $response->status());
        }

        return $response->json();
    }

    /**
     * Get details for a specific TV show
     *
     * @param string $id The Trakt ID or slug of the show
     * @return array The response from the Trakt API
     * @throws \Exception If the API request fails
     */
    public function getShowDetails(string $id): array
    {
        $url = "{$this->baseUrl}/shows/{$id}?extended=full";

        $response = Http::withHeaders($this->headers)->get($url);

        if (!$response->successful()) {
            Log::error('Failed to fetch show details from Trakt API', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            throw new \Exception('Failed to fetch show details from Trakt API: ' . $response->status());
        }

        return $response->json();
    }

    /**
     * Get details for a specific episode
     *
     * @param string $showId The Trakt ID or slug of the show
     * @param int $season The season number
     * @param int $episode The episode number
     * @return array The response from the Trakt API
     * @throws \Exception If the API request fails
     */
    public function getEpisodeDetails(string $showId, int $season, int $episode): array
    {
        $url = "{$this->baseUrl}/shows/{$showId}/seasons/{$season}/episodes/{$episode}?extended=full";

        $response = Http::withHeaders($this->headers)->get($url);

        if (!$response->successful()) {
            Log::error('Failed to fetch episode details from Trakt API', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

            throw new \Exception('Failed to fetch episode details from Trakt API: ' . $response->status());
        }

        return $response->json();
    }
}
