<?php

namespace App\Jobs;

use App\Actions\TVDB\UpdateTvdbAnimeEpisodesAction as TVDBUpdateTvdbAnimeEpisodesAction;
use App\Models\Tvdb\TvdbAnimeSeason;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateTvdbAnimeSeasonJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $season;

    public $completeData;

    public function __construct(TvdbAnimeSeason $season, $completeData)
    {
        $this->season = $season;
        $this->completeData = $completeData;
    }

    public function handle()
    {
        logger()->info('Starting update of TVDB anime season', [
            'season_id' => $this->season->id,
            'slug' => $this->season->slug,
        ]);

        $this->season->update([
            'status_name' => $this->completeData->data->status->name,
            'status_record_type' => $this->completeData->data->status->recordType,
            'status_keep_updated' => $this->completeData->data->status->keepUpdated,
            'last_updated' => $this->completeData->data->lastUpdated,
            'average_runtime' => $this->completeData->data->averageRuntime,
            'last_fetched_at' => now(),
        ]);

        logger()->info('Updated TVDB anime season metadata', [
            'season_id' => $this->season->id,
            'new_last_updated' => $this->completeData->data->lastUpdated,
        ]);

        $updateAction = app(TVDBUpdateTvdbAnimeEpisodesAction::class);

        logger()->info('Starting episode updates via action', [
            'season_id' => $this->season->id,
            'episode_count' => count($this->completeData->data->episodes),
        ]);

        $updateAction->execute($this->season, $this->completeData->data->episodes);

        logger()->info('Completed update of TVDB anime season and episodes', [
            'season_id' => $this->season->id,
        ]);
    }
}
