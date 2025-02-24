<?php

namespace App\Pipeline\UserTvEpisode;

use App\Actions\Activity\ManageTvEpisodeWatchActivityAction;
use Closure;

class CreateUserTvEpisodeWatchActivity
{
    public function __construct(
        private readonly ManageTvEpisodeWatchActivityAction $manageActivity
    ) {}

    public function __invoke($payload, Closure $next)
    {
        $episode = $payload['episode'];
        $this->manageActivity->execute(
            $episode,
            [
                'user_tv_show_id' => $episode->userTvSeason->user_tv_show_id,
                'user_tv_season_id' => $episode->user_tv_season_id,
                'show_id' => $episode->show_id,
                'season_id' => $episode->season_id,
                'episode_id' => $episode->episode_id,
            ]
        );

        return $next($payload);
    }
}
