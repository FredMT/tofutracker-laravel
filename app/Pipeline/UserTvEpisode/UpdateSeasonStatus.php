<?php

namespace App\Pipeline\UserTvEpisode;

use App\Actions\Tv\Plays\CreateUserTvSeasonPlayAction;
use App\Enums\WatchStatus;
use App\Models\TvEpisode;
use App\Models\UserTv\UserTvEpisode;
use App\Models\UserTv\UserTvSeason;
use Closure;

class UpdateSeasonStatus
{
    public function __construct(
        private readonly CreateUserTvSeasonPlayAction $createTvSeasonPlay
    ) {}

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

            if ($userSeason && $userSeason->watch_status !== WatchStatus::COMPLETED) {
                $userSeason->update(['watch_status' => WatchStatus::COMPLETED]);

                // Create play record and activity for the season
                $this->createTvSeasonPlay->execute($userSeason);
            }
        }

        return $next($payload);
    }
}
