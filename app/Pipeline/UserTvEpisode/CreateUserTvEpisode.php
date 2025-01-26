<?php

namespace App\Pipeline\UserTvEpisode;

use App\Enums\WatchStatus;
use App\Models\UserTv\UserTvEpisode;
use Closure;

class CreateUserTvEpisode
{
    public function __invoke($payload, Closure $next)
    {
        $episode = UserTvEpisode::updateOrCreate(
            [
                'user_id' => $payload['user']->id,
                'episode_id' => $payload['validated']['episode_id'],
            ],
            [
                'user_tv_season_id' => $payload['season']->id,
                'show_id' => $payload['validated']['show_id'],
                'season_id' => $payload['validated']['season_id'],
                'watch_status' => $payload['validated']['watch_status'] ?? WatchStatus::COMPLETED,
                'rating' => $payload['validated']['rating'] ?? null,
            ]
        );

        $payload['episode'] = $episode;

        return $next($payload);
    }
}
