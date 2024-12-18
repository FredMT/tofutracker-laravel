<?php

namespace App\Pipeline\UserTvEpisode;

use App\Enums\WatchStatus;
use App\Models\TvEpisode;
use App\Models\UserTvEpisode;
use App\Models\UserTvPlay;
use App\Models\UserTvSeason;
use Closure;

class UpdateSeasonStatus
{
    public function __invoke($payload, Closure $next)
    {
        // Get all episode IDs for this season
        $episodeIds = TvEpisode::where([
            'show_id' => $payload['validated']['show_id'],
            'season_id' => $payload['validated']['season_id'],
        ])->pluck('id');

        if ($episodeIds->isEmpty()) {
            return $next($payload);
        }

        // Count total episodes
        $totalEpisodes = $episodeIds->count();

        // Count completed episodes
        $completedEpisodes = UserTvEpisode::where([
            'user_id' => $payload['user']->id,
            'watch_status' => WatchStatus::COMPLETED,
        ])
            ->whereIn('episode_id', $episodeIds)
            ->count();

        // If all episodes are completed, mark season as completed and create play record
        if ($totalEpisodes === $completedEpisodes) {
            $userSeason = UserTvSeason::where([
                'user_id' => $payload['user']->id,
                'season_id' => $payload['validated']['season_id'],
            ])->first();

            if ($userSeason) {
                $userSeason->update(['watch_status' => WatchStatus::COMPLETED]);

                // Create play record for the season if it doesn't exist
                UserTvPlay::firstOrCreate([
                    'user_id' => $payload['user']->id,
                    'user_tv_show_id' => $payload['show']->id,
                    'user_tv_season_id' => $userSeason->id,
                    'playable_id' => $userSeason->id,
                    'playable_type' => UserTvSeason::class,
                ], [
                    'watched_at' => now(),
                ]);
            }
        }

        return $next($payload);
    }
}
