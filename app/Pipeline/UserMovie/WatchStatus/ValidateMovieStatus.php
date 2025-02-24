<?php

namespace App\Pipeline\UserMovie\WatchStatus;

use App\Enums\WatchStatus;
use App\Models\UserMovie\UserMovie;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Gate;

class ValidateMovieStatus
{
    public function handle($payload, Closure $next)
    {
        $userMovie = UserMovie::where([
            'user_id' => $payload['user']->id,
            'movie_id' => $payload['validated']['movie_id'],
        ])->first();

        if ($userMovie && Gate::denies('update', $userMovie)) {
            throw new AuthorizationException('You are not authorized to update this movie');
        }

        if (
            $userMovie && WatchStatus::from($payload['validated']['watch_status']) === $userMovie->watch_status
        ) {
            return [
                'success' => false,
                'message' => "Movie is already marked as {$userMovie->watch_status->value}",
            ];
        }

        $payload['user_movie'] = $userMovie;

        return $next($payload);
    }
}
