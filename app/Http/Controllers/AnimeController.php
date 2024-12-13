<?php

namespace App\Http\Controllers;

use App\Models\AnimeMap;
use App\Models\AnimeMappingExternalId;
use Illuminate\Support\Arr;

class AnimeController extends Controller
{

    public function getMostCommonTmdbId($accessId)
    {
        // Try to fetch the AnimeMap record with the most_common_tmdb_id
        $animeMap = AnimeMap::where('access_id', $accessId)->first();

        if ($animeMap && $animeMap->most_common_tmdb_id) {
            return response()->json(['most_common_tmdb_id' => $animeMap->most_common_tmdb_id]);
        }

        // If not found, calculate and update the most_common_tmdb_id
        $allIds = array_merge(
            $animeMap->data['other_related_ids'],
            Arr::flatten($animeMap->data['prequel_sequel_chains'])
        );

        $tmdbIds = AnimeMappingExternalId::whereIn('anidb_id', $allIds)
            ->pluck('themoviedb_id')
            ->filter(function ($id) {
                return is_int($id);
            })
            ->toArray();

        $counts = array_count_values($tmdbIds);

        $mostCommonTmdbId = array_reduce(array_keys($counts), function ($a, $b) use ($counts) {
            if (isset($counts[$a]) && isset($counts[$b])) {
                return $counts[$a] >= $counts[$b] ? $a : $b;
            } elseif (isset($counts[$a])) {
                return $a;
            } else {
                return $b;
            }
        });

        $animeMap->most_common_tmdb_id = $mostCommonTmdbId;
        $animeMap->save();

        return response()->json(['most_common_tmdb_id' => $mostCommonTmdbId]);
    }
}
