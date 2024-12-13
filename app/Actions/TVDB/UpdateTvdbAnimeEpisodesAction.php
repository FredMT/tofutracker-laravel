<?php

namespace App\Actions\TVDB;

use App\Models\TvdbAnimeSeason;
use App\Jobs\UpdateTvdbAnimeEpisodesJob;

class UpdateTvdbAnimeEpisodesAction
{
    public function execute(TvdbAnimeSeason $season, array $episodes)
    {
        $lastUpdated = $season->last_updated;
        $season->refresh();

        if ($lastUpdated == $season->last_updated) {
            return;
        }

        UpdateTvdbAnimeEpisodesJob::dispatch($season, $episodes);
    }
}
