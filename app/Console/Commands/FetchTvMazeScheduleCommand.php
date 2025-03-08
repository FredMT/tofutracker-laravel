<?php

namespace App\Console\Commands;

use App\Jobs\FetchTvMazeScheduleJob;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class FetchTvMazeScheduleCommand extends Command
{
    protected $signature = 'tvmaze:fetch-schedule';

    protected $description = 'Dispatch a job to fetch the full schedule from TVMaze API and save it to cache';

    public function handle()
    {
        $this->info('Dispatching job to fetch TVMaze full schedule...');

        try {
            FetchTvMazeScheduleJob::dispatch();

            $this->info('Job dispatched successfully.');
            Log::info('TVMaze schedule fetch job dispatched successfully.');
        } catch (\Exception $e) {
            $this->error('Failed to dispatch TVMaze schedule fetch job: ' . $e->getMessage());
            Log::error('Failed to dispatch TVMaze schedule fetch job', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
