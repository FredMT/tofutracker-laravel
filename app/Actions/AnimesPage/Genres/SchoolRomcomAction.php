<?php

namespace App\Actions\AnimesPage\Genres;

use App\Models\Anime\AnimeMap;
use Illuminate\Support\Facades\DB;

class SchoolRomcomAction
{
    public function execute()
    {
        $animeIds = DB::select('
            SELECT
                a.map_id
            FROM anidb_anime a
                JOIN anidb_anime_tags at1 ON a.id = at1.anidb_id AND at1.tag_id = 2043 AND at1.weight > 0
                JOIN anidb_anime_tags at2 ON a.id = at2.anidb_id AND at2.tag_id = 2869 AND at2.weight > 0
                JOIN anidb_anime_tags at4 ON a.id = at4.anidb_id AND at4.tag_id = 2858 AND at4.weight > 200
                JOIN anidb_anime_tags at5 ON a.id = at5.anidb_id AND at5.tag_id = 2853 AND at5.weight > 0
                LEFT JOIN anidb_anime_tags at_exclude1 ON a.id = at_exclude1.anidb_id AND at_exclude1.tag_id = 2750
                LEFT JOIN anidb_anime_tags at_exclude2 ON a.id = at_exclude2.anidb_id AND at_exclude2.tag_id = 2856
            WHERE
                a.map_id IS NOT NULL
                AND a.rating_count >= 500
                AND a.startdate >= CURRENT_DATE - INTERVAL \'20 years\'
                AND (at_exclude1.weight IS NULL OR at_exclude1.weight <= 200)
                AND (at_exclude2.weight IS NULL OR at_exclude2.weight <= 200)
            ORDER BY
                ((5000 * 7.0) + (a.rating_count * a.rating)) / (5000 + a.rating_count) DESC,
                COALESCE(a.startdate, \'1900-01-01\') DESC,
                a.rating_count DESC,
                (at1.weight + at2.weight * 2 + at4.weight * 2 + at5.weight * 2) DESC
        ');

        $mapIds = collect($animeIds)->pluck('map_id');

        $animeMaps = AnimeMap::whereIn('id', $mapIds)
            ->get()
            ->each(function ($animeMap) {
                $animeMap->append(['poster', 'title', 'yearRange', 'rating']);
            });

        $results = $animeMaps->map(function ($animeMap) {
            return [
                'map_id' => $animeMap->id,
                'poster' => $animeMap->poster,
                'title' => $animeMap->title,
                'yearRange' => $animeMap->yearRange,
                'rating' => number_format((float) $animeMap->rating, 1, '.', ''),
            ];
        });

        return $results->sortBy(function ($item) use ($mapIds) {
            return array_search($item['map_id'], $mapIds->toArray());
        })->values();
    }
}
