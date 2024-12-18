<?php

namespace App\Pipeline\TV;

use App\Models\UserLibrary;
use Closure;

class EnsureUserTvLibrary
{
    public function __invoke($payload, Closure $next)
    {
        $library = UserLibrary::firstOrCreate([
            'user_id' => $payload['user']->id,
        ]);

        $payload['library'] = $library;

        return $next($payload);
    }
}
