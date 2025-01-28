<?php

namespace App\Actions\Anime;

use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeMap;
use Illuminate\Support\Collection;

class GetAnimeTypeAction
{
    public function execute(int $accessId): string
    {
        $animeMap = AnimeMap::where('id', $accessId)->firstOrFail();

        // Get all anime IDs from chain entries and related entries
        $allIds = Collection::make()
            ->merge($animeMap->relatedEntries()->pluck('anime_id'))
            ->merge($animeMap->chainEntries()->pluck('anime_id'))
            ->unique()
            ->values()
            ->all();

        // If there's only one ID
        if (count($allIds) === 1) {
            $anime = AnidbAnime::find($allIds[0]);

            if ($anime && $anime->type === 'Movie') {
                return 'animemovie';
            }
        }

        return 'animetv';
    }
}
