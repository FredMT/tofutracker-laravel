<?php

namespace App\Jobs;

use App\Models\TvShow;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Support\Facades\Log;

class UpdateTvData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $tvId,
        public array $tvData,
        public ?string $etag,
    ) {}

    public function handle(): void
    {
        try {
            TvShow::updateOrCreate(
                ['id' => $this->tvId],
                [
                    'data' => $this->tvData,
                    'etag' => $this->etag
                ]
            );

            if (isset($this->tvData['seasons'])) {
                foreach ($this->tvData['seasons'] as $season) {
                    ProcessTvSeasons::dispatch($this->tvId, $season['season_number']);
                }
            }

            $tv = TvShow::find($this->tvId);
            cache()->put(
                "tv.{$this->tvId}",
                $tv->filteredData,
                now()->addMinutes(15)
            );
        } catch (\Exception $e) {
            Log::error("Error updating TV show {$this->tvId}: " . $e->getMessage());
            throw $e;
        }
    }
}
