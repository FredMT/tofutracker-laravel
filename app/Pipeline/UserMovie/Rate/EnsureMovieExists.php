<?php

namespace App\Pipeline\UserMovie\Rate;

use App\Models\UserMovie\UserMovie;
use Closure;

class EnsureMovieExists
{
    public function __invoke($payload, Closure $next)
    {
        $payload['user_movie'] = UserMovie::where([
            'user_id' => $payload['user']->id,
            'movie_id' => $payload['validated']['movie_id'],
        ])->first();

        return $next($payload);
    }
}
