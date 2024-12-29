<?php

namespace App\Pipeline\UserAnimeMovie;

use App\Enums\MediaType;
use App\Models\UserLibrary;
use Closure;

class EnsureUserAnimeMovieLibrary
{
    public function handle(array $payload, Closure $next)
    {
        $payload['library'] = UserLibrary::firstOrCreate([
            'user_id' => $payload['user']->id,
            'type' => MediaType::ANIME,
        ]);

        return $next($payload);
    }
}
