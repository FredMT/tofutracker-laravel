<?php

namespace App\Pipeline\UserMovie\Rate;

use App\Actions\Activity\ManageMovieWatchActivityAction;
use App\Enums\MediaType;
use App\Enums\WatchStatus;
use App\Models\UserLibrary;
use App\Models\UserMovie\UserMovie;
use App\Models\UserMovie\UserMoviePlay;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Gate;

class UpdateOrCreateUserMovieWithRating
{
    public function __construct(private ManageMovieWatchActivityAction $manageMovieWatchActivityAction)
    {
        $this->manageMovieWatchActivityAction = $manageMovieWatchActivityAction;
    }

    public function handle($payload, Closure $next)
    {
        $userMovie = UserMovie::where([
            'user_id' => $payload['user']->id,
            'movie_id' => $payload['validated']['movie_id'],
        ])->first();

        if ($userMovie) {
            // Check if user can rate this movie
            if (Gate::denies('rate-movie', $userMovie)) {
                throw new AuthorizationException('You are not authorized to rate this movie');
            }

            $userMovie->update([
                'rating' => $payload['validated']['rating'],
            ]);
        } else {
            // Ensure user has a movie library
            $userLibrary = UserLibrary::firstOrCreate([
                'user_id' => $payload['user']->id,
                'type' => MediaType::MOVIE,
            ]);

            // Create new movie entry with COMPLETED status
            $userMovie = UserMovie::create([
                'user_id' => $payload['user']->id,
                'movie_id' => $payload['validated']['movie_id'],
                'user_library_id' => $userLibrary->id,
                'rating' => $payload['validated']['rating'],
                'watch_status' => WatchStatus::COMPLETED,
            ]);

            // Create a play record
            UserMoviePlay::create([
                'user_movie_id' => $userMovie->id,
                'user_id' => $payload['user']->id,
                'movie_id' => $payload['validated']['movie_id'],
                'watched_at' => now(),
            ]);

            $this->manageMovieWatchActivityAction->execute($userMovie);
        }

        return $next($payload);
    }
}
