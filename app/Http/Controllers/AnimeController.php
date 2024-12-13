<?php

namespace App\Http\Controllers;

use App\Models\AnidbAnime;
use App\Models\AnimeMap;
use App\Models\AnimeMappingExternalId;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;

class AnimeController extends Controller
{

    public function getMostCommonTmdbId($accessId)
    {
        return Cache::remember(
            'most_common_tmdb_id_' . $accessId,
            now()->addMonth(),
            function () use ($accessId) {
                // Try to fetch the AnimeMap record with the most_common_tmdb_id
                $animeMap = AnimeMap::where('access_id', $accessId)->first();

                if ($animeMap && $animeMap->most_common_tmdb_id) {
                    return response()->json(['most_common_tmdb_id' => $animeMap->most_common_tmdb_id, 'tmdb_type' => $animeMap->tmdb_type]);
                }

                // If not found, calculate and update the most_common_tmdb_id
                $allIds = array_merge(
                    $animeMap->data['other_related_ids'],
                    Arr::flatten($animeMap->data['prequel_sequel_chains'])
                );

                $types = AnidbAnime::whereIn('id', $allIds)->pluck('type')->toArray();
                $isMovie = collect($types)->every(fn($type) => $type === 'Movie');
                $type = $isMovie ? 'movie' : 'tv';

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
                $animeMap->tmdb_type = $type;
                $animeMap->save();

                return response()->json(['most_common_tmdb_id' => $mostCommonTmdbId, 'tmdb_type' => $type]);
            }
        );
    }
}
