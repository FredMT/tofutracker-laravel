<?php

namespace App\Console\Commands;

use App\Actions\Schedule\ProcessScheduleWithTimestamps;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RefreshScheduleCache extends Command
{
    protected $signature = 'schedule:refresh-cache';

    protected $description = 'Refresh the schedule data cache';

    public function handle(ProcessScheduleWithTimestamps $processScheduleWithTimestamps)
    {
        $this->info('Refreshing schedule cache...');

        try {
            $processScheduleWithTimestamps->clearCache();
            $this->info('Existing cache cleared.');

            $result = $processScheduleWithTimestamps->execute([]);

            if ($result['success']) {
                $this->info('Schedule cache refreshed successfully.');
                $this->info('Found '.count($result['schedules']).' schedule items.');
                $this->info('TV shows: '.$result['counts']['tv']);
                $this->info('Anime: '.$result['counts']['anime']);

                return Command::SUCCESS;
            } else {
                $this->error('Failed to refresh cache: '.($result['message'] ?? 'Unknown error'));

                return Command::FAILURE;
            }
        } catch (\Throwable $e) {
            $this->error('Exception while refreshing schedule cache: '.$e->getMessage());
            Log::error('RefreshScheduleCache command error: '.$e->getMessage());
            Log::error($e->getTraceAsString());

            return Command::FAILURE;
        }
    }
}
