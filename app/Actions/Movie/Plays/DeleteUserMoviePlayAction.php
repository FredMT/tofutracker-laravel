<?php

namespace App\Actions\Movie\Plays;

use App\Actions\Activity\CreateUserActivityAction;
use App\Models\UserMovie\UserMovie;
use App\Models\UserMovie\UserMoviePlay;

class DeleteUserMoviePlayAction
{
    public function __construct(
        private readonly CreateUserActivityAction $createActivity
    ) {}

    public function execute(UserMovie $userMovie): void
    {
        // Delete all play records for this movie
        UserMoviePlay::where('user_movie_id', $userMovie->id)->delete();

        // Delete activity records
        $this->createActivity->deleteForSubject($userMovie);
    }
}
