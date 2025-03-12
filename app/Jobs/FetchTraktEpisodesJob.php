<?php

namespace App\Jobs;

use App\Models\TmdbSchedule;
use App\Models\TmdbScheduleEpisode;
use App\Services\TraktService;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FetchTraktEpisodesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $timeout = 300; // 5 minutes

    private int $timeframeInDays = 30;
    private string $cacheKey = 'trakt_episodes_calendar';

    public function __construct(int $timeframeInDays = 30)
    {
        $this->timeframeInDays = $timeframeInDays;
    }

    public function handle(TraktService $traktService): void
    {
        try {
            Log::info('Starting to fetch Trakt TV episodes...');

            // Get yesterday's date in YYYY-MM-DD format for the API call
            $yesterday = Carbon::yesterday()->format('Y-m-d');

            // Fetch data from Trakt API using the service
            $response = $traktService->getShowsCalendar($yesterday, $this->timeframeInDays);

            // Cache the response forever
            Cache::forever($this->cacheKey, $response);

            Log::info('Trakt TV episodes cached successfully.');

            // Process the cached data and store episodes
            $this->processAndStoreEpisodes();

            Log::info('Trakt TV episodes processed and stored successfully.');

        } catch (\Exception $e) {
            Log::error('An error occurred while fetching Trakt TV episodes', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e; // Re-throw to trigger job failure
        }
    }

    private function processAndStoreEpisodes(): void
    {
        // Get cached episodes
        $episodes = Cache::get($this->cacheKey, []);

        if (empty($episodes)) {
            Log::warning('No episodes found in cache.');
            return;
        }

        // Get all TMDB show IDs from the TmdbSchedule table
        $tmdbShowIds = TmdbSchedule::where('tmdb_type', 'tv')
            ->pluck('tmdb_id')
            ->toArray();

        Log::info('Found ' . count($tmdbShowIds) . ' TMDB show IDs in the schedule.');

        // Filter episodes to only include those with TMDB IDs in our database
        $episodesToInsert = [];

        foreach ($episodes as $episode) {
            // Check if the show has a TMDB ID and if it's in our database
            if (
                isset($episode['show']['ids']['tmdb']) &&
                in_array($episode['show']['ids']['tmdb'], $tmdbShowIds)
            ) {
                // Only add episodes that have all required data
                if (
                    isset($episode['show']['ids']['tmdb']) &&
                    isset($episode['episode']['season']) &&
                    isset($episode['episode']['number']) &&
                    isset($episode['episode']['ids']['tmdb']) &&
                    isset($episode['first_aired'])
                ) {
                    $episodesToInsert[] = [
                        'show_id' => $episode['show']['ids']['tmdb'],
                        'season_number' => $episode['episode']['season'],
                        'episode_number' => $episode['episode']['number'],
                        'episode_id' => $episode['episode']['ids']['tmdb'],
                        'episode_date' => Carbon::parse($episode['first_aired']),
                        'episode_name' => $episode['episode']['title'] ?? null,
                    ];
                }
            }
        }

        if (empty($episodesToInsert)) {
            Log::warning('No episodes to insert after filtering.');
            return;
        }

        Log::info('Preparing to insert ' . count($episodesToInsert) . ' episodes.');

        // Clear existing episodes
        TmdbScheduleEpisode::truncate();

        // Batch insert episodes
        foreach (array_chunk($episodesToInsert, 100) as $chunk) {
            DB::table('tmdb_schedule_episodes')->insert($chunk);
        }

        Log::info('Successfully inserted ' . count($episodesToInsert) . ' episodes.');
    }
}
