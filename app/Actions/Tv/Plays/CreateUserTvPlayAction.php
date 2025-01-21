<?php

namespace App\Actions\Tv\Plays;

use App\Actions\Activity\CreateUserActivityAction;
use App\Models\UserTvEpisode;
use App\Models\UserTvPlay;

class CreateUserTvPlayAction
{
    public function __construct(
        private readonly CreateUserActivityAction $createActivity
    ) {}

    public function execute(UserTvEpisode $episode, ?\DateTime $watchedAt = null): UserTvPlay
    {
        // Ensure relationships are loaded
        if (! $episode->relationLoaded('userTvSeason')) {
            $episode->load(['userTvSeason']);
        }

        $play = UserTvPlay::create([
            'user_id' => $episode->user_id,
            'user_tv_show_id' => $episode->userTvSeason->user_tv_show_id,
            'user_tv_season_id' => $episode->user_tv_season_id,
            'user_tv_episode_id' => $episode->id,
            'playable_id' => $episode->id,
            'playable_type' => get_class($episode),
            'watched_at' => $watchedAt ?? now(),
        ]);

        $this->createActivity->execute(
            userId: $episode->user_id,
            activityType: 'tv_watch',
            subject: $episode,
            metadata: [
                'user_tv_show_id' => $episode->userTvSeason->user_tv_show_id,
                'user_tv_season_id' => $episode->user_tv_season_id,
                'show_id' => $episode->show_id,
                'season_id' => $episode->season_id,
                'episode_id' => $episode->episode_id,
            ]
        );

        return $play;
    }
}
