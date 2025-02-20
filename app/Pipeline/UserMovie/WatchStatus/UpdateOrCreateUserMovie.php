<?php

namespace App\Pipeline\UserMovie\WatchStatus;

use App\Actions\Activity\ManageMovieWatchActivityAction;
use App\Enums\MediaType;
use App\Enums\WatchStatus;
use App\Models\UserLibrary;
use App\Models\UserMovie\UserMovie;
use App\Models\UserMovie\UserMoviePlay;
use Closure;

class UpdateOrCreateUserMovie
{
    public function __construct(
        private readonly ManageMovieWatchActivityAction $manageActivity
    ) {}

    public function handle($payload)
    {
        if (!$payload['user_movie']) {
            return $this->createNewMovie($payload);
        }

        return $this->updateExistingMovie($payload);
    }

    private function createNewMovie(array $payload): array
    {
        $userLibrary = UserLibrary::firstOrCreate([
            'user_id' => $payload['user']->id,
            'type' => MediaType::MOVIE,
        ]);

        $userMovie = UserMovie::create([
            'user_id' => $payload['user']->id,
            'movie_id' => $payload['movie_id'],
            'user_library_id' => $userLibrary->id,
            'watch_status' => $payload['validated']['watch_status'],
        ]);

        if (($payload['validated']['watch_status']) === WatchStatus::COMPLETED->value) {
            $this->createMoviePlayAndActivity($userMovie);
        }

        return [
            'success' => true,
            'message' => 'Movie added to library successfully',
        ];
    }

    private function updateExistingMovie(array $payload): array
    {
        $userMovie = $payload['user_movie'];
        $oldStatus = $payload['user_movie']->watch_status;
        $newStatus = WatchStatus::from($payload['validated']['watch_status']);

        $userMovie->update(['watch_status' => $newStatus]);

        if ($oldStatus !== WatchStatus::COMPLETED && $newStatus === WatchStatus::COMPLETED) {
            $this->createMoviePlayAndActivity($userMovie);
        }

        return [
            'success' => true,
            'message' => 'Movie status updated successfully',
        ];
    }

    private function createMoviePlayAndActivity(UserMovie $userMovie): void
    {
        UserMoviePlay::create([
            'user_movie_id' => $userMovie->id,
            'user_id' => $userMovie->user_id,
            'movie_id' => $userMovie->movie_id,
            'watched_at' => now(),
        ]);

        $this->manageActivity->execute($userMovie);
    }
}
