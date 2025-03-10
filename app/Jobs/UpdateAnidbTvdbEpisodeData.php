<?php

namespace App\Jobs;

use App\Actions\Anime\SyncAnimeTvdbEpisodeData;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateAnidbTvdbEpisodeData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public $backoff = 5;

    public function __construct(
        private readonly int $animeId
    ) {}

    public function handle(SyncAnimeTvdbEpisodeData $action): void
    {
        try {
            $action->execute($this->animeId);
            logger()->info('Successfully completed TVDB episode data sync', ['anime_id' => $this->animeId]);
        } catch (\Exception $e) {
            logger()->error('Failed to sync TVDB episode data in job', ['anime_id' => $this->animeId]);
            logger()->error($e->getMessage());
            logger()->error($e->getTraceAsString());
            throw $e; // Re-throw to trigger job failure
        }
    }
}
