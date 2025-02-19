<?php

namespace App\Actions\Tv\Plays;

use App\Actions\Activity\ManageTvWatchActivityAction;
use App\Models\UserTv\UserTvPlay;
use App\Models\UserTv\UserTvShow;

// class CreateUserTvShowPlayAction
// {
//     public function __construct(
//         private readonly CreateUserActivityAction $createActivity
//     ) {}

//     public function execute(UserTvShow $userShow): UserTvPlay
//     {
//         // Create play record
//         $play = UserTvPlay::create([
//             'user_id' => $userShow->user_id,
//             'user_tv_show_id' => $userShow->id,
//             'playable_id' => $userShow->id,
//             'playable_type' => UserTvShow::class,
//             'watched_at' => now(),
//         ]);

//         // Create activity
//         $this->createActivity->execute(
//             userId: $userShow->user_id,
//             activityType: 'tv_watch',
//             subject: $userShow,
//             metadata: [
//                 'show_id' => $userShow->show_id,
//                 'user_tv_show_id' => $userShow->id,
//             ]
//         );

//         return $play;
//     }
// }

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
