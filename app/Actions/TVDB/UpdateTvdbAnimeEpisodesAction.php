<?php

namespace App\Actions\TVDB;

use App\Jobs\UpdateTvdbAnimeEpisodesJob;
use App\Models\Tvdb\TvdbAnimeSeason;

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
