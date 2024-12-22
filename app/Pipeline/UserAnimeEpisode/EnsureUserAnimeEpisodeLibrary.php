<?php

namespace App\Pipeline\UserAnimeEpisode;

use App\Enums\MediaType;
use App\Models\UserLibrary;
use Closure;

class EnsureUserAnimeEpisodeLibrary
{
    public function handle($payload, Closure $next)
    {
        $library = UserLibrary::firstOrCreate([
            'user_id' => $payload['user']->id,
            'type' => MediaType::ANIME,
        ]);

        $payload['library'] = $library;

        return $next($payload);
    }
}
