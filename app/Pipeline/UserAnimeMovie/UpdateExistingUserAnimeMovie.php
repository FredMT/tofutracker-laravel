<?php

namespace App\Pipeline\UserAnimeMovie;

use App\Actions\Anime\Plays\CreateUserAnimePlayAction;
use App\Enums\WatchStatus;
use App\Models\UserAnime\UserAnime;
use App\Models\UserAnime\UserAnimeCollection;
use App\Models\UserAnime\UserAnimePlay;
use Closure;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Gate;

class UpdateExistingUserAnimeMovie
{
    protected CreateUserAnimePlayAction $createPlayAction;

    public function __construct(CreateUserAnimePlayAction $createPlayAction)
    {
        $this->createPlayAction = $createPlayAction;
    }

    public function handle(array $payload, Closure $next)
    {
        $collection = UserAnimeCollection::where('map_id', $payload['validated']['map_id'])
            ->whereHas('userLibrary', fn ($q) => $q->where('user_id', $payload['user']->id))
            ->first();

        if ($collection) {
            $userAnime = UserAnime::where('user_anime_collection_id', $collection->id)
                ->where('anidb_id', $payload['validated']['anidb_id'])
                ->first();

            if ($userAnime) {
                // Verify ownership
                if (Gate::denies('update-anime', $userAnime)) {
                    throw new AuthorizationException('You do not own this anime.');
                }

                // Update existing records
                $collection->update(['watch_status' => $payload['validated']['watch_status']]);
                $userAnime->update(['watch_status' => $payload['validated']['watch_status']]);

                // Create play record if status is COMPLETED
                if ($payload['validated']['watch_status'] === WatchStatus::COMPLETED->value) {
                    // Check if collection already has a play record
                    $collectionHasPlay = UserAnimePlay::where('playable_type', UserAnimeCollection::class)
                        ->where('playable_id', $collection->id)
                        ->exists();

                    if (! $collectionHasPlay) {
                        // If collection doesn't have a play record, create for both
                        $this->createPlayAction->executeMultiple([$collection, $userAnime]);
                    } else {
                        // If collection has a play record, only create for the movie
                        $this->createPlayAction->execute($userAnime);
                    }
                }

                $payload['collection'] = $collection;
                $payload['user_anime'] = $userAnime;
                $payload['updated'] = true;
            }
        }

        return $next($payload);
    }
}
