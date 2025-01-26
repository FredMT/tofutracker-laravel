<?php

namespace App\Pipeline\UserTvShow;

use App\Models\UserTv\UserTvShow;
use Closure;

class CreateUserTvShow
{
    public function __invoke($payload, Closure $next)
    {
        $userShow = UserTvShow::firstOrCreate(
            [
                'user_id' => $payload['user']->id,
                'show_id' => $payload['validated']['show_id'],
            ],
            [
                'user_library_id' => $payload['library']->id,
            ]
        );

        $payload['user_show'] = $userShow;

        return $next($payload);
    }
}
