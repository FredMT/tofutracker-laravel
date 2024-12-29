<?php

namespace App\Pipeline\UserMovie;

use App\Actions\Movie\Plays\CreateUserMoviePlayAction;
use App\Enums\WatchStatus;
use Closure;

class CreateUserMoviePlay
{
    public function __construct(
        private readonly CreateUserMoviePlayAction $createMoviePlay
    ) {}

    public function handle($payload, Closure $next)
    {
        if (($payload['validated']['watch_status'] ?? WatchStatus::COMPLETED) === WatchStatus::COMPLETED) {
            $this->createMoviePlay->execute($payload['user_movie']);
        }

        return $next($payload);
    }
}
