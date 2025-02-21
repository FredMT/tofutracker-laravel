<?php

namespace App\Actions\Tv\Plays;

use App\Actions\Activity\ManageTvSeasonUserActivityAction;
use App\Models\UserTv\UserTvPlay;
use App\Models\UserTv\UserTvSeason;

class CreateUserTvSeasonPlayAction
{
    public function __construct(
        private readonly ManageTvSeasonUserActivityAction $manageActivity
    ) {}

    public function execute(UserTvSeason $season, ?\DateTime $watchedAt = null): UserTvPlay
    {
        $play = UserTvPlay::create([
            'user_id' => $season->user_id,
            'user_tv_show_id' => $season->user_tv_show_id,
            'user_tv_season_id' => $season->id,
            'playable_id' => $season->id,
            'playable_type' => get_class($season),
            'watched_at' => $watchedAt ?? now(),
        ]);

        // Record activity
        $this->manageActivity->execute($season, [
            'user_tv_show_id' => $season->user_tv_show_id,
            'show_id' => $season->show_id,
            'season_id' => $season->season_id,
        ]);

        return $play;
    }
}
