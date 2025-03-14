<?php

namespace App\Console\Commands;

use App\Jobs\FetchAnimeSchedulesJob;
use App\Models\AnimeSchedule;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class FetchAnimeSchedules extends Command
{
    protected $signature = 'anime:fetch-schedules {--year= : The year to fetch schedules for} {--week= : The week to fetch schedules for}';

    protected $description = 'Queue a job to fetch anime schedules and store AniDB IDs for the next 4 weeks';

    public function handle()
    {
        $year = $this->option('year') ? (int) $this->option('year') : now()->year;
        $week = $this->option('week') ? (int) $this->option('week') : now()->weekOfYear;

        $this->deletePastEpisodes();

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

            if ($i === 0) {
                $firstJob = $job;
            } else {
                $jobs[] = $job;
            }

            $currentDate->addWeek();
        }

        $firstJob->chain($jobs);
        dispatch($firstJob);

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
            Log::channel('animeschedulelog')->info("Deleted {$count} past episodes from the anime schedule.");
        } else {
            Log::channel('animeschedulelog')->info('No past episodes to delete.');
        }
    }
}
