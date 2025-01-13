<?php

namespace App\Pipeline\UserAnimeEpisode;

use App\Actions\Anime\Plays\CreateUserAnimePlayAction;
use App\Enums\WatchStatus;
use App\Models\AnimeEpisodeMapping;
use Closure;

class UpdateUserAnimeEpisodeStatus
{
    protected CreateUserAnimePlayAction $createPlayAction;

    public function __construct(CreateUserAnimePlayAction $createPlayAction)
    {
        $this->createPlayAction = $createPlayAction;
    }

    public function handle($payload, Closure $next)
    {
        $userAnime = $payload['user_anime'];

        // Get all required non-special episodes
        $requiredEpisodeCount = AnimeEpisodeMapping::where('anidb_id', $payload['validated']['anidb_id'])
            ->where('is_special', false)
            ->count();

        // Get completed episodes count
        $completedEpisodeCount = $userAnime->episodes()
            ->where('watch_status', WatchStatus::COMPLETED->value)
            ->count();

        // If all episodes are completed
        if ($completedEpisodeCount === $requiredEpisodeCount) {
            // Update anime status
            $userAnime->update(['watch_status' => WatchStatus::COMPLETED->value]);
            $this->createPlayAction->execute($userAnime);
        }

        return $next($payload);
    }
}
