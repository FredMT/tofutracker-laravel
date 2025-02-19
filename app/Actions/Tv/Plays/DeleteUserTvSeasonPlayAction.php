<?php

namespace App\Actions\Tv\Plays;

use App\Actions\Activity\ManageTvSeasonWatchActivityAction;
use App\Models\UserTv\UserTvPlay;
use App\Models\UserTv\UserTvSeason;

class DeleteUserTvSeasonPlayAction
{
    public function __construct(
        private readonly ManageTvSeasonWatchActivityAction $manageActivity
    ) {}

    public function execute(UserTvSeason $season): void
    {
        // Delete all episode plays
        UserTvPlay::where('user_tv_season_id', $season->id)->delete();

        $this->manageActivity->delete($season);
    }
}
