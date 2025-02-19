<?php

namespace App\Actions\Tv\Plays;

use App\Models\UserTv\UserTvPlay;
use App\Models\UserTv\UserTvShow;

class DeleteUserTvShowPlayAction
{
    public function execute(UserTvShow $show): void
    {
        UserTvPlay::where('user_tv_show_id', $show->id)->delete();
    }
}
