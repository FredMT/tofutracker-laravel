<?php

namespace App\Pipeline\UserAnimeSeason;

use App\Enums\WatchStatus;
use App\Models\UserAnime;
use Closure;

class CreateUserAnimeSeason
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
                'watch_status' => WatchStatus::WATCHING,
                'rating' => $payload['validated']['rating'] ?? null,
            ]
        );

        $payload['season'] = $season;

        return $next($payload);
    }
}
