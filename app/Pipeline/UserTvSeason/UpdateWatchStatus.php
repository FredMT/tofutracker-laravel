<?php

namespace App\Pipeline\UserTvSeason;

use App\Enums\WatchStatus;
use App\Models\TvEpisode;
use App\Models\UserTvEpisode;
use App\Models\UserTvPlay;
use App\Models\UserTvSeason;
use Closure;

class UpdateWatchStatus
{
    public function __invoke($payload, Closure $next)
    {
        $watchStatus = WatchStatus::from($payload['validated']['watch_status']);
        $userSeason = $payload['user_season'] ?? null;

        // If status is COMPLETED, we need to create all episodes and plays
        if ($watchStatus === WatchStatus::COMPLETED) {
            // Get all episodes for this season
            $episodes = TvEpisode::where([
                'show_id' => $payload['validated']['show_id'],
                'season_id' => $payload['validated']['season_id'],
            ])->get();

            // Create/update all episodes as completed
            foreach ($episodes as $episode) {
                $userEpisode = UserTvEpisode::updateOrCreate(
                    [
                        'user_id' => $payload['user']->id,
                        'episode_id' => $episode->id,
                    ],
                    [
                        'user_tv_season_id' => $payload['user_season']->id,
                        'show_id' => $payload['validated']['show_id'],
                        'season_id' => $payload['validated']['season_id'],
                        'watch_status' => WatchStatus::COMPLETED,
                    ]
                );

                // Create play record for the episode
                UserTvPlay::firstOrCreate([
                    'user_id' => $payload['user']->id,
                    'user_tv_show_id' => $payload['show']->id,
                    'user_tv_season_id' => $payload['user_season']->id,
                    'user_tv_episode_id' => $userEpisode->id,
                    'playable_id' => $userEpisode->id,
                    'playable_type' => UserTvEpisode::class,
                ], [
                    'watched_at' => now(),
                ]);
            }

            // Create play record for the season
            UserTvPlay::firstOrCreate([
                'user_id' => $payload['user']->id,
                'user_tv_show_id' => $payload['show']->id,
                'user_tv_season_id' => $payload['user_season']->id,
                'playable_id' => $payload['user_season']->id,
                'playable_type' => UserTvSeason::class,
            ], [
                'watched_at' => now(),
            ]);
        }

        // Update the season's watch status
        $payload['user_season']->update(['watch_status' => $watchStatus]);

        return $next($payload);
    }
}
