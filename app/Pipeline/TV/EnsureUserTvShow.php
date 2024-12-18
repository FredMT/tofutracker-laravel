<?php

namespace App\Pipeline\TV;

use App\Enums\WatchStatus;
use App\Models\UserTvShow;
use Closure;

class EnsureUserTvShow
{
    public function __invoke($payload, Closure $next)
    {
        $show = UserTvShow::updateOrCreate(
            [
                'user_id' => $payload['user']->id,
                'show_id' => $payload['validated']['show_id'],
            ],
            [
                'user_library_id' => $payload['library']->id,
                'watch_status' => WatchStatus::WATCHING,
            ]
        );

        $payload['show'] = $show;

        return $next($payload);
    }
}
