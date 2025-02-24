<?php

namespace App\Actions\Tv\Plays;

use App\Models\UserTv\UserTvEpisode;
use App\Models\UserTv\UserTvPlay;

class CreateUserTvPlayAction
{
    public function execute(UserTvEpisode $episode, ?\DateTime $watchedAt = null): UserTvPlay
    {
        if (! $episode->relationLoaded('userTvSeason')) {
            $episode->load(['userTvSeason']);
        }

        return UserTvPlay::create([
            'user_id' => $episode->user_id,
            'user_tv_show_id' => $episode->userTvSeason->user_tv_show_id,
            'user_tv_season_id' => $episode->user_tv_season_id,
            'user_tv_episode_id' => $episode->id,
            'playable_id' => $episode->id,
            'playable_type' => get_class($episode),
            'watched_at' => $watchedAt ?? now(),
        ]);
    }
}
