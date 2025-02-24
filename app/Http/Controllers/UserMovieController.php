<?php

namespace App\Http\Controllers;

use App\Actions\Movie\DeleteUserMovieAction;
use App\Actions\UserController\Movie\StoreUserMovie;
use App\Actions\UserController\Movie\UpdateUserMovieStatusAction;
use App\Enums\WatchStatus;
use App\Models\UserMovie\UserMovie;
use App\Pipeline\UserMovie\Rate\UpdateOrCreateUserMovieWithRating;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Pipeline;
use Illuminate\Validation\Rule;

class UserMovieController extends Controller
{
    public function store(Request $request, StoreUserMovie $storeUserMovie)
    {
        if ($request->user()->cannot('create', UserMovie::class)) {
            return back()->with([
                'success' => false,
                'message' => 'You are not authorized to create a movie entry',
            ]);
        }

        $validated = $request->validate([
            'movie_id' => ['required', 'integer', 'exists:movies,id'],
        ]);

        try {
            return $storeUserMovie->execute($validated, request()->user());
        } catch (\Exception $e) {
            logger()->error($e);

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while adding movie to library',
            ]);
        }
    }

    public function watch_status(Request $request, UpdateUserMovieStatusAction $updateUserMovieStatusAction)
    {
        $validated = $request->validate([
            'movie_id' => ['required', 'integer', 'exists:movies,id'],
            'watch_status' => ['sometimes', Rule::enum(WatchStatus::class)],
        ]);

        try {
            $result = $updateUserMovieStatusAction->execute(
                $request->user(),
                $validated
            );

            return back()->with([
                'success' => $result['success'],
                'message' => $result['message'],
            ]);
        } catch (\Exception $e) {
            logger()->error($e);

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while updating movie',
            ]);
        }
    }

    public function rate(Request $request)
    {
        $validated = $request->validate([
            'rating' => ['required', 'numeric', 'min:1', 'max:10'],
            'movie_id' => ['required', 'integer', 'exists:movies,id'],
        ]);

        try {
            Pipeline::send([
                'user' => $request->user(),
                'validated' => $validated,
            ])->through([
                UpdateOrCreateUserMovieWithRating::class,
            ])->thenReturn();

            return back()->with([
                'success' => true,
                'message' => 'Successfully rated movie',
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => 'You are not authorized to rate this movie',
            ]);
        } catch (\Exception $e) {
            logger()->error($e);

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while rating the movie',
            ]);
        }
    }

    public function destroy(Request $request, DeleteUserMovieAction $deleteUserMovie)
    {
        $validated = $request->validate([
            'movie_id' => ['required', 'integer', 'exists:movies,id'],
        ]);

        try {
            return DB::transaction(function () use ($request, $validated, $deleteUserMovie) {
                $userMovie = UserMovie::where([
                    'user_id' => $request->user()->id,
                    'movie_id' => $validated['movie_id'],
                ])->firstOrFail();

                if ($request->user()->cannot('delete', $userMovie)) {
                    return back()->withErrors([
                        'success' => false,
                        'message' => 'You are not authorized to delete this movie',
                    ]);
                }

                $deleteUserMovie->execute($userMovie);

                return back()->with([
                    'success' => true,
                    'message' => 'Movie removed from library',
                ]);
            });
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->withErrors([
                'success' => false,
                'message' => 'Movie not found in your library',
            ]);
        } catch (\Exception $e) {
            logger()->error($e);

            return back()->withErrors([
                'success' => false,
                'message' => 'An error occurred while removing movie from library',
            ]);
        }
    }
}
