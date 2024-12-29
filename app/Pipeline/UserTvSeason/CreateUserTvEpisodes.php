<?php

namespace App\Pipeline\UserTvSeason;

use App\Actions\Tv\Plays\CreateUserTvPlayAction;
use App\Enums\WatchStatus;
use App\Models\TvEpisode;
use App\Models\UserTvEpisode;
use Closure;

class CreateUserTvEpisodes
{
    public function __construct(
        private readonly CreateUserTvPlayAction $createTvPlay
    ) {}

    public function __invoke($payload, Closure $next)
    {
        // Get all episodes for this season
        $episodes = TvEpisode::where([
            'season_id' => $payload['validated']['season_id'],
            'show_id' => $payload['validated']['show_id'],
        ])->get();

        foreach ($episodes as $episode) {
            // Create or update user episode
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
            $this->createTvPlay->execute($userEpisode);
        }

        return $next($payload);
    }
}
