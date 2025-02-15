<?php

namespace App\Pipeline\UserTvEpisode;

use App\Actions\Tv\Plays\CreateUserTvPlayAction;
use App\Enums\WatchStatus;
use Closure;

class CreateUserTvEpisodePlay
{
    public function __construct(
        private readonly CreateUserTvPlayAction $createTvPlay
    ) {}

    public function __invoke($payload, Closure $next)
    {
        if ($payload['episode']->watch_status === WatchStatus::COMPLETED) {
            $this->createTvPlay->execute($payload['episode']);
        }

        return $next($payload);
    }
}
