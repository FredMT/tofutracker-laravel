<?php

namespace App\Actions\Anime;

use App\Models\AnimeMap;
use App\Models\AnidbAnime;
use Illuminate\Support\Arr;

class GetAnimeTypeAction
{
    public function execute(int $accessId): string
    {
        $animeMap = AnimeMap::where('access_id', $accessId)->firstOrFail();

        $allIds = array_merge(
            $animeMap->data['other_related_ids'],
            Arr::flatten($animeMap->data['prequel_sequel_chains'])
        );

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
