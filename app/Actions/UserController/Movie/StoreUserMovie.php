<?php

namespace App\Actions\UserController\Movie;

use App\Models\Movie;
use App\Models\User;
use App\Pipeline\UserMovie\CreateUserMovie;
use App\Pipeline\UserMovie\CreateUserMoviePlay;
use App\Pipeline\UserMovie\CreateUserMovieWatchActivity;
use App\Pipeline\UserMovie\EnsureUserLibrary;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Pipeline;

class StoreUserMovie
{
    public function execute(array $validated, User $user)
    {
        return DB::transaction(function () use ($validated, $user) {
            $title = Movie::find($validated['movie_id'])->title;
            return Pipeline::send([
                'user' => $user,
                'validated' => $validated,
                'title' => $title,
            ])
                ->through([
                    EnsureUserLibrary::class,
                    CreateUserMovie::class,
                    CreateUserMoviePlay::class,
                    CreateUserMovieWatchActivity::class,
                ])
                ->then(function ($payload) {
                    return back()->with([
                        'success' => true,
                        'message' => "{$payload['title']} added to library",
                    ]);
                });
        });
    }
}
