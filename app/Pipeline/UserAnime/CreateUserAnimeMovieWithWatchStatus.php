<?php

namespace App\Pipeline\UserAnime;

use App\Models\UserAnime\UserAnime;
use App\Models\UserAnime\UserAnimeCollection;
use Closure;

class CreateUserAnimeMovieWithWatchStatus
{
    public function handle(array $payload, Closure $next)
    {
        // Skip if already updated
        if (isset($payload['updated']) && $payload['updated']) {
            return $next($payload);
        }

        // Create collection if it doesn't exist
        $collection = UserAnimeCollection::create([
            'user_library_id' => $payload['library']->id,
            'map_id' => $payload['validated']['map_id'],
            'watch_status' => $payload['validated']['watch_status'],
        ]);

        // Create anime entry
        $userAnime = UserAnime::create([
            'user_anime_collection_id' => $collection->id,
            'anidb_id' => $payload['validated']['anidb_id'],
            'is_movie' => true,
            'watch_status' => $payload['validated']['watch_status'],
        ]);

        $payload['collection'] = $collection;
        $payload['user_anime'] = $userAnime;

        return $next($payload);
    }
}
