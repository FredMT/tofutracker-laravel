<?php

namespace App\Actions\UserController\Anime\AnimeSeason;

use App\Actions\Anime\Plays\DeleteUserAnimePlayAction;
use App\Models\UserAnime\UserAnime;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class DestroyAnimeSeasonAction
{
    public function __construct(
        private readonly DeleteUserAnimePlayAction $deletePlayAction
    ) {}

    public function execute(array $validated, $user)
    {
        return DB::transaction(function () use ($validated, $user) {
            // Find the season
            $season = UserAnime::where('anidb_id', $validated['anidb_id'])
                ->whereHas('collection.userLibrary', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->first();

            if (!$season) {
                return [
                    'success' => false,
                    'message' => 'Anime season not found in your library.',
                ];
            }

            if (Gate::denies('delete-anime-season', $season)) {
                throw new AuthorizationException('You do not own this season.');
            }

            // Get the collection
            $collection = $season->collection;

            // Delete all play records
            $this->deletePlayAction->executeForSeason($season, $collection);

            // Delete the season
            $season->delete();

            return [
                'success' => true,
                'message' => 'Anime season removed from your library.',
            ];
        });
    }
}
