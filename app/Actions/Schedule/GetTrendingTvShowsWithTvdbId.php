<?php

namespace App\Actions\Schedule;

use App\Services\TmdbService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class GetTrendingTvShowsWithTvdbId
{
    protected TmdbService $tmdbService;

    public function __construct(TmdbService $tmdbService)
    {
        $this->tmdbService = $tmdbService;
    }

    public function execute(): Collection
    {
        // Get top 500 trending TV shows from TMDB
        $trendingShows = $this->tmdbService->getFirst500TrendingTvShowsSortedByPopularity();

        $tmdbIds = collect($trendingShows)->pluck('id')->toArray();

        // Use a single query to get TV shows with TVDB IDs that:
        // 1. Are in trending TMDB IDs list
        // 2. Are not in AnimeMap's most_common_tmdb_id
        // 3. Have a corresponding entry in TvMazeSchedule
        $results = DB::table('tv_shows')
            ->select([
                'tv_shows.id as tmdb_id',
                'tv_shows.tvdb_id',
                'tv_maze_schedules.*',
            ])
            ->whereIn('tv_shows.id', $tmdbIds)
            ->whereNotNull('tv_shows.tvdb_id')
            ->whereNotExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('anime_maps')
                    ->whereRaw('anime_maps.most_common_tmdb_id = tv_shows.id')
                    ->whereNotNull('anime_maps.most_common_tmdb_id');
            })
            ->join('tv_maze_schedules', 'tv_shows.tvdb_id', '=', 'tv_maze_schedules.thetvdb_id')
            ->whereNotNull('tv_maze_schedules.thetvdb_id')
            ->get();

        $transformedResults = $results->map(function ($item) {
            $scheduleData = (array) $item;

            unset($scheduleData['tmdb_id']);
            unset($scheduleData['tvdb_id']);

            return [
                'tmdb_id' => $item->tmdb_id,
                'tvdb_id' => $item->tvdb_id,
                'schedule_data' => $scheduleData,
            ];
        });

        $orderedShows = collect($tmdbIds)
            ->map(function ($tmdbId) use ($transformedResults) {
                return $transformedResults->firstWhere('tmdb_id', $tmdbId);
            })
            ->filter()
            ->values();

        return $orderedShows;
    }
}
