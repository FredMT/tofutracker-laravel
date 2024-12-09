<?php

namespace App\Jobs;

use App\Models\TvShow;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use App\Services\TmdbService;

class UpdateOrCreateTvData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $tvId,
    ) {}

    public function handle(): void
    {
        try {
            $response = app(TmdbService::class)->getTv($this->tvId);

            if (isset($response['data']['success']) && $response['data']['success'] === false) {
                Log::error("Failed to update TV show {$this->tvId}: {$response['data']['status_message']}");
                return;
            }

            $tvData = $response['data'];
            $etag = $response['etag'];

            $tv = TvShow::find($this->tvId);

            // Only update if etag is different or doesn't exist
            if (!$tv || $tv->etag !== $etag) {
                TvShow::updateOrCreate(
                    ['id' => $this->tvId],
                    [
                        'data' => $tvData,
                        'etag' => $etag
                    ]
                );

                cache()->put(
                    "tv.{$this->tvId}",
                    $tv->filteredData,
                    now()->addHours(6)
                );
            }
        } catch (\Exception $e) {
            Log::error("Error updating TV show {$this->tvId}: " . $e->getMessage());
            throw $e;
        }
    }
}
