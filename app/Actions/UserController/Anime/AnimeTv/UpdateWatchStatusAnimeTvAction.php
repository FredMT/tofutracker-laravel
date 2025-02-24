<?php

namespace App\Actions\UserController\Anime\AnimeTv;

use App\Enums\MediaType;
use App\Models\UserAnime\UserAnimeCollection;
use App\Models\UserLibrary;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class UpdateWatchStatusAnimeTvAction
{
    public function execute(array $validated, $user)
    {
        return DB::transaction(function () use ($validated, $user) {
            // Find existing collection
            $collection = UserAnimeCollection::where('map_id', $validated['map_id'])
                ->whereHas('userLibrary', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->first();

            // If no collection exists, create new one with watch status
            if (! $collection) {
                if (Gate::denies('update-anime-collection-status', null)) {
                    throw new AuthorizationException('You are not authorized to create this anime collection.');
                }

                $library = UserLibrary::firstOrCreate([
                    'user_id' => $user->id,
                    'type' => MediaType::ANIME,
                ]);

                UserAnimeCollection::create([
                    'user_library_id' => $library->id,
                    'map_id' => $validated['map_id'],
                    'watch_status' => $validated['watch_status'],
                ]);

                return [
                    'success' => true,
                    'message' => 'Anime TV show added to your library with watch status',
                ];
            }

            if (Gate::denies('update-anime-collection-status', $collection)) {
                throw new AuthorizationException('You do not own this anime.');
            }

            $collection->update(['watch_status' => $validated['watch_status']]);

            return [
                'success' => true,
                'message' => 'Anime watch status updated.',
            ];
        });
    }
}
