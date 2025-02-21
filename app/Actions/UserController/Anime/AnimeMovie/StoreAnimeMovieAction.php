<?php

namespace App\Actions\UserController\Anime\AnimeMovie;

use App\Models\Anidb\AnidbAnime;
use App\Pipeline\UserAnime\CreateUserAnimeCollection;
use App\Pipeline\UserAnime\CreateUserAnimeMovie;
use App\Pipeline\UserAnime\CreateUserAnimeMoviePlay;
use App\Pipeline\UserAnime\EnsureUserAnimeLibrary;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Pipeline;

class StoreAnimeMovieAction
{
    public function execute(array $validated, $user)
    {
        return DB::transaction(function () use ($validated, $user) {
            $anime = AnidbAnime::findOrFail($validated['anidb_id']);
            $mapId = $anime->map();

            if ($mapId !== $validated['map_id']) {
                return [
                    'success' => false,
                    'message' => 'Invalid map ID for this anime.',
                ];
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
                        'message' => 'Anime movie added to your library',
                    ];
                });
        });
    }
}
