<?php

namespace App\Pipeline\UserAnimeSeason;

use App\Actions\Anime\Plays\CreateUserAnimePlayAction;
use App\Enums\WatchStatus;
use App\Models\Anime\AnimeEpisodeMapping;
use App\Models\UserAnime\UserAnimeEpisode;
use Closure;

class CreateUserAnimeSeasonEpisodes
{
    protected CreateUserAnimePlayAction $createPlayAction;

    public function __construct(CreateUserAnimePlayAction $createPlayAction)
    {
        $this->createPlayAction = $createPlayAction;
    }

    public function handle($payload, Closure $next)
    {
        $watchStatus = $payload['validated']['watch_status'];
        $payload['season']->update(['watch_status' => $watchStatus]);

        // If status is COMPLETED, create all missing episodes and mark them completed
        if ($watchStatus === WatchStatus::COMPLETED->value) {
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
                if (! in_array($episode->id, $existingEpisodeIds)) {
                    // Create episode
                    $userEpisode = UserAnimeEpisode::firstOrCreate([
                        'user_anime_id' => $payload['season']->id,
                        'episode_id' => $episode->tvdb_episode_id,
                        'watch_status' => WatchStatus::COMPLETED->value,
                        'is_special' => false,
                    ]);

                    // Create play record for episode
                    $this->createPlayAction->execute($userEpisode);
                }
            }

            // Create play record for the completed season
            $this->createPlayAction->execute($payload['season']);
        }

        return $next($payload);
    }
}
