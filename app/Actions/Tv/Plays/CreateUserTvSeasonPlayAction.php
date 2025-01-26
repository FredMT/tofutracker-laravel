<?php

namespace App\Actions\Tv\Plays;

use App\Actions\Activity\CreateUserActivityAction;
use App\Models\UserTv\UserTvPlay;
use App\Models\UserTv\UserTvSeason;

class CreateUserTvSeasonPlayAction
{
    public function __construct(
        private readonly CreateUserActivityAction $createActivity
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
        $this->createActivity->execute(
            userId: $season->user_id,
            activityType: 'tv_watch',
            subject: $season,
            metadata: [
                'user_tv_show_id' => $season->user_tv_show_id,
                'show_id' => $season->show_id,
                'season_id' => $season->season_id,
            ]
        );

        return $play;
    }
}
