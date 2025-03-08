<?php

namespace App\Console\Commands;

use App\Jobs\ProcessTvMazeScheduleJob;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class ProcessTvMazeScheduleCommand extends Command
{
    protected $signature = 'tvmaze:process-schedule
                            {--limit= : Limit processing to a specific number of items}
                            {--offset=0 : Start processing from this offset}';

    protected $description = 'Process the TVMaze schedule data from cache';

    public function handle()
    {
        $offset = (int) $this->option('offset');
        $limit = $this->option('limit') ? (int) $this->option('limit') : null;

        $this->info('Dispatching job to process TVMaze schedule data...');
        $this->info('Offset: ' . $offset);

        if ($limit) {
            $this->info('Limit: ' . $limit);
        } else {
            $this->info('Processing all available items');
        }

        try {
            ProcessTvMazeScheduleJob::dispatch($offset, $limit);

            $this->info('Job dispatched successfully.');
            Log::info('TVMaze schedule process job dispatched successfully.', [
                'offset' => $offset,
                'limit' => $limit
            ]);
        } catch (\Exception $e) {
            $this->error('Failed to dispatch TVMaze schedule process job: ' . $e->getMessage());
            Log::error('Failed to dispatch TVMaze schedule process job', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'offset' => $offset,
                'limit' => $limit
            ]);
        }
    }
}
