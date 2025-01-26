<?php

namespace App\Pipeline\UserAnime;

use App\Models\UserAnime\UserAnime;
use App\Models\UserAnime\UserAnimeCollection;
use Closure;
use Illuminate\Support\Facades\Gate;

class UpdateUserAnimeMovieWithWatchStatus
{
    public function handle(array $payload, Closure $next)
    {
        // Find existing collection and anime
        $collection = UserAnimeCollection::where('map_id', $payload['validated']['map_id'])
            ->whereHas('userLibrary', function ($query) use ($payload) {
                $query->where('user_id', $payload['user']->id);
            })
            ->first();

        if (! $collection) {
            return $next($payload);
        }

        $userAnime = UserAnime::where('user_anime_collection_id', $collection->id)
            ->where('anidb_id', $payload['validated']['anidb_id'])
            ->first();

        if (! $userAnime) {
            return $next($payload);
        }

        // Authorize the update
        if (Gate::denies('update-anime', $userAnime)) {
            throw new \Illuminate\Auth\Access\AuthorizationException('You do not own this anime.');
        }

        // Update watch status
        $collection->update(['watch_status' => $payload['validated']['watch_status']]);
        $userAnime->update(['watch_status' => $payload['validated']['watch_status']]);

        $payload['collection'] = $collection;
        $payload['user_anime'] = $userAnime;
        $payload['updated'] = true;

        return $next($payload);
    }
}
