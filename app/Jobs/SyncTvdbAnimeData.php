<?php

namespace App\Jobs;

use App\Exceptions\Tvdb\TvdbSyncException;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use App\Models\TvdbAnimeSeason;
use App\Services\TvdbService;

class SyncTvdbAnimeData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $tvdbId;

    /**
     * Create a new job instance.
     *
     * @param  int  $tvdbId
     */
    public function __construct(int $tvdbId)
    {
        $this->tvdbId = $tvdbId;
    }

    /**
     * Execute the job.
     */
    public function handle(TvdbService $tvdbService)
    {
        try {
            $tvdbService->syncTvdbAnimeData($this->tvdbId);
        } catch (TvdbSyncException $e) {
            logger()->error('Error syncing TVDB anime data: ' . $e->getMessage());
        } catch (\Exception $e) {
            $this->fail($e);
            logger()->error('Error syncing TVDB anime data: ' . $e->getMessage());
        }
    }
}
