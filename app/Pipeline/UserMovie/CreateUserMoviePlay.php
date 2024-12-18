<?php

namespace App\Pipeline\UserMovie;

use App\Models\UserMoviePlay;
use App\Enums\WatchStatus;
use Closure;

class CreateUserMoviePlay
{
    public function handle($payload, Closure $next)
    {
        if (($payload['validated']['watch_status'] ?? WatchStatus::COMPLETED) === WatchStatus::COMPLETED) {
            UserMoviePlay::create([
                'user_movie_id' => $payload['user_movie']->id,
                'user_id' => $payload['user']->id,
                'movie_id' => $payload['validated']['movie_id'],
                'watched_at' => now(),
            ]);
        }

        return $next($payload);
    }
}
