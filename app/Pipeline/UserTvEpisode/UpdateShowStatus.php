<?php

namespace App\Pipeline\UserTvEpisode;

use App\Enums\WatchStatus;
use App\Models\TvSeason;
use App\Models\UserTvSeason;
use App\Models\UserTvShow;
use Closure;

class UpdateShowStatus
{
    public function __invoke($payload, Closure $next)
    {
        $show = UserTvShow::where([
            'user_id' => $payload['user']->id,
            'show_id' => $payload['validated']['show_id'],
        ])->first();

        if ($show) {
            // Get all season IDs except season 0
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

            // If all seasons are completed, mark show as completed
            if ($totalSeasons === $completedSeasons) {
                $show->update(['watch_status' => WatchStatus::COMPLETED]);
            }
        }

        return $next($payload);
    }
}
