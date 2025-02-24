<?php

namespace App\Actions\UserController\Anime\AnimeSeason;

use App\Models\UserAnime\UserAnime;
use App\Pipeline\Shared\MediaLibraryPipeline;
use App\Pipeline\UserAnimeSeason\CreateUserAnimeSeason;
use App\Pipeline\UserAnimeSeason\CreateUserAnimeSeasonCollection;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Pipeline;

class RateAnimeSeasonAction
{
    public function execute(array $validated, $user)
    {
        return DB::transaction(function () use ($validated, $user) {
            // Find existing season
            $season = UserAnime::where('anidb_id', $validated['anidb_id'])
                ->whereHas('collection.userLibrary', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->first();

            // If no season exists, create new one with rating
            if (! $season) {
                if (Gate::denies('rate-anime', null)) {
                    throw new AuthorizationException('You are not authorized to rate this anime season.');
                }

                return Pipeline::send([
                    'user' => $user,
                    'validated' => $validated,
                ])
                    ->through([
                        MediaLibraryPipeline::anime(),
                        CreateUserAnimeSeasonCollection::class,
                        CreateUserAnimeSeason::class,
                    ])
                    ->then(function () {
                        return [
                            'success' => true,
                            'message' => 'Anime season added to your library with rating',
                        ];
                    });
            }

            // Authorize updating existing season
            if (Gate::denies('rate-anime', $season)) {
                throw new AuthorizationException('You do not own this anime season.');
            }

            $season->update(['rating' => $validated['rating']]);

            return [
                'success' => true,
                'message' => 'Anime season rating updated.',
            ];
        });
    }
}
