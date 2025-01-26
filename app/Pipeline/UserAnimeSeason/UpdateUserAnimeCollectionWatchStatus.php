<?php

namespace App\Pipeline\UserAnimeSeason;

use App\Enums\WatchStatus;
use App\Models\Anime\AnimeMap;
use App\Models\UserAnime\UserAnime;
use Closure;

class UpdateUserAnimeCollectionWatchStatus
{
    public function handle($payload, Closure $next)
    {
        $collection = $payload['collection'];

        if ($collection->watch_status === WatchStatus::COMPLETED->value) {
            return $next($payload);
        }

        // Get all anime IDs in the chain
        $animeMap = AnimeMap::with(['chains.entries.anime'])->find($collection->map_id);
        $chainAnimeIds = collect();

        foreach ($animeMap->chains as $chain) {
            $chainAnimeIds = $chainAnimeIds->concat(
                $chain->entries->pluck('anime_id')
            );
        }

        // If no chain entries found, return
        if ($chainAnimeIds->isEmpty()) {
            return $next($payload);
        }

        // Check if all seasons in the chain are completed
        $completedCount = UserAnime::whereIn('anidb_id', $chainAnimeIds)
            ->whereHas('collection.userLibrary', function ($query) use ($collection) {
                $query->where('user_id', $collection->userLibrary->user_id);
            })
            ->where('watch_status', WatchStatus::COMPLETED->value)
            ->count();

        // Only update if all seasons are completed
        if ($completedCount === $chainAnimeIds->count()) {
            $collection->update(['watch_status' => WatchStatus::COMPLETED->value]);
        }

        return $next($payload);
    }
}
