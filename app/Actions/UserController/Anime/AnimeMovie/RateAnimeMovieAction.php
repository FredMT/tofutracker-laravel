<?php

namespace App\Actions\UserController\Anime\AnimeMovie;

use App\Models\Anidb\AnidbAnime;
use App\Models\UserAnime\UserAnime;
use App\Pipeline\UserAnime\CreateUserAnimeCollection;
use App\Pipeline\UserAnime\CreateUserAnimeMovie;
use App\Pipeline\UserAnime\CreateUserAnimeMoviePlay;
use App\Pipeline\UserAnime\EnsureUserAnimeLibrary;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Pipeline;

class RateAnimeMovieAction
{
    public function execute(array $validated, $user)
    {
        return DB::transaction(function () use ($validated, $user) {
            $anime = AnidbAnime::findOrFail($validated['anidb_id']);
            $mapId = $anime->map();

            if ($mapId !== (int) $validated['map_id']) {
                return [
                    'success' => false,
                    'message' => 'Invalid map ID for this anime.',
                ];
            }

            // Find existing anime entry
            $userAnime = UserAnime::whereHas('collection', function ($query) use ($validated, $user) {
                $query->where('map_id', $validated['map_id'])
                    ->whereHas('userLibrary', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    });
            })
                ->where('anidb_id', $validated['anidb_id'])
                ->first();

            // If no existing entry, create new one with rating
            if (!$userAnime) {
                // Authorize creating new entry with rating
                if (Gate::denies('rate-anime', null)) {
                    throw new AuthorizationException('You are not authorized to rate this anime.');
                }

                return Pipeline::send([
                    'user' => $user,
                    'validated' => $validated,
                ])
                    ->through([
                        EnsureUserAnimeLibrary::class,
                        CreateUserAnimeCollection::class,
                        CreateUserAnimeMovie::class,
                        CreateUserAnimeMoviePlay::class,
                    ])
                    ->then(function () {
                        return [
                            'success' => true,
                            'message' => 'Anime movie added to your library with rating',
                        ];
                    });
            }

            // Authorize updating existing entry
            if (Gate::denies('rate-anime', $userAnime)) {
                throw new AuthorizationException('You do not own this anime.');
            }

            $userAnime->update(['rating' => $validated['rating']]);

            return [
                'success' => true,
                'message' => 'Anime rating updated.',
            ];
        });
    }
}
