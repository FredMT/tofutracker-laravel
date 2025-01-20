<?php

namespace App\Pipeline\UserAnime;

use App\Enums\WatchStatus;
use App\Models\UserAnime;
use Closure;

class CreateUserAnimeMovie
{
    public function handle(array $payload, Closure $next)
    {
        $userAnime = UserAnime::create([
            'user_anime_collection_id' => $payload['collection']->id,
            'anidb_id' => $payload['validated']['anidb_id'],
            'is_movie' => true,
            'rating' => $payload['validated']['rating'] ?? null,
            'watch_status' => WatchStatus::COMPLETED,
        ]);

        $payload['user_anime'] = $userAnime;

        return $next($payload);
    }
}
