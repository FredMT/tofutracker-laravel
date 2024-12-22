<?php

namespace App\Pipeline\UserAnimeEpisode;

use App\Enums\WatchStatus;
use App\Models\UserAnimeEpisode;
use App\Models\UserAnimePlay;
use Closure;

class CreateUserAnimeEpisodeAndPlay
{
    public function handle($payload, Closure $next)
    {
        // Create episode
        $episode = UserAnimeEpisode::create([
            'user_anime_id' => $payload['user_anime']->id,
            'episode_id' => $payload['validated']['tvdb_episode_id'],
            'watch_status' => WatchStatus::COMPLETED->value,
            'is_special' => false
        ]);

        // Create play record for episode
        UserAnimePlay::create([
            'playable_id' => $episode->id,
            'playable_type' => UserAnimeEpisode::class,
            'watched_at' => now()
        ]);

        $payload['episode'] = $episode;

        return $next($payload);
    }
}
