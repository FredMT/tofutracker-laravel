<?php

namespace App\Console\Commands;

use App\Jobs\FetchAnimeSchedulesJob;
use App\Models\AnimeSchedule;
use Illuminate\Console\Command;

class FetchAnimeSchedules extends Command
{
    protected $signature = 'anime:fetch-schedules {--year= : The year to fetch schedules for} {--week= : The week to fetch schedules for}';

    protected $description = 'Queue a job to fetch anime schedules and store AniDB IDs for the next 4 weeks';

    public function handle()
    {
        $year = $this->option('year') ? (int) $this->option('year') : now()->year;
        $week = $this->option('week') ? (int) $this->option('week') : now()->weekOfYear;

        $this->deletePastEpisodes();

        $this->info('Queuing jobs to fetch anime schedules for the next 4 weeks...');

        $jobs = [];
        $currentDate = now();

        if ($year && $week) {
            // If year and week are provided, start from that specific week
            $currentDate = now()->setISODate($year, $week);
        }

        // Create jobs for the next 4 weeks (including the current/specified week)
        for ($i = 0; $i < 4; $i++) {
            $currentYear = (int) $currentDate->format('Y');
            $currentWeek = (int) $currentDate->format('W');

            $job = new FetchAnimeSchedulesJob($currentYear, $currentWeek);

            // For first job in chain, dispatch immediately; for others, add to chain with delay
            if ($i === 0) {
                $firstJob = $job;
            } else {
                $jobs[] = $job->delay(now()->addMinutes($i));
            }

            $currentDate->addWeek();
        }

        $firstJob->chain($jobs);
        dispatch($firstJob);

        $this->info('Job chain queued successfully!');

        return Command::SUCCESS;
    }

    /**
     * Delete all anime schedule entries with episode dates in the past
     */
    private function deletePastEpisodes(): void
    {
        // Count past episodes
        $count = AnimeSchedule::pastEpisodes()->count();

        // Delete past episodes
        if ($count > 0) {
            AnimeSchedule::pastEpisodes()->delete();
            $this->info("Deleted {$count} past episodes from the schedule.");
            logger()->info("Deleted {$count} past episodes from the anime schedule.");
        } else {
            $this->info('No past episodes to delete.');
            logger()->info('No past episodes to delete.');
        }
    }
}
