<?php

namespace App\Pipeline\UserTvSeason;

use App\Enums\WatchStatus;
use App\Models\UserTv\UserTvSeason;
use Closure;

class CreateUserTvSeasonWithRating
{
    public function __invoke($payload, Closure $next)
    {
        $season = UserTvSeason::firstOrCreate(
            [
                'user_id' => $payload['user']->id,
                'season_id' => $payload['validated']['season_id'],
            ],
            [
                'rating' => $payload['validated']['rating'],
                'user_tv_show_id' => $payload['show']->id,
                'show_id' => $payload['validated']['show_id'],
                'watch_status' => WatchStatus::WATCHING,
            ]
        );

        $payload['user_season'] = $season;

        return $next($payload);
    }
}
