<?php

namespace App\Jobs;

use App\Services\AnidbXmlDatabaseService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Redis;
use JsonException;

class ProcessAnimeXmlJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    public $backoff = 3;

    public function __construct(
        private readonly int $animeId
    ) {}

    public function middleware()
    {
        return [
            new class {
                public function handle($job, $next)
                {
                    Redis::throttle('anidb_api_rate_limit')
                        ->allow(1)
                        ->every(2)
                        ->then(function () use ($job, $next) {
                            // Continue to process the job
                            $next($job);
                        }, function () use ($job) {
                            // Release the job back to the queue with a delay
                            $job->release(2); // Release back after 2 seconds

                            logger()->channel('anidbupdate')->info('Rate limited AniDB API request, releasing job back to queue', [
                                'anime_id' => $job->animeId ?? 'unknown',
                            ]);
                        });
                }
            }
        ];
    }

    public function handle(AnidbXmlDatabaseService $service): void
    {
        try {
            $client = config('services.anidb.client_name');
            $url = "http://api.anidb.net:9001/httpapi?request=anime&client={$client}&clientver=1&protover=1&aid={$this->animeId}";

            $response = Http::get($url);
            if (! $response->successful()) {
                throw new \Exception('Failed to fetch anime XML: '.$response->status());
            }

            // Clean XML content
            $xmlContent = preg_replace('/&(?!(?:amp|lt|gt|quot|apos);)/', '&amp;', $response->body());

            if (preg_match('/<error code="500">banned<\/error>/', $xmlContent)) {
                logger()->channel('anidbupdate')->error('AniDB API access banned. Cancelling all related jobs.');

                $this->cancelAllRelatedJobs();

                // No need to continue processing
                return;
            }
            // Process the XML
            $service->processXmlContent($xmlContent);

            UpdateAnidbTvdbEpisodeData::dispatchSync($this->animeId);

            logger()->channel('anidbupdate')->info('Successfully processed anime', ['anime_id' => $this->animeId]);
        } catch (\Exception $e) {
            logger()->channel('anidbupdate')->error('Failed to process anime', ['anime_id' => $this->animeId]);
            logger()->channel('anidbupdate')->error($e->getMessage());
            logger()->channel('anidbupdate')->error($e->getTraceAsString());
            throw $e; // Re-throw to trigger job failure
        }
    }

    private function cancelAllRelatedJobs(): void
    {
        $queue = 'queues:default';
        $redis = Redis::connection();

        $jobs = $redis->lrange($queue, 0, -1);

        foreach ($jobs as $job) {
            $payload = json_decode($job, true);

            if (isset($payload['data']['command']) &&
                str_contains($payload['data']['command'], ProcessAnimeXmlJob::class)) {
                $redis->lrem($queue, 0, $job);
            }
        }

        $this->delete();

        logger()->channel('anidbupdate')->info('Cancelled all ProcessAnimeXmlJob jobs due to API ban');
    }
}
