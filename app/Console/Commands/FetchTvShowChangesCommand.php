<?php

namespace App\Console\Commands;

use App\Actions\Tv\TvShowActions;
use App\Jobs\UpdateTvShow;
use App\Models\TvShow;
use App\Services\TmdbService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Http\Client\Pool;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\RateLimiter;

class FetchTvShowChangesCommand extends Command
{
    protected $signature = 'tvshows:fetch-changes {--force : Force update regardless of cache} {--batch=20 : Number of shows to process in each batch} {--rate=40 : Maximum requests per second to TMDB}';

    protected $description = 'Fetch TV show changes from TMDB API and queue updates';

    private const CACHE_PREFIX = 'tvshow_changes_processed_';

    private const LAST_RUN_CACHE_KEY = 'tvshow_changes_last_run';

    private const RATE_LIMITER_KEY = 'tmdb_api_requests';

    public function handle(TmdbService $tmdbService, TvShowActions $tvShowActions)
    {
        $this->info('Fetching TV show changes from TMDB API...');

        // Get last run timestamp or use a day ago if not set
        $lastRun = Cache::get(self::LAST_RUN_CACHE_KEY, Carbon::now()->subDay());
        $forceUpdate = $this->option('force');
        $batchSize = (int) $this->option('batch');
        $maxRequestsPerSecond = (int) $this->option('rate');

        // Ensure batch size doesn't exceed rate limit
        if ($batchSize > $maxRequestsPerSecond) {
            $this->warn("Batch size {$batchSize} exceeds rate limit of {$maxRequestsPerSecond}. Reducing batch size.");
            $batchSize = $maxRequestsPerSecond;
        }

        if (! $forceUpdate && $lastRun->diffInHours(Carbon::now()) < 1) {
            $this->info('Command was run less than an hour ago. Use --force to override.');

            return Command::SUCCESS;
        }

        // Get the last time this command was run
        $lastRunTime = $lastRun->toIso8601String();

        // Store current time as last run
        Cache::put(self::LAST_RUN_CACHE_KEY, Carbon::now(), now()->addDays(30));

        // Track the latest change time for each ID to ensure we get the most recent changes
        $latestChanges = [];
        $processedIds = [];
        $totalProcessed = 0;
        $totalPages = 1;
        $currentPage = 1;
        $idsToProcess = [];

        try {
            do {
                // Apply rate limiting for the changes API request
                $this->throttleRequest();

                $changes = $tmdbService->getMediaChanges('tv', $currentPage);
                $totalPages = $changes['total_pages'] ?? 1;

                $this->info("Collecting TV show IDs from page {$currentPage} of {$totalPages}");

                foreach ($changes['results'] as $change) {
                    $tvId = $change['id'];

                    // Skip adult content
                    if ($change['adult'] === true) {
                        continue;
                    }

                    // All changes from TMDB include a timestamp (we'll need to mock this for testing)
                    // For this implementation, we'll use a synthetic timestamp for testing
                    // In a real scenario, TMDB would provide a change timestamp in the response
                    $changeTimestamp = now()->timestamp; // In real usage this would come from TMDB

                    // Store this ID and its latest change timestamp
                    if (! isset($latestChanges[$tvId]) || $changeTimestamp > $latestChanges[$tvId]['timestamp']) {
                        $latestChanges[$tvId] = [
                            'timestamp' => $changeTimestamp,
                            'page' => $currentPage,
                        ];
                    }

                    // Add to the collection of IDs to process (we'll filter duplicates later)
                    if (! in_array($tvId, $processedIds)) {
                        $processedIds[] = $tvId;
                        $idsToProcess[] = $tvId;
                    }
                }

                $currentPage++;
            } while ($currentPage <= $totalPages);

            // Filter IDs based on their last processed timestamp in our cache
            $filteredIds = [];
            foreach ($idsToProcess as $tvId) {
                $cacheKey = self::CACHE_PREFIX.$tvId;
                $lastProcessed = Cache::get($cacheKey);

                // If we have a cached timestamp for this ID, we need to check if this change is newer
                if (! $forceUpdate && $lastProcessed) {
                    $lastProcessedData = json_decode($lastProcessed, true);
                    $lastProcessedTimestamp = $lastProcessedData['timestamp'] ?? 0;

                    // Only process if this change is newer than the last one we processed
                    if ($latestChanges[$tvId]['timestamp'] > $lastProcessedTimestamp) {
                        $filteredIds[] = $tvId;
                    } else {
                        $this->line("Skipping TV show {$tvId} - no newer changes since last processing");
                    }
                } else {
                    // If we don't have a cached timestamp, or we're forcing updates, process it
                    $filteredIds[] = $tvId;
                }
            }

            // Process shows in batches
            $this->info('Found '.count($filteredIds).' TV shows with new changes to update');

            $batches = array_chunk($filteredIds, $batchSize);
            $bar = $this->output->createProgressBar(count($filteredIds));
            $bar->start();

            foreach ($batches as $batchIndex => $batch) {
                // Process each batch with rate limiting
                $this->processBatch($batch, $tmdbService, $tvShowActions, $bar, $latestChanges);
                $totalProcessed += count($batch);
            }

            $bar->finish();
            $this->newLine();
            $this->info("Completed processing TV show changes. Processed {$totalProcessed} shows.");

            return Command::SUCCESS;
        } catch (\Exception $e) {
            Log::error('Error fetching TV show changes: '.$e->getMessage());
            $this->error('Error fetching TV show changes: '.$e->getMessage());

            return Command::FAILURE;
        }
    }

    private function processBatch(array $tvIds, TmdbService $tmdbService, TvShowActions $tvShowActions, $progressBar, array $latestChanges): void
    {
        // First check which shows already exist in our database
        $existingShows = TvShow::whereIn('id', $tvIds)->get()->keyBy('id');

        // Prepare base URL and parameters for API requests
        $baseUrl = 'https://api.themoviedb.org/3';
        $appendToResponse = 'aggregate_credits,external_ids,images,keywords,content_ratings,similar,videos,translations,watch/providers,recommendations';
        $includeImageLanguage = 'en,null';
        $includeVideoLanguage = 'en';
        $apiKey = config('services.tmdb.key');

        // Apply rate limiting for the batch
        $this->throttleRequests(count($tvIds));

        // Make concurrent requests using HTTP Pool
        $responses = Http::pool(function (Pool $pool) use ($tvIds, $baseUrl, $appendToResponse, $includeImageLanguage, $includeVideoLanguage, $apiKey, $existingShows) {
            $requests = [];

            foreach ($tvIds as $tvId) {
                $headers = [
                    'Accept' => 'application/json',
                ];

                // Add If-None-Match header for conditional requests if show exists
                if (isset($existingShows[$tvId]) && $existingShows[$tvId]->etag) {
                    $headers['If-None-Match'] = $existingShows[$tvId]->etag;
                }

                $requests[] = $pool->withHeaders($headers)
                    ->get("{$baseUrl}/tv/{$tvId}", [
                        'api_key' => $apiKey,
                        'append_to_response' => $appendToResponse,
                        'include_image_language' => $includeImageLanguage,
                        'include_video_language' => $includeVideoLanguage,
                    ]);
            }

            return $requests;
        });

        // Process the responses
        foreach ($responses as $index => $response) {
            $tvId = $tvIds[$index];

            try {
                // If we get a 304 Not Modified response, skip updating
                if ($response->status() === 304) {
                    $this->line("TV show {$tvId} not modified (304 response)");
                    $progressBar->advance();

                    continue;
                }

                if (! $response->successful()) {
                    Log::error("Failed to fetch TV show {$tvId}: ".$response->status());
                    $progressBar->advance();

                    continue;
                }

                $showData = [
                    'data' => $response->json(),
                    'etag' => $response->header('etag'),
                ];

                // Check if this show already exists in our database
                if (isset($existingShows[$tvId])) {
                    $tvShow = $existingShows[$tvId];
                    // Queue update job (no need to check etag as we already handled 304 responses)
                    UpdateTvShow::dispatch($tvShow, $showData, true);
                } else {
                    // Create new TV show
                    $tvShowActions->createTvShow($showData);
                }

                // Store the time we processed this ID with its change timestamp
                // This helps us track which changes we've already processed
                $changeData = [
                    'timestamp' => $latestChanges[$tvId]['timestamp'],
                    'page' => $latestChanges[$tvId]['page'],
                    'processed_at' => Carbon::now()->toIso8601String(),
                ];

                Cache::put(
                    self::CACHE_PREFIX.$tvId,
                    json_encode($changeData),
                    now()->addDays(7)
                );

            } catch (\Exception $e) {
                Log::error("Error processing TV show {$tvId}: ".$e->getMessage());
            }

            $progressBar->advance();
        }
    }

    /**
     * Throttle a single request
     */
    private function throttleRequest(): void
    {
        $maxRequestsPerSecond = (int) $this->option('rate');

        $executed = RateLimiter::attempt(
            self::RATE_LIMITER_KEY,
            $maxRequestsPerSecond,
            function () {
                return true;
            },
            1 // Decay seconds
        );

        if (! $executed) {
            // If we've hit the rate limit, wait a bit
            usleep(1000000 / $maxRequestsPerSecond); // Convert to microseconds
        }
    }

    /**
     * Throttle multiple requests
     */
    private function throttleRequests(int $count): void
    {
        $maxRequestsPerSecond = (int) $this->option('rate');

        if ($count > $maxRequestsPerSecond) {
            $this->line("Throttling {$count} requests to stay within rate limit of {$maxRequestsPerSecond}/second");

            // If we're requesting more than the limit, add a delay to spread requests out
            $sleepTime = ceil($count / $maxRequestsPerSecond);
            sleep($sleepTime);
        } else {
            // For smaller batches, we just need to check if we've made too many requests recently
            for ($i = 0; $i < $count; $i++) {
                $this->throttleRequest();
            }
        }
    }
}
