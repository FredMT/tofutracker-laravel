<?php

namespace App\Actions\UserController\Anime\AnimeSeason;

use App\Pipeline\UserAnime\EnsureUserAnimeLibrary;
use App\Pipeline\UserAnimeSeason\CreateUserAnimeSeason;
use App\Pipeline\UserAnimeSeason\CreateUserAnimeSeasonCollection;
use App\Pipeline\UserAnimeSeason\UpdateUserAnimeCollectionWatchStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Pipeline;

class StoreAnimeSeasonAction
{
    public function execute(array $validated, $user)
    {
        return DB::transaction(function () use ($validated, $user) {
            return Pipeline::send([
                'user' => $user,
                'validated' => $validated,
            ])
                ->through([
                    EnsureUserAnimeLibrary::class,
                    CreateUserAnimeSeasonCollection::class,
                    CreateUserAnimeSeason::class,
                    UpdateUserAnimeCollectionWatchStatus::class,
                ])
                ->then(function () {
                    return [
                        'success' => true,
                        'message' => 'Anime season added to your library',
                    ];
                });
        });
    }
}
