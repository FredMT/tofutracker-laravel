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

        logger()->info("Starting to fetch anime schedules for year {$year}, week {$week}");

        try {
            $scheduledAnime = $animeScheduleService->getScheduledAnimeWithAnidbIds($year, $week);

            if ($scheduledAnime->isEmpty()) {
                logger()->info("No anime schedules found for year {$year}, week {$week}");

                return;
            }

            $this->storeSchedules($scheduledAnime);

            logger()->info('Successfully fetched and stored '.$scheduledAnime->count()." anime schedules for year {$year}, week {$week}");
        } catch (\Exception $e) {
            logger()->error("Error fetching anime schedules for year {$year}, week {$week}: ".$e->getMessage());
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
                logger()->info('Skipping anime without episode date: '.($anime['title'] ?? 'Unknown'));

                return false;
            }

            try {
                $episodeDate = Carbon::parse($anime['episode_date']);
                if ($episodeDate->isPast()) {
                    return false;
                }
            } catch (\Exception $e) {
                logger()->warning('Invalid episode date format for '.($anime['title'] ?? 'Unknown').': '.$anime['episode_date']);

                return false;
            }

            return true;
        });

        if ($validAnime->isEmpty()) {
            logger()->info('No valid future anime episodes found');

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
                        ]
                    );
                }

                $processed += count($chunk);
                logger()->info("Processed {$processed}/{$total} anime schedules");
            } catch (QueryException $e) {
                logger()->error('Error processing anime schedule batch: '.$e->getMessage());
            }
        }
    }
}
