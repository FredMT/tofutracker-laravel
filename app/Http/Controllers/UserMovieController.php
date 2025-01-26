<?php

namespace App\Http\Controllers;

use App\Actions\Movie\Plays\CreateUserMoviePlayAction;
use App\Actions\Movie\Plays\DeleteUserMoviePlayAction;
use App\Enums\MediaType;
use App\Enums\WatchStatus;
use App\Models\UserLibrary;
use App\Models\UserMovie\UserMovie;
use App\Pipeline\UserMovie\CreateUserMovie;
use App\Pipeline\UserMovie\CreateUserMoviePlay;
use App\Pipeline\UserMovie\EnsureMovieExists;
use App\Pipeline\UserMovie\EnsureUserLibrary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Pipeline;
use Illuminate\Validation\Rule;

class UserMovieController extends Controller
{
    public function __construct(
        private readonly CreateUserMoviePlayAction $createMoviePlay,
        private readonly DeleteUserMoviePlayAction $deleteMoviePlay,
    ) {}

    public function store(Request $request)
    {
        if ($request->user()->cannot('create', UserMovie::class)) {
            return back()->with([
                'success' => false,
                'message' => 'You are not authorized to create a movie entry',
            ]);
        }

        $validated = $request->validate([
            'movie_id' => ['required', 'integer'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                return Pipeline::send([
                    'user' => $request->user(),
                    'validated' => $validated,
                ])
                    ->through([
                        EnsureMovieExists::class,
                        EnsureUserLibrary::class,
                        CreateUserMovie::class,
                        CreateUserMoviePlay::class,
                    ])
                    ->then(function ($payload) {
                        return back()->with([
                            'success' => true,
                            'message' => "{$payload['movie_title']} added to library",
                        ]);
                    });
            });
        } catch (\Exception $e) {
            logger()->error('Failed to add movie to library: '.$e->getMessage());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while adding movie to library',
            ]);
        }
    }

    public function update(Request $request, $movieId)
    {
        $validated = $request->validate([
            'watch_status' => ['sometimes', Rule::enum(WatchStatus::class)],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request, $movieId) {
                $userMovie = UserMovie::where([
                    'user_id' => $request->user()->id,
                    'movie_id' => $movieId,
                ])->first();

                // Check authorization
                if ($userMovie && $request->user()->cannot('update', $userMovie)) {
                    return back()->with([
                        'success' => false,
                        'message' => 'You are not authorized to update this movie',
                    ]);
                }

                // Check if trying to update to the same watch status
                if (
                    isset($validated['watch_status']) &&
                    $userMovie &&
                    WatchStatus::from($validated['watch_status']) === $userMovie->watch_status
                ) {
                    return back()->with([
                        'success' => false,
                        'message' => "Movie is already marked as {$userMovie->watch_status->value}",
                    ]);
                }

                if (! $userMovie) {
                    // Create new movie entry
                    $userLibrary = UserLibrary::firstOrCreate([
                        'user_id' => $request->user()->id,
                        'type' => MediaType::MOVIE,
                    ]);

                    $userMovie = UserMovie::create([
                        'user_id' => $request->user()->id,
                        'movie_id' => $movieId,
                        'user_library_id' => $userLibrary->id,
                        'watch_status' => $validated['watch_status'] ?? WatchStatus::COMPLETED,
                    ]);

                    // Create a play record if status is COMPLETED
                    if (($validated['watch_status'] ?? WatchStatus::COMPLETED) === WatchStatus::COMPLETED) {
                        $this->createMoviePlay->execute($userMovie);
                    }
                } else {
                    // Update existing movie
                    $oldStatus = $userMovie->watch_status;
                    $newStatus = WatchStatus::from($validated['watch_status']);

                    $userMovie->update([
                        'watch_status' => $newStatus,
                    ]);

                    // Create a play record if status changed to COMPLETED
                    if ($oldStatus !== WatchStatus::COMPLETED && $newStatus === WatchStatus::COMPLETED) {
                        $this->createMoviePlay->execute($userMovie);
                    }
                }

                return back()->with([
                    'success' => true,
                    'message' => 'Movie status updated successfully',
                ]);
            });
        } catch (\Exception $e) {
            logger()->error('Failed to update movie: '.$e->getMessage());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while updating movie',
            ]);
        }
    }

    public function destroy(Request $request, $movieId)
    {
        try {
            return DB::transaction(function () use ($request, $movieId) {
                $userMovie = UserMovie::where([
                    'user_id' => $request->user()->id,
                    'movie_id' => $movieId,
                ])->first();

                if (! $userMovie) {
                    return back()->with([
                        'success' => false,
                        'message' => 'Movie not found in your library',
                    ]);
                }

                if ($request->user()->cannot('delete', $userMovie)) {
                    return back()->with([
                        'success' => false,
                        'message' => 'You are not authorized to delete this movie',
                    ]);
                }

                // Delete play records and activities
                $this->deleteMoviePlay->execute($userMovie);

                // Delete the movie
                $userMovie->delete();

                return back()->with([
                    'success' => true,
                    'message' => 'Movie removed from library',
                ]);
            });
        } catch (\Exception $e) {
            logger()->error('Failed to remove movie from library: '.$e->getMessage());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while removing movie from library',
            ]);
        }
    }

    public function rate(Request $request, $movieId)
    {
        $validated = $request->validate([
            'rating' => ['required', 'numeric', 'min:1', 'max:10'],
        ]);

        $validated['movie_id'] = $movieId;

        return Pipeline::send([
            'user' => $request->user(),
            'validated' => $validated,
        ])->through([
            \App\Pipeline\UserMovie\Rate\EnsureMovieExists::class,
            \App\Pipeline\UserMovie\Rate\UpdateOrCreateUserMovie::class,
        ])->then(function ($payload) {
            return back()->with([
                'success' => true,
                'message' => 'Successfully rated movie',
            ]);
        });
    }
}
