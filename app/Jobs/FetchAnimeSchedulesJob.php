<?php

namespace App\Jobs;

use App\Models\AnimeSchedule;
use App\Services\AnimeScheduleService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FetchAnimeSchedulesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    public $backoff = [30, 60, 120];

    public $timeout = 0;

    private const BATCH_SIZE = 100;

    protected ?int $year;

    protected ?int $week;

    public function __construct(?int $year = null, ?int $week = null)
    {
        $this->year = $year;
        $this->week = $week;
    }

    public function handle(AnimeScheduleService $animeScheduleService)
    {
        $year = $this->year ?? now()->year;
        $week = $this->week ?? now()->weekOfYear();

        Log::channel('animeschedulelog')->info("Starting to fetch anime schedules for year {$year}, week {$week}");

        try {
            $scheduledAnime = $animeScheduleService->getScheduledAnimeWithAnidbIds($year, $week);

            if ($scheduledAnime->isEmpty()) {
                Log::channel('animeschedulelog')->info("No anime schedules found for year {$year}, week {$week}");

                return;
            }

            $this->storeSchedules($scheduledAnime);

            Log::channel('animeschedulelog')->info('Successfully fetched and stored '.$scheduledAnime->count()." anime schedules for year {$year}, week {$week}");
        } catch (\Exception $e) {
            Log::channel('animeschedulelog')->error("Error fetching anime schedules for year {$year}, week {$week}: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Store the schedules in the database
     */
    private function storeSchedules($scheduledAnime)
    {
        // Filter out anime without animeschedule_id
        $validAnime = $scheduledAnime->filter(function ($anime) {
            if (! isset($anime['animeschedule_id']) || empty($anime['animeschedule_id'])) {
                return false;
            }

            // Filter out episodes with no date or past dates
            if (! isset($anime['episode_date']) || empty($anime['episode_date'])) {
                Log::channel('animeschedulelog')->info('Skipping anime without episode date: '.($anime['title'] ?? 'Unknown'));

                return false;
            }

            try {
                $episodeDate = Carbon::parse($anime['episode_date']);
                if ($episodeDate->isPast()) {
                    return false;
                }
            } catch (\Exception $e) {
                Log::channel('animeschedulelog')->warning('Invalid episode date format for '.($anime['title'] ?? 'Unknown').': '.$anime['episode_date']);

                return false;
            }

            return true;
        });

        if ($validAnime->isEmpty()) {
            Log::channel('animeschedulelog')->info('No valid future anime episodes found');

            return;
        }

        DB::transaction(function () use ($validAnime) {

            $scheduleData = [];

            foreach ($validAnime as $anime) {
                $scheduleData[] = [
                    'animeschedule_id' => $anime['animeschedule_id'],
                    'title' => $anime['title'] ?? null,
                    'episode_date' => $anime['episode_date'] ?? null,
                    'year' => $anime['year'],
                    'week' => $anime['week'],
                    'episode_number' => $anime['episode_number'] ?? null,
                ];
            }

            $this->processScheduleBatches($scheduleData);
        });
    }

    private function processScheduleBatches(array $records): void
    {
        if (empty($records)) {
            return;
        }

        $processed = 0;
        $total = count($records);

        foreach (array_chunk($records, self::BATCH_SIZE) as $chunk) {
            try {
                foreach ($chunk as $record) {
                    AnimeSchedule::updateOrCreate(
                        [
                            'animeschedule_id' => $record['animeschedule_id'],
                            'year' => $record['year'],
                            'week' => $record['week'],
                        ],
                        [
                            'title' => $record['title'],
                            'episode_date' => $record['episode_date'],
                            'episode_number' => $record['episode_number'],
                        ]
                    );
                }

                $processed += count($chunk);
                Log::channel('animeschedulelog')->info("Processed {$processed}/{$total} anime schedules");
            } catch (QueryException $e) {
                Log::channel('animeschedulelog')->error('Error processing anime schedule batch: '.$e->getMessage());
            }
        }
    }
}
