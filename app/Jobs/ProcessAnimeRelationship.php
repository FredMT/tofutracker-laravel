<?php

namespace App\Jobs;

use App\Services\AnimeRelationshipService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessAnimeRelationship implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public $tries = 3;

    /**
     * Create a new job instance.
     */
    public function __construct(
        public readonly int $animeId
    ) {}

    /**
     * Execute the job.
     */
    public function handle(AnimeRelationshipService $service): void
    {
        Log::info("Processing relationships for anime ID: {$this->animeId}");

        try {
            $service->getRelatedAnimeIds($this->animeId);
            Log::info("Successfully processed relationships for anime ID: {$this->animeId}");
        } catch (\Exception $e) {
            Log::error("Failed to process relationships for anime ID: {$this->animeId}", [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}
