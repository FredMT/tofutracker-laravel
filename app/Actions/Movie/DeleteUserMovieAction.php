<?php

namespace App\Actions\Movie;

use App\Actions\Activity\ManageMovieWatchActivityAction;
use App\Models\UserMovie\UserMovie;
use App\Models\UserMovie\UserMoviePlay;

class DeleteUserMovieAction
{
    public function __construct(
        private readonly ManageMovieWatchActivityAction $manageActivity
    ) {}

    /**
     * Delete a user movie record and associated play records and activities.
     *
     * @param UserMovie $userMovie The user movie record to delete.
     * @return void
     */
    public function execute(UserMovie $userMovie): void
    {
        UserMoviePlay::where('user_movie_id', $userMovie->id)->delete();

        $this->manageActivity->delete($userMovie);

        $userMovie->delete();
    }
}
