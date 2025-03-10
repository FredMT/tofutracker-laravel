<?php

namespace App\Actions\Schedule;

use App\Models\Anime\AnimeMap;
use App\Models\Anidb\AnidbAnime;
use App\Models\AnimeSchedule;
use App\Models\Movie;
use App\Models\TvShow;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

class GetFutureAnimeSchedules
{
    public function execute(): Collection
    {
        $schedules = $this->getAnimeSchedules();

        $anidbAnimes = $this->getAnidbAnimes($schedules);

        $mapIds = $anidbAnimes->pluck('map_id')->filter()->unique()->values()->toArray();
        $animeMaps = $this->getAnimeMaps($mapIds);

        $anidbToTmdbMap = $this->createAnidbToTmdbMap($anidbAnimes, $animeMaps);

        list($tvShows, $movies) = $this->getTmdbModels($anidbToTmdbMap);

        return $this->transformScheduleData($schedules, $anidbToTmdbMap, $animeMaps, $tvShows, $movies);
    }

     // Get anime schedules for the next 7 days
    private function getAnimeSchedules(): EloquentCollection
    {
        return AnimeSchedule::query()
            ->next7DaysEpisodes()
            ->with('animeMap')
            ->orderBy('episode_date')
            ->get();
    }

    // Get AnidbAnime models with map_ids based on schedule anidb_ids
    private function getAnidbAnimes(EloquentCollection $schedules): EloquentCollection
    {
        $anidbIds = $schedules->pluck('anidb_id')->filter()->unique()->values()->toArray();

        return AnidbAnime::whereIn('id', $anidbIds)
            ->whereNotNull('map_id')
            ->get()
            ->keyBy('id');
    }

     // Get AnimeMap models by IDs
    private function getAnimeMaps(array $mapIds): EloquentCollection
    {
        return AnimeMap::whereIn('id', $mapIds)
            ->get()
            ->keyBy('id');
    }

     // Create mapping from anidb_id to TMDB information
    private function createAnidbToTmdbMap(EloquentCollection $anidbAnimes, EloquentCollection $animeMaps): Collection
    {
        $anidbToTmdbMap = collect();

        foreach ($anidbAnimes as $anidbId => $anidbAnime) {
            $mapId = $anidbAnime->map_id;

            if ($mapId && $animeMaps->has($mapId)) {
                $animeMap = $animeMaps->get($mapId);
                $tmdbId = $animeMap->most_common_tmdb_id;
                $tmdbType = $animeMap->tmdb_type;

                if ($tmdbId) {
                    $anidbToTmdbMap->put($anidbId, [
                        'tmdb_id' => $tmdbId,
                        'tmdb_type' => $tmdbType,
                        'map_id' => $mapId
                    ]);
                }
            }
        }

        return $anidbToTmdbMap;
    }

     // Get TMDB models (TV shows and movies)
    private function getTmdbModels(Collection $anidbToTmdbMap): array
    {
        $tvShowIds = collect();
        $movieIds = collect();

        foreach ($anidbToTmdbMap as $mapping) {
            if ($mapping['tmdb_type'] === 'tv') {
                $tvShowIds->push($mapping['tmdb_id']);
            } elseif ($mapping['tmdb_type'] === 'movie') {
                $movieIds->push($mapping['tmdb_id']);
            }
        }

        $tvShows = TvShow::whereIn('id', $tvShowIds->unique()->values()->toArray())
            ->get()
            ->keyBy('id');

        $movies = Movie::whereIn('id', $movieIds->unique()->values()->toArray())
            ->get()
            ->keyBy('id');

        return [$tvShows, $movies];
    }

     // Transform schedule data with related models
    private function transformScheduleData(
        EloquentCollection $schedules,
        Collection $anidbToTmdbMap,
        EloquentCollection $animeMaps,
        EloquentCollection $tvShows,
        EloquentCollection $movies
    ): Collection {
        return $schedules->map(function (AnimeSchedule $schedule) use ($anidbToTmdbMap, $animeMaps, $tvShows, $movies) {
            $anidbId = $schedule->anidb_id;

            $title = $schedule->title;
            $animeMapData = null;
            $mediaAssets = [
                'backdrop' => null,
                'logo' => null,
                'poster' => null
            ];

            // Process if we have mapping data
            if ($anidbId && $anidbToTmdbMap->has($anidbId)) {
                $mapping = $anidbToTmdbMap->get($anidbId);
                list($title, $animeMapData, $mediaAssets) = $this->processAnimeData(
                    $schedule,
                    $mapping,
                    $animeMaps,
                    $tvShows,
                    $movies
                );
            }

            return [
                'id' => $schedule->id,
                'title' => $title,
                'episode_date' => $schedule->episode_date,
                'year' => $schedule->year,
                'week' => $schedule->week,
                'anidb_id' => $anidbId,
                'route' => $schedule->route,
                'anime_map' => $animeMapData,
                'backdrop' => $mediaAssets['backdrop'],
                'logo' => $mediaAssets['logo'],
                'poster' => $mediaAssets['poster']
            ];
        });
    }

     // Process anime data to extract title, map data and media assets
    private function processAnimeData(
        AnimeSchedule $schedule,
        array $mapping,
        EloquentCollection $animeMaps,
        EloquentCollection $tvShows,
        EloquentCollection $movies
    ): array {
        $title = $schedule->title;
        $tmdbId = $mapping['tmdb_id'];
        $tmdbType = $mapping['tmdb_type'];
        $mapId = $mapping['map_id'];

        $mediaAssets = [
            'backdrop' => null,
            'logo' => null,
            'poster' => null
        ];

        $animeMapData = null;

        if ($animeMaps->has($mapId)) {
            $animeMap = $animeMaps->get($mapId);

            if ($animeMap->collection_name && trim($animeMap->collection_name) !== '') {
                $title = $animeMap->collection_name;
            }

            $tmdbModel = null;
            if ($tmdbType === 'tv' && $tvShows->has($tmdbId)) {
                $tmdbModel = $tvShows->get($tmdbId);
            } elseif ($tmdbType === 'movie' && $movies->has($tmdbId)) {
                $tmdbModel = $movies->get($tmdbId);
            }

            if ($tmdbModel) {
                $mediaAssets = [
                    'backdrop' => $tmdbModel->backdrop,
                    'logo' => $tmdbModel->highestVotedLogoPath,
                    'poster' => $tmdbModel->poster
                ];
            }

            $animeMapData = [
                'id' => $animeMap->id,
                'title' => $title,
                'tmdb_id' => $tmdbId,
                'tmdb_type' => $tmdbType,
                'poster' => $mediaAssets['poster'],
                'backdrop' => $mediaAssets['backdrop'],
                'logo' => $mediaAssets['logo']
            ];
        }

        return [$title, $animeMapData, $mediaAssets];
    }
}
