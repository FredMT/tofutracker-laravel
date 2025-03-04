<?php

namespace App\Pipeline\UserMovie;

use App\Enums\WatchStatus;
use App\Models\UserMovie\UserMovie;
use Closure;

class CreateUserMovie
{
    public function handle($payload, Closure $next)
    {
        $userMovie = UserMovie::updateOrCreate(
            [
                'user_id' => $payload['user']->id,
                'movie_id' => $payload['validated']['movie_id'],
            ],
            [
                'user_library_id' => $payload['library']->id,
                'watch_status' => $payload['validated']['watch_status'] ?? WatchStatus::COMPLETED,
                'rating' => $payload['validated']['rating'] ?? null,
            ]
        );

        $payload['user_movie'] = $userMovie;

        return $next($payload);
    }
}
