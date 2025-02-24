<?php

namespace App\Pipeline\UserTvEpisode;

use App\Actions\Tv\Plays\CreateUserTvPlayAction;
use Closure;

class CreateUserTvEpisodePlay
{
    public function __construct(
        private readonly CreateUserTvPlayAction $createTvPlay
    ) {}

    public function __invoke($payload, Closure $next)
    {
        $this->createTvPlay->execute($payload['episode']);

        return $next($payload);
    }
}
