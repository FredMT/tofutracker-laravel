<?php

namespace App\Jobs;

use App\Actions\Anime\GetMostCommonTmdbId;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAnimeTmdbId implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private readonly string $mapId
    ) {}

    public function handle(GetMostCommonTmdbId $action): void
    {
        try {
            $action->execute($this->mapId);
        } catch (\Exception $e) {
            Log::warning('Failed to process TMDB ID for map', [
                'map_id' => $this->mapId,
                'error' => $e->getMessage(),
            ]);
        }
    }
}
