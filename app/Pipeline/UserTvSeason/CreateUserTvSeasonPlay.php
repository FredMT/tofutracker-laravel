<?php

namespace App\Pipeline\UserTvSeason;

use App\Models\UserTvPlay;
use App\Models\UserTvSeason;
use Closure;

class CreateUserTvSeasonPlay
{
    public function __invoke($payload, Closure $next)
    {
        UserTvPlay::create([
            'user_id' => $payload['user']->id,
            'user_tv_show_id' => $payload['show']->id,
            'user_tv_season_id' => $payload['user_season']->id,
            'playable_id' => $payload['user_season']->id,
            'playable_type' => UserTvSeason::class,
            'watched_at' => now(),
        ]);

        return $next($payload);
    }
}
