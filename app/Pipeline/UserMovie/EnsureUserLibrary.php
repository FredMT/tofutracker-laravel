<?php

namespace App\Pipeline\UserMovie;

use App\Enums\MediaType;
use App\Models\UserLibrary;
use Closure;

class EnsureUserLibrary
{
    public function handle($payload, Closure $next)
    {
        $userLibrary = UserLibrary::firstOrCreate([
            'user_id' => $payload['user']->id,
            'type' => MediaType::MOVIE,
        ]);

        $payload['user_library'] = $userLibrary;

        return $next($payload);
    }
}
