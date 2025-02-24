<?php

namespace App\Pipeline\UserMovie;

use App\Actions\Activity\ManageMovieWatchActivityAction;
use Closure;

class CreateUserMovieWatchActivity
{
    public function __construct(
        private readonly ManageMovieWatchActivityAction $manageActivity
    ) {}

    public function handle($payload, Closure $next)
    {
        $this->manageActivity->execute($payload['user_movie']);

        return $next($payload);
    }
}
