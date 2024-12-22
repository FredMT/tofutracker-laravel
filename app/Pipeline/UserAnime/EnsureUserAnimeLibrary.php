<?php

namespace App\Pipeline\UserAnime;

use App\Enums\MediaType;
use App\Models\UserLibrary;
use Closure;

class EnsureUserAnimeLibrary
{
    public function handle(array $payload, Closure $next)
    {
        $library = UserLibrary::firstOrCreate(
            [
                'user_id' => $payload['user']->id,
                'type' => MediaType::ANIME,
            ]
        );

        $payload['library'] = $library;

        return $next($payload);
    }
}
