<?php

namespace App\Actions\Tv\Plays;

use App\Actions\Activity\CreateUserActivityAction;
use App\Models\UserTv\UserTvEpisode;
use App\Models\UserTv\UserTvPlay;

class DeleteUserTvPlayAction
{
    public function execute(UserTvEpisode $episode): void
    {
        // Delete all play records for this episode
        UserTvPlay::where('user_tv_episode_id', $episode->id)->delete();
    }
}
