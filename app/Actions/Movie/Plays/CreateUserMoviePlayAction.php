<?php

namespace App\Actions\Movie\Plays;

use App\Actions\Activity\CreateUserActivityAction;
use App\Models\UserMovie;
use App\Models\UserMoviePlay;

class CreateUserMoviePlayAction
{
    public function __construct(
        private readonly CreateUserActivityAction $createActivity
    ) {}

    public function execute(UserMovie $userMovie, ?\DateTime $watchedAt = null): UserMoviePlay
    {
        $play = UserMoviePlay::create([
            'user_movie_id' => $userMovie->id,
            'user_id' => $userMovie->user_id,
            'movie_id' => $userMovie->movie_id,
            'watched_at' => $watchedAt ?? now(),
        ]);

        // Record activity
        $this->createActivity->execute(
            userId: $userMovie->user_id,
            activityType: 'movie_watch',
            subject: $userMovie,
            metadata: [
                'user_movie_id' => $userMovie->id,
                'movie_id' => $userMovie->movie_id,
            ]
        );

        return $play;
    }
}
