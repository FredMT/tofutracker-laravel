<?php

namespace App\Pipeline\UserAnimeSeason;

use App\Models\UserAnime;
use Closure;

class UpdateUserAnimeSeasonWatchStatus
{
    public function handle($payload, Closure $next)
    {
        $season = UserAnime::firstOrCreate(
            [
                'user_anime_collection_id' => $payload['collection']->id,
                'anidb_id' => $payload['validated']['anidb_id'],
            ],
            [
                'is_movie' => false,
                'watch_status' => $payload['validated']['watch_status']
            ]
        );


        $payload['season'] = $season;

        return $next($payload);
    }
}
