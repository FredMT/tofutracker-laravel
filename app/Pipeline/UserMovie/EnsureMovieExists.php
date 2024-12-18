<?php

namespace App\Pipeline\UserMovie;

use App\Models\Movie;
use Closure;

class EnsureMovieExists
{
    public function __invoke($payload, Closure $next)
    {
        $movie = Movie::find($payload['validated']['movie_id']);

        if (!$movie) {
            return back()->with([
                'success' => false,
                'message' => "Movie not found in the database",
            ]);
        }

        $payload['movie_title'] = $movie->title;

        return $next($payload);
    }
}
