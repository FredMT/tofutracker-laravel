<?php

namespace App\Actions\Tv\Plays;

use App\Models\UserTv\UserTvPlay;
use App\Models\UserTv\UserTvShow;

class CreateUserTvShowPlayAction
{
    public function execute(UserTvShow $userShow): UserTvPlay
    {
        $play = UserTvPlay::create([
            'user_id' => $userShow->user_id,
            'user_tv_show_id' => $userShow->id,
            'playable_id' => $userShow->id,
            'playable_type' => UserTvShow::class,
            'watched_at' => now(),
        ]);

        return $play;
    }
}
