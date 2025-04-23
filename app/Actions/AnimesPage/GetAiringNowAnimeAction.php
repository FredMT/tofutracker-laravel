<?php

namespace App\Actions\AnimesPage;

use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeMap;
use App\Models\AnimeSchedule;
use App\Models\AnimeScheduleMap;

class GetAiringNowAnimeAction
{
    public function execute(): array
    {
        $schedules = AnimeSchedule::all();

        $animescheduleIds = $schedules->pluck('animeschedule_id')->toArray();

        // Get mapped AniDB IDs from the schedule maps
        $scheduleMaps = AnimeScheduleMap::whereIn('animeschedule_id', $animescheduleIds)
            ->get(['animeschedule_id', 'anidb_id']);

        $anidbIds = $scheduleMaps->pluck('anidb_id')->toArray();

        // Get anime maps through AniDB anime
        $anidbAnimes = AnidbAnime::whereIn('id', $anidbIds)
            ->whereNotNull('map_id')
            ->get(['id', 'map_id']);

        $mapIds = $anidbAnimes->pluck('map_id')->toArray();

        // Get AnimeMap data with TMDB relationships
        $animeMaps = AnimeMap::whereIn('id', $mapIds)
            ->whereNotNull('most_common_tmdb_id')
            ->where('tmdb_type', 'tv')
            ->get();

        // Prepare the result array
        $result = [];
        foreach ($animeMaps as $animeMap) {
            $tmdbModel = $animeMap->getTmdbModel();

            if (! $tmdbModel) {
                continue;
            }

            $result[] = [
                'id' => $animeMap->id,
                'title' => $animeMap->title,
                'poster' => $tmdbModel->poster,
                'year' => $tmdbModel->yearRange,
                'rating' => number_format($tmdbModel->vote_average, 1, '.', ''),
            ];
        }

        $result = collect($result)
            ->sortByDesc('rating')
            ->take(20)
            ->values()
            ->toArray();

        return $result;
    }
}
