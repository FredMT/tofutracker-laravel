<?php

namespace App\Pipeline\UserAnimeMovie;

use App\Actions\Anime\Plays\CreateUserAnimePlayAction;
use App\Enums\WatchStatus;
use App\Models\UserAnime;
use App\Models\UserAnimeCollection;
use Closure;

class CreateNewUserAnimeMovie
{
    protected CreateUserAnimePlayAction $createPlayAction;

    public function __construct(CreateUserAnimePlayAction $createPlayAction)
    {
        $this->createPlayAction = $createPlayAction;
    }

    public function handle(array $payload, Closure $next)
    {
        if (!isset($payload['updated'])) {
            // Create new collection and anime entry
            $collection = UserAnimeCollection::create([
                'user_library_id' => $payload['library']->id,
                'map_id' => $payload['validated']['map_id'],
                'watch_status' => $payload['validated']['watch_status']
            ]);

            $userAnime = UserAnime::create([
                'user_anime_collection_id' => $collection->id,
                'anidb_id' => $payload['validated']['anidb_id'],
                'is_movie' => true,
                'watch_status' => $payload['validated']['watch_status']
            ]);

            if ($payload['validated']['watch_status'] === WatchStatus::COMPLETED->value) {
                $this->createPlayAction->executeMultiple([$collection, $userAnime]);
            }

            $payload['collection'] = $collection;
            $payload['user_anime'] = $userAnime;
        }

        return $next($payload);
    }
}
