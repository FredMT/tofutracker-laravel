<?php

namespace App\Pipeline\UserAnimeEpisode;

use App\Enums\WatchStatus;
use App\Models\UserAnime;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Gate;

class CreateUserAnimeEpisodeAnime
{
    public function handle($payload, Closure $next)
    {
        $userAnime = UserAnime::firstOrCreate(
            [
                'user_anime_collection_id' => $payload['collection']->id,
                'anidb_id' => $payload['validated']['anidb_id'],
            ],
            [
                'is_movie' => false,
                'watch_status' => WatchStatus::WATCHING->value
            ]
        );

        $payload['user_anime'] = $userAnime;

        return $next($payload);
    }
}
