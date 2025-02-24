<?php

namespace App\Pipeline\UserTvShow;

use App\Models\UserTv\UserTvShow;
use Closure;

class CreateUserTvShowWithStatus
{
    public function handle(array $payload, Closure $next)
    {
        $userShow = UserTvShow::create([
            'user_id' => $payload['user']->id,
            'show_id' => $payload['tv_show']->id,
            'user_library_id' => $payload['library']->id,
            'watch_status' => $payload['validated']['watch_status'],
        ]);

        $payload['user_show'] = $userShow;
        $payload['watch_status'] = $userShow->watch_status;

        return $next($payload);
    }
}
