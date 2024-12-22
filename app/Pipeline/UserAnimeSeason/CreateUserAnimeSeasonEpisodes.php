<?php

namespace App\Pipeline\UserAnimeSeason;

use App\Enums\WatchStatus;
use App\Models\AnimeEpisodeMapping;
use App\Models\UserAnime;
use App\Models\UserAnimeEpisode;
use App\Models\UserAnimePlay;
use Closure;

class CreateUserAnimeSeasonEpisodes
{
    public function handle($payload, Closure $next)
    {
        $watchStatus = $payload['validated']['watch_status'];
        // Update season's watch status
        $payload['season']->update(['watch_status' => $watchStatus]);

        // If status is COMPLETED, create all missing episodes and mark them completed
        if ($watchStatus ===  WatchStatus::COMPLETED->value) {
            // Get all non-special episodes for this anime
            $requiredEpisodes = AnimeEpisodeMapping::where('anidb_id', $payload['validated']['anidb_id'])
                ->where('is_special', false)
                ->get();


            // Get existing episode IDs
            $existingEpisodeIds = $payload['season']->episodes()
                ->pluck('episode_id')
                ->toArray();

            // Create missing episodes and their play records
            foreach ($requiredEpisodes as $episode) {
                if (!in_array($episode->id, $existingEpisodeIds)) {
                    // Create episode
                    $userEpisode = UserAnimeEpisode::create([
                        'user_anime_id' => $payload['season']->id,
                        'episode_id' => $episode->tvdb_episode_id,
                        'watch_status' => WatchStatus::COMPLETED->value,
                        'is_special' => false
                    ]);

                    // Create play record for episode
                    UserAnimePlay::create([
                        'playable_id' => $userEpisode->id,
                        'playable_type' => UserAnimeEpisode::class,
                        'watched_at' => now()
                    ]);
                }
            }

            // Create play record for the completed season
            UserAnimePlay::create([
                'playable_id' => $payload['season']->id,
                'playable_type' => UserAnime::class,
                'watched_at' => now()
            ]);
        }
        return $next($payload);
    }
}
