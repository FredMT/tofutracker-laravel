<?php

namespace App\Repositories\Anime;

use App\Models\Anime\AnimeMap;
use App\Models\UserAnime\UserAnimeCollection;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class AnimeControllerRepository
{
    public function getAnimeMap(int $accessId): AnimeMap
    {
        return AnimeMap::where('id', $accessId)->firstOrFail();
    }

    public function getUserAnimeCollection(int $accessId): ?UserAnimeCollection
    {
        return UserAnimeCollection::where('map_id', $accessId)
            ->whereHas('userLibrary', function ($query) {
                $query->where('user_id', Auth::id());
            })
            ->with(['anime' => function ($query) {
                $query->select([
                    'id',
                    'user_anime_collection_id',
                    'anidb_id',
                    'is_movie',
                    'rating',
                    'watch_status',
                ]);
            }])
            ->first();
    }

    public function getUserLists(int $accessId): ?Collection
    {
        $lists = Auth::user()
            ->customLists()
            ->select('id', 'title')
            ->orderBy('title', 'ASC')
            ->withExists(['items as has_item' => function ($query) use ($accessId) {
                $query->where('listable_type', AnimeMap::class)
                    ->where('listable_id', $accessId);
            }])
            ->get();

        return $lists->isEmpty() ? null : $lists;
    }

    public function getFirstChainEntry(array $prequelSequelChains): ?array
    {
        if (empty($prequelSequelChains)) {
            return null;
        }

        $firstChain = array_values($prequelSequelChains)[0] ?? [];

        return $firstChain[0] ?? null;
    }
}
