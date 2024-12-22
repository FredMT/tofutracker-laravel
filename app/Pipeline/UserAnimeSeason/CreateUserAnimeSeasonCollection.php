<?php

namespace App\Pipeline\UserAnimeSeason;

use App\Enums\WatchStatus;
use App\Models\UserAnimeCollection;
use Closure;

class CreateUserAnimeSeasonCollection
{
    public function handle($payload, Closure $next)
    {

        $collection = UserAnimeCollection::firstOrCreate(
            [
                'user_library_id' => $payload['library']->id,
                'map_id' => $payload['validated']['map_id'],
            ],
            [
                'watch_status' => WatchStatus::WATCHING,
            ]
        );


        $payload['collection'] = $collection;

        return $next($payload);
    }
}
