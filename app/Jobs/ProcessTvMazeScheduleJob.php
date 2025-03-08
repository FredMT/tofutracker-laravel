<?php

namespace App\Jobs;

use App\Models\TvMazeSchedule;
use Carbon\Carbon;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProcessTvMazeScheduleJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    public $backoff = 60;

    public $timeout = 0;

    protected $cacheKey = 'tvmaze:full-schedule';

    protected $batchSize = 1000;

    protected $offset;

    protected $limit;

    public function __construct(int $offset = 0, ?int $limit = null)
    {
        $this->offset = $offset;
        $this->limit = $limit;
    }

    public function handle(): void
    {
        try {
            Log::info('Starting to process TVMaze schedule data from cache', [
                'offset' => $this->offset,
                'batch_size' => $this->batchSize,
                'limit' => $this->limit
            ]);

            $fullSchedule = Cache::get($this->cacheKey);

            if (empty($fullSchedule)) {
                Log::error('TVMaze schedule data not found in cache');
                return;
            }

            $totalItems = count($fullSchedule);
            Log::info('Total items in TVMaze schedule', ['count' => $totalItems]);

            if ($this->offset >= $totalItems) {
                Log::info('All TVMaze schedule items have been processed', [
                    'total_items' => $totalItems
                ]);
                return;
            }

            $remainingLimit = $this->limit;
            $currentBatchSize = $this->batchSize;

            if ($this->limit !== null) {
                if ($remainingLimit < $this->batchSize) {
                    $currentBatchSize = $remainingLimit;
                }

                Log::info('Processing with limit', [
                    'limit' => $this->limit,
                    'current_batch_size' => $currentBatchSize
                ]);
            }

            $batchItems = array_slice($fullSchedule, $this->offset, $currentBatchSize);
            $batchCount = count($batchItems);

            Log::info('Processing batch of TVMaze schedule items', [
                'batch_size' => $batchCount,
                'offset' => $this->offset,
                'remaining' => $totalItems - ($this->offset + $batchCount),
                'limit_remaining' => $this->limit !== null ? $remainingLimit - $batchCount : null
            ]);

            $processedCount = 0;
            foreach ($batchItems as $item) {
                $this->processScheduleItem($item);
                $processedCount++;
            }

            Log::info('Finished processing batch of TVMaze schedule items', [
                'processed' => $processedCount,
                'offset' => $this->offset,
                'batch_size' => $currentBatchSize
            ]);

            // Queue the next batch if there are more items to process
            $nextOffset = $this->offset + $currentBatchSize;

            $shouldContinue = $nextOffset < $totalItems;

            if ($this->limit !== null) {
                $remainingLimit -= $processedCount;
                $shouldContinue = $shouldContinue && $remainingLimit > 0;
            }

            if ($shouldContinue) {
                ProcessTvMazeScheduleJob::dispatch($nextOffset, $this->limit !== null ? $remainingLimit : null);

                Log::info('Queued next batch of TVMaze schedule items', [
                    'next_offset' => $nextOffset,
                    'remaining' => $totalItems - $nextOffset,
                    'limit_remaining' => $this->limit !== null ? $remainingLimit : null
                ]);
            } else {
                Log::info('All TVMaze schedule items have been queued for processing', [
                    'total_items' => $totalItems,
                    'processed_total' => $nextOffset,
                    'limit' => $this->limit
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Error processing TVMaze schedule data', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'offset' => $this->offset
            ]);

            throw $e;
        }
    }

    /**
     * Process a single schedule item and store it in the database.
     */
    protected function processScheduleItem(array $item): void
    {
        try {
            if (!isset($item['_embedded']['show'])) {
                return;
            }

            $show = $item['_embedded']['show'];

            if (! isset($show['externals']['thetvdb'])) {
                Log::warning('Skipping TVMaze schedule item with missing TVDB ID', [
                    'item_id' => $item['id']
                ]);
                return;
            }

            TvMazeSchedule::updateOrCreate(
                ['id' => $item['id']],
                [
                    'name' => $item['name'] ?? null,
                    'airstamp' => isset($item['airstamp']) ? Carbon::parse($item['airstamp']) : null,
                    'runtime' => $item['runtime'] ?? null,
                    'summary' => $item['summary'] ?? null,
                    'thetvdb_id' => $show['externals']['thetvdb'] ?? null,
                    'official_site' => $show['officialSite'] ?? null,
                    'schedule' => $show['schedule'] ?? null,
                    'web_channel' => $show['webChannel'] ?? null,
                ]
            );
        } catch (\Exception $e) {
            Log::error('Error processing individual TVMaze schedule item', [
                'item_id' => $item['id'] ?? 'unknown',
                'error' => $e->getMessage()
            ]);
            // Don't re-throw, continue processing other items
        }
    }
}
