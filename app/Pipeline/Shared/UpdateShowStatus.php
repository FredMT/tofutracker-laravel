<?php

namespace App\Pipeline\Shared;

use App\Enums\WatchStatus;
use App\Models\TvSeason;
use App\Models\UserTvPlay;
use App\Models\UserTvSeason;
use App\Models\UserTvShow;
use Closure;

class UpdateShowStatus
{
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
        if ($totalSeasons === $completedSeasons) {
            $payload['show']->update(['watch_status' => WatchStatus::COMPLETED]);

            // Create play record for the show
            UserTvPlay::create([
                'user_id' => $payload['user']->id,
                'user_tv_show_id' => $payload['show']->id,
                'playable_id' => $payload['show']->id,
                'playable_type' => UserTvShow::class,
                'watched_at' => now(),
            ]);
        }

        return $next($payload);
    }
}
