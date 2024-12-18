<?php

namespace App\Pipeline\UserTvEpisode;

use App\Enums\WatchStatus;
use App\Models\UserTvSeason;
use Closure;

class EnsureUserTvSeason
{
    public function __invoke($payload, Closure $next)
    {
        $season = UserTvSeason::updateOrCreate(
            [
                'user_id' => $payload['user']->id,
                'season_id' => $payload['validated']['season_id'],
            ],
            [
                'user_tv_show_id' => $payload['show']->id,
                'show_id' => $payload['validated']['show_id'],
                'watch_status' => WatchStatus::WATCHING,
            ]
        );

        $payload['season'] = $season;

        return $next($payload);
    }
}
