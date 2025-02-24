<?php

namespace App\Actions\UserController\Anime\AnimeTv;

use App\Actions\Anime\Plays\DeleteUserAnimeCollectionPlayAction;
use App\Models\UserAnime\UserAnimeCollection;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class DestroyAnimeTvAction
{
    public function __construct(
        private readonly DeleteUserAnimeCollectionPlayAction $deleteAnimeCollectionPlay
    ) {}

    public function execute(array $validated, $user)
    {
        return DB::transaction(function () use ($validated, $user) {
            // Find the collection
            $collection = UserAnimeCollection::where('map_id', $validated['map_id'])
                ->whereHas('userLibrary', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->first();

            if (! $collection) {
                return [
                    'success' => false,
                    'message' => 'Anime collection not found in your library.',
                ];
            }

            if (Gate::denies('delete-anime-collection', $collection)) {
                throw new AuthorizationException('You do not own this anime.');
            }

            // Delete all plays and activities first
            $this->deleteAnimeCollectionPlay->execute($collection);

            // Then delete the collection
            $collection->delete();

            return [
                'success' => true,
                'message' => 'Anime removed from your library.',
            ];
        });
    }
}
