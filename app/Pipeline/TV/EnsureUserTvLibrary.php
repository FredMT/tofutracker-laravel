<?php

namespace App\Pipeline\TV;

use App\Enums\MediaType;
use App\Models\UserLibrary;
use Closure;

class EnsureUserTvLibrary
{
    public function __invoke($payload, Closure $next)
    {
        $library = UserLibrary::firstOrCreate([
            'user_id' => $payload['user']->id,
            'type' => MediaType::TV,
        ]);

        $payload['library'] = $library;

        return $next($payload);
    }
}
