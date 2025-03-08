<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class FetchTvMazeScheduleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    public $timeout = 0;

    protected $apiEndpoint = 'https://api.tvmaze.com/schedule/full';

    protected $cacheKey = 'tvmaze:full-schedule';

    public function __construct()
    {
        //
    }

    public function handle(): void
    {
        try {
            Log::info('Starting to fetch TVMaze full schedule...');

            $response = Http::timeout(300)->get($this->apiEndpoint);

            if ($response->successful()) {
                $scheduleData = $response->json();

                // Using forever() since we'll refresh it on a schedule
                Cache::forever($this->cacheKey, $scheduleData);

                $dataSize = strlen(json_encode($scheduleData)) / (1024 * 1024);

                Log::info('TVMaze full schedule successfully fetched and cached.', [
                    'size' => sprintf('%.2f MB', $dataSize),
                    'items_count' => count($scheduleData)
                ]);

            } else {
                Log::error('Failed to fetch TVMaze schedule', [
                    'status' => $response->status(),
                    'response' => $response->body()
                ]);

                throw new \Exception('Failed to fetch TVMaze schedule: ' . $response->status());
            }
        } catch (\Exception $e) {
            Log::error('An error occurred while fetching TVMaze schedule', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            throw $e; // Re-throw to trigger job failure
        }
    }
}
