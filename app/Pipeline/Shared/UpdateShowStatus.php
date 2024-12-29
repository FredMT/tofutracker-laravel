<?php

namespace App\Pipeline\Shared;

use App\Actions\Tv\Plays\CreateUserTvShowPlayAction;
use App\Enums\WatchStatus;
use App\Models\TvSeason;
use App\Models\UserTvPlay;
use App\Models\UserTvSeason;
use App\Models\UserTvShow;
use Closure;

class UpdateShowStatus
{
    public function __construct(
        private readonly CreateUserTvShowPlayAction $createTvShowPlay
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

        $userTvShow = UserTvShow::where(['user_id' => $payload['user']->id, 'show_id' => $payload['validated']['show_id']])->first();
        // If all seasons are completed, mark show as completed and create play record
        if ($totalSeasons === $completedSeasons && $payload['show']->watch_status !== WatchStatus::COMPLETED) {
            $payload['show']->update(['watch_status' => WatchStatus::COMPLETED]);

            // Create play record and activity for the show
            $this->createTvShowPlay->execute($payload['show']);
        }

        return $next($payload);
    }
}
