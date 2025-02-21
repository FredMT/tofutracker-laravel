<?php

namespace App\Actions\UserController\Anime\AnimeMovie;

use App\Actions\Activity\ManageAnimePlayActivityAction;
use App\Models\Anidb\AnidbAnime;
use App\Models\UserAnime\UserAnime;
use App\Models\UserAnime\UserAnimePlay;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class DeleteAnimeMovieAction
{
    protected ManageAnimePlayActivityAction $manageActivity;

    public function __construct(ManageAnimePlayActivityAction $manageActivity)
    {
        $this->manageActivity = $manageActivity;
    }

    public function execute(array $validated, $user)
    {
        return DB::transaction(function () use ($validated, $user) {
            // Verify map_id is related to anidb_id
            $anime = AnidbAnime::findOrFail($validated['anidb_id']);
            $mapId = $anime->map();

            if ($mapId !== $validated['map_id']) {
                return [
                    'success' => false,
                    'message' => 'Invalid map ID for this anime.',
                ];
            }

            // Find the user's anime entry, scoped to the authenticated user
            $userAnime = UserAnime::whereHas('collection', function ($query) use ($validated, $user) {
                $query->where('map_id', $validated['map_id'])
                    ->whereHas('userLibrary', function ($query) use ($user) {
                        $query->where('user_id', $user->id);
                    });
            })
                ->where('anidb_id', $validated['anidb_id'])
                ->first();

            if (!$userAnime) {
                return [
                    'success' => false,
                    'message' => 'Anime not found in your library.',
                ];
            }

            if (Gate::denies('delete-anime', $userAnime)) {
                throw new AuthorizationException('You do not own this anime.');
            }

            $collection = $userAnime->collection;

            // Delete play records
            UserAnimePlay::query()
                ->where('playable_type', UserAnime::class)
                ->where('playable_id', $userAnime->id)
                ->delete();

            // Delete activity
            $this->manageActivity->deleteActivity($userAnime);

            $collection->delete();

            return [
                'success' => true,
                'message' => 'Anime removed from your library.',
            ];
        });
    }
}
