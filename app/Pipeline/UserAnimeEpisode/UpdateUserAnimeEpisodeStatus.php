<?php

namespace App\Pipeline\UserAnimeEpisode;

use App\Enums\WatchStatus;
use App\Models\AnimeEpisodeMapping;
use App\Models\UserAnime;
use App\Models\UserAnimePlay;
use Closure;

class UpdateUserAnimeEpisodeStatus
{
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

            UserAnimePlay::create([
                'playable_id' => $userAnime->id,
                'playable_type' => UserAnime::class,
                'watched_at' => now()
            ]);
        }

        return $next($payload);
    }
}
