<?php

namespace App\Pipeline\TV;

use App\Models\UserTv\UserTvShow;
use Closure;

class EnsureUserTvShow
{
    public function __invoke($payload, Closure $next)
    {
        $show = UserTvShow::firstOrCreate(
            [
                'user_id' => $payload['user']->id,
                'show_id' => $payload['validated']['show_id'],
            ],
            [
                'user_library_id' => $payload['library']->id,
            ]
        );

        $payload['show'] = $show;

        return $next($payload);
    }
}
