<?php

namespace App\Pipeline\UserTvEpisode;

use App\Enums\WatchStatus;
use App\Models\UserTvPlay;
use Closure;

class CreateUserTvEpisodePlay
{
    public function __invoke($payload, Closure $next)
    {
        if ($payload['episode']->watch_status === WatchStatus::COMPLETED) {
            UserTvPlay::create([
                'user_id' => $payload['user']->id,
                'user_tv_show_id' => $payload['show']->id,
                'user_tv_season_id' => $payload['season']->id,
                'user_tv_episode_id' => $payload['episode']->id,
                'playable_id' => $payload['episode']->id,
                'playable_type' => get_class($payload['episode']),
                'watched_at' => now(),
            ]);
        }

        return $next($payload);
    }
}
