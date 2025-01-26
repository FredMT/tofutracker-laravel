<?php

namespace App\Pipeline\UserAnime;

use App\Enums\WatchStatus;
use App\Models\UserAnime\UserAnimeCollection;
use Closure;

class CreateUserAnimeCollection
{
    public function handle(array $payload, Closure $next)
    {
        $collection = UserAnimeCollection::create([
            'user_library_id' => $payload['library']->id,
            'map_id' => $payload['validated']['map_id'],
            'watch_status' => WatchStatus::COMPLETED,
        ]);

        $payload['collection'] = $collection;

        return $next($payload);
    }
}
