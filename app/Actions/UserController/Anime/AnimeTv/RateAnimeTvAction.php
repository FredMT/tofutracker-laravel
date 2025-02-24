<?php

namespace App\Actions\UserController\Anime\AnimeTv;

use App\Enums\MediaType;
use App\Enums\WatchStatus;
use App\Models\UserAnime\UserAnimeCollection;
use App\Models\UserLibrary;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class RateAnimeTvAction
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

            // If no collection exists, create new one with rating
            if (! $collection) {
                if (Gate::denies('rate-anime-collection', null)) {
                    throw new AuthorizationException('You are not authorized to rate this anime.');
                }

                $library = UserLibrary::firstOrCreate([
                    'user_id' => $user->id,
                    'type' => MediaType::ANIME,
                ]);

                UserAnimeCollection::create([
                    'user_library_id' => $library->id,
                    'map_id' => $validated['map_id'],
                    'rating' => $validated['rating'],
                    'watch_status' => WatchStatus::WATCHING,
                ]);

                return [
                    'success' => true,
                    'message' => 'Anime TV show added to your library with rating',
                ];
            }

            // Authorize updating existing collection
            if (Gate::denies('rate-anime-collection', $collection)) {
                throw new AuthorizationException('You do not own this anime.');
            }

            $collection->update(['rating' => $validated['rating']]);

            return [
                'success' => true,
                'message' => 'Anime rating updated.',
            ];
        });
    }
}
