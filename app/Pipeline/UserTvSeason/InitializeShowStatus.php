<?php

namespace App\Pipeline\UserTvSeason;

use App\Enums\WatchStatus;
use App\Models\UserTv\UserTvShow;
use Closure;

class InitializeShowStatus
{
    public function __invoke($payload, Closure $next)
    {
        // Find or create the show with WATCHING status
        $userShow = UserTvShow::firstOrCreate(
            [
                'user_id' => $payload['user']->id,
                'show_id' => $payload['validated']['show_id'],
            ],
            [
                'watch_status' => WatchStatus::WATCHING,
                'user_library_id' => $payload['library']->id,
            ]
        );

        $payload['show'] = $userShow;

        return $next($payload);
    }
}
