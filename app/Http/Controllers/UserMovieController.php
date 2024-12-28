<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Models\UserLibrary;
use App\Models\UserMovie;
use App\Enums\MediaType;
use App\Enums\WatchStatus;
use App\Models\UserMoviePlay;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules\Enum;
use Illuminate\Support\Facades\Pipeline;
use App\Pipeline\UserMovie\EnsureUserLibrary;
use App\Pipeline\UserMovie\CreateUserMovie;
use App\Pipeline\UserMovie\CreateUserMoviePlay;
use App\Pipeline\UserMovie\EnsureMovieExists;
use App\Pipeline\UserMovie\UpdateMovieRating;
use Illuminate\Validation\Rule;

class UserMovieController extends Controller
{

    public function store(Request $request)
    {
        if ($request->user()->cannot('create', UserMovie::class)) {
            return back()->with([
                'success' => false,
                'message' => "You are not authorized to create a movie entry",
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
            logger()->error('Failed to add movie to library: ' . $e->getMessage());
            return back()->with([
                'success' => false,
                'message' => "An error occurred while adding movie to library",
            ]);
        }
    }

    public function update(Request $request, $movieId)
    {
        $validated = $request->validate([
            'rating' => ['sometimes', 'numeric', 'min:1', 'max:10'],
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
                        'message' => "You are not authorized to update this movie",
                    ]);
                }

                // If rating is provided but watch_status isn't, only set COMPLETED if movie isn't already completed
                if (isset($validated['rating']) && !isset($validated['watch_status'])) {
                    if (!$userMovie || $userMovie->watch_status !== WatchStatus::COMPLETED) {
                        $validated['watch_status'] = WatchStatus::COMPLETED->value;
                    }
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

                // Check if trying to update to the same rating
                if (
                    isset($validated['rating']) &&
                    $userMovie &&
                    (float) $validated['rating'] === (float) $userMovie->rating
                ) {
                    return back()->with([
                        'success' => false,
                        'message' => "Movie already has a rating of {$userMovie->rating}",
                    ]);
                }

                // Ensure user has a library if this is a new entry
                if (!$userMovie) {
                    $userLibrary = UserLibrary::firstOrCreate([
                        'user_id' => $request->user()->id,
                        'type' => MediaType::MOVIE,
                    ]);

                    // Update or create the movie entry
                    $userMovie = UserMovie::updateOrCreate(
                        [
                            'user_id' => $request->user()->id,
                            'movie_id' => $movieId,
                        ],
                        array_merge(
                            [
                                'user_library_id' => $userLibrary->id ?? $userMovie->user_library_id,
                            ],
                            collect($validated)->only(['rating', 'watch_status'])->toArray()
                        )
                    );

                    UserMoviePlay::create([
                        'user_movie_id' => $userMovie->id,
                        'user_id' => $request->user()->id,
                        'movie_id' => $movieId,
                        'watched_at' => now(),
                    ]);
                }



                $message = collect([
                    isset($validated['rating']) ? 'rating' : null,
                    isset($validated['watch_status']) ? 'status' : null,
                ])
                    ->filter()
                    ->join(' and ');

                return back()->with([
                    'success' => true,
                    'message' => "Movie $message updated successfully",
                ]);
            });
        } catch (\Exception $e) {
            logger()->error('Failed to update movie: ' . $e->getMessage());
            return back()->with([
                'success' => false,
                'message' => "An error occurred while updating movie",
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

                if (!$userMovie) {
                    return back()->with([
                        'success' => false,
                        'message' => "Movie not found in your library",
                    ]);
                }

                if ($request->user()->cannot('delete', $userMovie)) {
                    return back()->with([
                        'success' => false,
                        'message' => "You are not authorized to delete this movie",
                    ]);
                }

                // Get all play records
                $playRecords = UserMoviePlay::where('user_movie_id', $userMovie->id)->get();

                // Delete play records (activity logs will be deleted by model events)
                $playRecords->each->delete();

                // Delete the movie
                $userMovie->delete();

                return back()->with([
                    'success' => true,
                    'message' => "Movie removed from library",
                ]);
            });
        } catch (\Exception $e) {
            logger()->error('Failed to remove movie from library: ' . $e->getMessage());
            return back()->with([
                'success' => false,
                'message' => "An error occurred while removing movie from library",
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
                'message' => "Successfully rated movie",
            ]);
        });
    }
}
