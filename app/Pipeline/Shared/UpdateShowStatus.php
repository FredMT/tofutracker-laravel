<?php

namespace App\Pipeline\Shared;

use App\Actions\Activity\ManageTvShowWatchActivityAction;
use App\Actions\Tv\Plays\CreateUserTvShowPlayAction;
use App\Enums\WatchStatus;
use App\Models\TvSeason;
use App\Models\UserTv\UserTvSeason;
use App\Models\UserTv\UserTvShow;
use Closure;

class UpdateShowStatus
{
    public function __construct(
        private readonly CreateUserTvShowPlayAction $createTvShowPlay,
        private readonly ManageTvShowWatchActivityAction $manageActivity
    ) {}

    public function __invoke($payload, Closure $next)
    {
        // Get all non-special season IDs for this show
        $seasonIds = TvSeason::where('show_id', $payload['validated']['show_id'])
            ->where('season_number', '>', 0)
            ->pluck('id');

        if ($seasonIds->isEmpty()) {
            return $next($payload);
        }

        // Count total seasons (excluding season 0)
        $totalSeasons = $seasonIds->count();

        // Count completed seasons
        $completedSeasons = UserTvSeason::where([
            'user_id' => $payload['user']->id,
            'watch_status' => WatchStatus::COMPLETED,
        ])
            ->whereIn('season_id', $seasonIds)
            ->count();

        // If all seasons are completed, mark show as completed and create play record
        if ($totalSeasons === $completedSeasons && $payload['show']->watch_status !== WatchStatus::COMPLETED) {
            $payload['show']->update(['watch_status' => WatchStatus::COMPLETED]);

            // Create play record and activity for the show
            $this->createTvShowPlay->execute($payload['show']);
            $this->manageActivity->execute($payload['show']);
        }

        return $next($payload);
    }
}
