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

class UserMovieController extends Controller
{

    public function store(Request $request)
    {
        $validated = $request->validate([
            'movie_id' => ['required', 'integer', 'exists:movies,id'],
            'watch_status' => ['nullable', new Enum(WatchStatus::class)],
            'rating' => ['nullable', 'numeric', 'min:1', 'max:10'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                // Ensure user has a movie library
                $userLibrary = UserLibrary::firstOrCreate([
                    'user_id' => $request->user()->id,
                    'type' => MediaType::MOVIE,
                ]);

                // Create or update user movie entry
                $userMovie = UserMovie::updateOrCreate(
                    [
                        'user_id' => $request->user()->id,
                        'movie_id' => $validated['movie_id'],
                    ],
                    [
                        'user_library_id' => $userLibrary->id,
                        'watch_status' => $validated['watch_status'] ?? WatchStatus::COMPLETED,
                        'rating' => $validated['rating'] ?? null,
                    ]
                );

                if (($validated['watch_status'] ?? WatchStatus::COMPLETED) === WatchStatus::COMPLETED
                ) {
                    UserMoviePlay::create([
                        'user_movie_id' => $userMovie->id,
                        'user_id' => $request->user()->id,
                        'movie_id' => $validated['movie_id'],
                        'watched_at' => now(),
                    ]);
                }

                return back()->with([
                    'success' => true,
                    'message' => "Movie added to library",
                ]);
            });
        } catch (\Exception $e) {
            logger()->error('Failed to add movie to library: ' . $e->getMessage());
            return back()->with([
                'success' => false,
                'message' => "An error occurred while adding movie to library",
            ]);
        }
    }

    public function updateRating(Request $request, $movieId)
    {
        $validated = $request->validate([
            'rating' => ['required', 'numeric', 'min:1', 'max:10'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request, $movieId) {
                // Try to find existing user movie entry
                $userMovie = UserMovie::where([
                    'user_id' => $request->user()->id,
                    'movie_id' => $movieId,
                ])->first();

                // If movie exists, check authorization and update
                if ($userMovie) {
                    if ($request->user()->cannot('update', $userMovie)) {
                        return back()->with([
                            'success' => false,
                            'message' => "You are not authorized to update this movie's rating",
                        ]);
                    }

                    $userMovie->update([
                        'rating' => $validated['rating']
                    ]);

                    return back()->with([
                        'success' => true,
                        'message' => "Movie rating updated successfully",
                    ]);
                }

                // If movie doesn't exist, create new entries
                // First, ensure user has a movie library
                $userLibrary = UserLibrary::firstOrCreate([
                    'user_id' => $request->user()->id,
                    'type' => MediaType::MOVIE,
                ]);

                // Create user movie entry
                $userMovie = UserMovie::create([
                    'user_id' => $request->user()->id,
                    'movie_id' => $movieId,
                    'user_library_id' => $userLibrary->id,
                    'watch_status' => WatchStatus::COMPLETED,
                    'rating' => $validated['rating'],
                ]);

                // Create play record since we're marking it as COMPLETED
                UserMoviePlay::create([
                    'user_movie_id' => $userMovie->id,
                    'user_id' => $request->user()->id,
                    'movie_id' => $movieId,
                    'watched_at' => now(),
                ]);

                return back()->with([
                    'success' => true,
                    'message' => "Movie added to library with rating",
                ]);
            });
        } catch (\Exception $e) {
            logger()->error('Failed to update movie rating: ' . $e->getMessage());
            return back()->with([
                'success' => false,
                'message' => "An error occurred while updating movie rating",
            ]);
        }
    }

    public function updateStatus(Request $request, $movieId)
    {
        $validated = $request->validate([
            'watch_status' => ['required', new Enum(WatchStatus::class)],
        ]);


        try {
            return DB::transaction(function () use ($validated, $request, $movieId) {
                // Try to find existing user movie entry
                $userMovie = UserMovie::where([
                    'user_id' => $request->user()->id,
                    'movie_id' => $movieId,
                ])->first();

                // If movie exists, check authorization and update
                if ($userMovie) {
                    if ($request->user()->cannot('update', $userMovie)) {
                        return back()->with([
                            'success' => false,
                            'message' => "You are not authorized to update this movie's status",
                        ]);
                    }

                    $userMovie->update([
                        'watch_status' => $validated['watch_status']
                    ]);

                    // If status is changed to COMPLETED , add a play record
                    if ($validated['watch_status'] === WatchStatus::COMPLETED->value) {
                        UserMoviePlay::create([
                            'user_movie_id' => $userMovie->id,
                            'user_id' => $request->user()->id,
                            'movie_id' => $movieId,
                            'watched_at' => now(),
                        ]);
                    }

                    return back()->with([
                        'success' => true,
                        'message' => "Movie status updated successfully",
                    ]);
                }

                // If movie doesn't exist, create new entries
                // First, ensure user has a movie library
                $userLibrary = UserLibrary::firstOrCreate([
                    'user_id' => $request->user()->id,
                    'type' => MediaType::MOVIE,
                ]);

                // Create user movie entry
                $userMovie = UserMovie::create([
                    'user_id' => $request->user()->id,
                    'movie_id' => $movieId,
                    'user_library_id' => $userLibrary->id,
                    'watch_status' => $validated['watch_status'],
                ]);


                if ($validated['watch_status'] === WatchStatus::COMPLETED->value) {
                    UserMoviePlay::create([
                        'user_movie_id' => $userMovie->id,
                        'user_id' => $request->user()->id,
                        'movie_id' => $movieId,
                        'watched_at' => now(),
                    ]);
                }

                return back()->with([
                    'success' => true,
                    'message' => "Movie added to library with status",
                ]);
            });
        } catch (\Exception $e) {
            logger()->error('Failed to update movie status: ' . $e->getMessage());
            return back()->with([
                'success' => false,
                'message' => "An error occurred while updating movie status",
            ]);
        }
    }

    public function destroy(Request $request, $movieId)
    {
        try {
            return DB::transaction(function () use ($request, $movieId) {
                // Find the specific user movie entry
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

                $libraryId = $userMovie->user_library_id;

                UserLibrary::find($libraryId)->delete();

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
}
