<?php

namespace App\Pipeline\UserAnime;

use App\Models\UserAnime;
use App\Models\UserAnimeCollection;
use App\Models\UserAnimePlay;
use Closure;

class CreateUserAnimeMoviePlay
{
    public function handle(array $payload, Closure $next)
    {
        if (isset($payload['updated']) && $payload['updated']) {
            return $next($payload);
        }

        UserAnimePlay::create([
            'playable_type' => UserAnime::class,
            'playable_id' => $payload['user_anime']->id,
            'watched_at' => now(),
        ]);

        UserAnimePlay::create([
            'playable_type' => UserAnimeCollection::class,
            'playable_id' => $payload['collection']->id,
            'watched_at' => now(),
        ]);

        return $next($payload);
    }
}
