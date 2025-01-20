<?php

namespace App\Pipeline\UserAnime;

use App\Actions\Anime\Plays\CreateUserAnimePlayAction;
use Closure;

class CreateUserAnimeMoviePlay
{
    protected CreateUserAnimePlayAction $createPlayAction;

    public function __construct(CreateUserAnimePlayAction $createPlayAction)
    {
        $this->createPlayAction = $createPlayAction;
    }

    public function handle(array $payload, Closure $next)
    {
        if (isset($payload['updated']) && $payload['updated']) {
            return $next($payload);
        }

        $this->createPlayAction->executeMultiple([
            $payload['user_anime'],
            $payload['collection'],
        ]);

        return $next($payload);
    }
}
