<?php

namespace App\Actions\UserController\Anime\AnimeMovie;

use App\Pipeline\UserAnimeMovie\CreateNewUserAnimeMovie;
use App\Pipeline\UserAnimeMovie\EnsureUserAnimeMovieLibrary;
use App\Pipeline\UserAnimeMovie\UpdateExistingUserAnimeMovie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Pipeline;

class UpdateWatchStatusAnimeMovieAction
{
    public function execute(array $validated, $user)
    {
        return DB::transaction(function () use ($validated, $user) {
            return Pipeline::send([
                'user' => $user,
                'validated' => $validated,
            ])
                ->through([
                    EnsureUserAnimeMovieLibrary::class,
                    UpdateExistingUserAnimeMovie::class,
                    CreateNewUserAnimeMovie::class,
                ])
                ->then(function () {
                    return [
                        'success' => true,
                        'message' => 'Anime watch status updated successfully',
                    ];
                });
        });
    }
}
