<?php

namespace App\Pipeline\UserTvSeason;

use App\Actions\UserController\Tv\TvSeason\CreateCompletedEpisodesAction;
use App\Enums\WatchStatus;
use Closure;

class UpdateEpisodesAndWatchStatus
{
    public function __construct(
        private readonly CreateCompletedEpisodesAction $createCompletedEpisodes
    ) {}

    public function __invoke($payload, Closure $next)
    {
        $watchStatus = WatchStatus::from($payload['validated']['watch_status']);

        if ($watchStatus === WatchStatus::COMPLETED) {
            $this->createCompletedEpisodes->execute([
                'user_id' => $payload['user']->id,
                'show_id' => $payload['validated']['show_id'],
                'season_id' => $payload['validated']['season_id'],
                'user_season_id' => $payload['user_season']->id,
                'user_season' => $payload['user_season'],
                'show' => $payload['show'],
            ]);
        }

        $payload['user_season']->update(['watch_status' => $watchStatus]);

        return $next($payload);
    }
}
