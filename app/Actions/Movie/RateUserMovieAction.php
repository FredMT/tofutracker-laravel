<?php

namespace App\Actions\Movie;

use App\Enums\MediaType;
use App\Enums\WatchStatus;
use App\Models\UserLibrary;
use App\Models\UserMovie\UserMovie;
use App\Models\UserMovie\UserMoviePlay;
use Illuminate\Support\Facades\Gate;

class RateUserMovieAction
{
    public function execute(array $data): UserMovie
    {
        $userMovie = $this->findUserMovie($data['user']->id, $data['movie_id']);

        if ($userMovie) {
            return $this->updateExistingMovie($userMovie, $data['rating']);
        }

        return $this->createNewUserMovie($data);
    }

    private function findUserMovie(int $userId, int $movieId): ?UserMovie
    {
        return UserMovie::where([
            'user_id' => $userId,
            'movie_id' => $movieId,
        ])->first();
    }

    private function updateExistingMovie(UserMovie $userMovie, float $rating): UserMovie
    {
        if (Gate::denies('rate-movie', $userMovie)) {
            throw new \Exception('You are not authorized to rate this movie');
        }

        $userMovie->update(['rating' => $rating]);

        return $userMovie;
    }

    private function createNewUserMovie(array $data): UserMovie
    {
        $userLibrary = $this->ensureUserLibrary($data['user']->id);

        $userMovie = UserMovie::create([
            'user_id' => $data['user']->id,
            'movie_id' => $data['movie_id'],
            'user_library_id' => $userLibrary->id,
            'rating' => $data['rating'],
            'watch_status' => WatchStatus::COMPLETED,
        ]);

        $this->createPlayRecord($userMovie);

        return $userMovie;
    }

    private function ensureUserLibrary(int $userId): UserLibrary
    {
        return UserLibrary::firstOrCreate([
            'user_id' => $userId,
            'type' => MediaType::MOVIE,
        ]);
    }

    private function createPlayRecord(UserMovie $userMovie): void
    {
        UserMoviePlay::create([
            'user_movie_id' => $userMovie->id,
            'user_id' => $userMovie->user_id,
            'movie_id' => $userMovie->movie_id,
            'watched_at' => now(),
        ]);
    }
}
