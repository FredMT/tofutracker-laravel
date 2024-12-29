<?php

namespace App\Pipeline\UserAnimeEpisode;

use App\Actions\Anime\Plays\CreateUserAnimePlayAction;
use App\Enums\WatchStatus;
use App\Models\UserAnimeEpisode;
use Closure;

class CreateUserAnimeEpisodeAndPlay
{
    protected CreateUserAnimePlayAction $createPlayAction;

    public function __construct(CreateUserAnimePlayAction $createPlayAction)
    {
        $this->createPlayAction = $createPlayAction;
    }

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
        $this->createPlayAction->execute($episode);

        $payload['episode'] = $episode;

        return $next($payload);
    }
}
