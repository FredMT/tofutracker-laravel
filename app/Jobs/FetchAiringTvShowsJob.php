<?php

namespace App\Jobs;

use App\Models\Anime\AnimeMap;
use App\Models\TmdbSchedule;
use App\Models\TvShow;
use App\Models\TvEpisode;
use App\Services\TmdbService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class FetchAiringTvShowsJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    public $timeout = 0; // 5 minutes

    private int $timeframeInDays = 30;

    public function __construct(int $timeframeInDays = 30)
    {
        $this->timeframeInDays = $timeframeInDays;
    }

    public function handle(TmdbService $tmdbService): void
    {
        try {
            Log::info('Starting to fetch TMDB airing TV shows...');

            $scheduleData = [];
            $tvShowsToUpdate = [];
            $processedIds = [];

            // Get today's date and timeframe in days later in YYYY-MM-DD format
            $today = Carbon::today()->format('Y-m-d');
            $endDate = Carbon::today()->addDays($this->timeframeInDays)->format('Y-m-d');

            Log::info("Fetching TV shows airing between {$today} and {$endDate}");

            // STEP 1: Collect all TV show IDs and create TvShow records using TmdbService
            $airingTvShows = $tmdbService->getAiringTvShows($this->timeframeInDays);

            $animeMappedIds = AnimeMap::where('tmdb_type', 'tv')
                ->pluck('most_common_tmdb_id')
                ->toArray();

            // Process each TV show
            foreach ($airingTvShows['results'] as $show) {
                $showId = $show['id'];

                // Skip if this show is mapped as anime
                if (in_array($showId, $animeMappedIds)) {
                    Log::info("Skipping TV show ID: {$showId} as it is mapped as anime in AnimeMap");
                    continue;
                }

                // Only process shows with vote_count greater than 10
                if ($show['vote_count'] > 10 && !in_array($showId, $processedIds)) {
                    $processedIds[] = $showId;

                    // Find or create the TV show model
                    $tvShow = TvShow::firstOrCreate(['id' => $showId], [
                        'data' => ['name' => $show['name']],
                        'etag' => "a"
                    ]);

                    // Add to schedule data for batch insert
                    $scheduleData[] = [
                        'tmdb_id' => $showId,
                        'tmdb_type' => 'tv',
                        'vote_count' => $show['vote_count'],
                    ];

                    // Add to the list of TV shows to update later
                    $tvShowsToUpdate[] = $tvShow;
                }
            }

            // STEP 2: Perform batch insert of all schedule data
            if (!empty($scheduleData)) {
                // First, clear existing schedules days in the past
                TmdbSchedule::where('tmdb_type', 'tv')
                    ->where('air_date', '<', today()->startOfDay())
                    ->delete();

                // Then insert the new schedules
                DB::table('tmdb_schedules')->insert($scheduleData);
            } else {
                Log::warning('No TV shows found to insert into schedule table.');
            }

            // STEP 3: Dispatch update jobs for all TV shows
            foreach ($tvShowsToUpdate as $tvShow) {
                UpdateTvShow::dispatch($tvShow, []);
            }

        } catch (\Exception $e) {
            Log::error('An error occurred while fetching TMDB airing TV shows', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e; // Re-throw to trigger job failure
        }
    }
}
