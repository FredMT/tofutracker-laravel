<?php

namespace App\Pipeline\UserMovie;

use App\Enums\WatchStatus;
use App\Models\UserMovie\UserMoviePlay;
use Closure;

class CreateUserMoviePlay
{
    public function handle($payload, Closure $next)
    {
        if (($payload['validated']['watch_status'] ?? WatchStatus::COMPLETED->value) === WatchStatus::COMPLETED->value) {
            UserMoviePlay::create([
                'user_movie_id' => $payload['user_movie']->id,
                'user_id' => $payload['user_movie']->user_id,
                'movie_id' => $payload['user_movie']->movie_id,
                'watched_at' => $payload['watched_at'] ?? now(),
            ]);
        }

        return $next($payload);
    }
}
