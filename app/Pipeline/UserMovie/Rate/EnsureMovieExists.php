<?php

namespace App\Pipeline\UserMovie\Rate;

use App\Models\Movie;
use Closure;

class EnsureMovieExists
{
    public function __invoke($payload, Closure $next)
    {
        $payload['user_movie'] = Movie::find($payload['validated']['movie_id']);

        return $next($payload);
    }
}
