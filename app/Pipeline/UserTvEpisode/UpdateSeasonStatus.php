<?php

namespace App\Pipeline\UserTvEpisode;

use App\Enums\WatchStatus;
use App\Models\TvEpisode;
use App\Models\UserTvEpisode;
use App\Models\UserTvSeason;
use Closure;

class UpdateSeasonStatus
{
    public function __invoke($payload, Closure $next)
    {
        $season = UserTvSeason::where([
            'user_id' => $payload['user']->id,
            'season_id' => $payload['validated']['season_id'],
        ])->first();

        if ($season) {
            // Count total episodes in the season from tv_episodes table
            $totalEpisodes = TvEpisode::where([
                'season_id' => $payload['validated']['season_id'],
                'show_id' => $payload['validated']['show_id'],
            ])->count();

            // Count completed episodes from user's episodes
            $completedEpisodes = UserTvEpisode::where([
                'user_id' => $payload['user']->id,
                'season_id' => $payload['validated']['season_id'],
                'watch_status' => WatchStatus::COMPLETED,
            ])->count();

            // If all episodes are completed, mark season as completed
            if ($totalEpisodes > 0 && $totalEpisodes === $completedEpisodes) {
                $season->update(['watch_status' => WatchStatus::COMPLETED]);
            }
        }

        return $next($payload);
    }
}
