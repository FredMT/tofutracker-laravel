<?php

namespace App\Actions\AnimesPage\Genres;

use App\Models\Anidb\AnidbAnime;
use App\Models\Anidb\AnidbAnimeTag;
use App\Models\Anime\AnimeMap;

class MechaAction
{
    public function execute()
    {
        $animeIds = AnidbAnimeTag::where('tag_id', 2638)->where('weight', '>=', '600')->pluck('anidb_id');

        $animeIds = AnidbAnime::whereIn('id', $animeIds)->orderBy('rating', 'desc')->limit(100)->pluck('id');

        $animeMapIds = AnidbAnime::whereIn('id', $animeIds)->distinct()->pluck('map_id');

        $animeMaps = AnimeMap::whereIn('id', $animeMapIds)
            ->get()
            ->each(function ($animeMap) {
                $animeMap->append(['poster', 'title', 'yearRange', 'rating']);
            });

        $sortedAnimeMaps = $animeMaps->sortByDesc(function ($animeMap) {
            return (float) $animeMap->rating;
        });

        return $sortedAnimeMaps->map(function ($animeMap) {
            return [
                'map_id' => $animeMap->id,
                'poster' => $animeMap->poster,
                'title' => $animeMap->title,
                'yearRange' => $animeMap->yearRange,
                'rating' => number_format((float) $animeMap->rating, 1, '.', ''),
            ];
        })->values();
    }
}
