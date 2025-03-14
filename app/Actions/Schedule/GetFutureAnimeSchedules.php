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

        return $this->transformScheduleData($schedules, $anidbToTmdbMap, $animeMaps, $tvShows, $movies, $anidbAnimes);
    }

    private function getAnimeSchedules(): EloquentCollection
    {
        return AnimeSchedule::query()
            ->with('animeMap')
            ->orderBy('episode_date')
            ->get();
    }

    private function getAnidbAnimes(EloquentCollection $schedules): EloquentCollection
    {
        $anidbIds = $schedules->pluck('anidb_id')->filter()->unique()->values()->toArray();

        return AnidbAnime::whereIn('id', $anidbIds)
            ->whereNotNull('map_id')
            ->get()
            ->keyBy('id');
    }

    private function getAnimeMaps(array $mapIds): EloquentCollection
    {
        return AnimeMap::whereIn('id', $mapIds)
            ->get()
            ->keyBy('id');
    }

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

    private function transformScheduleData(
        EloquentCollection $schedules,
        Collection $anidbToTmdbMap,
        EloquentCollection $animeMaps,
        EloquentCollection $tvShows,
        EloquentCollection $movies,
        EloquentCollection $anidbAnimes
    ): Collection {
        return $schedules->map(function (AnimeSchedule $schedule) use ($anidbToTmdbMap, $animeMaps, $tvShows, $movies, $anidbAnimes) {
            $anidbId = $schedule->anidb_id;

            $title = $schedule->title;
            $animeMapData = null;
            $mediaAssets = [
                'backdrop' => null,
                'logo' => null,
                'poster' => null
            ];

            if ($anidbId && $anidbToTmdbMap->has($anidbId)) {
                $mapping = $anidbToTmdbMap->get($anidbId);
                list($title, $animeMapData, $mediaAssets) = $this->processAnimeData(
                    $schedule,
                    $mapping,
                    $animeMaps,
                    $tvShows,
                    $movies,
                    $anidbAnimes->get($anidbId)
                );
            }

            return [
                'id' => $schedule->id,
                'title' => $title,
                'episode_date' => $schedule->episode_date,
                'episode_number' => $schedule->episode_number,
                'year' => $schedule->year,
                'week' => $schedule->week,
                'anidb_id' => $anidbId,
                'anime_map' => $animeMapData,
                'backdrop' => $mediaAssets['backdrop'],
                'logo' => $mediaAssets['logo'],
                'poster' => $mediaAssets['poster'],
                'link' => $animeMapData && isset($animeMapData['id']) ? '/anime/' . $animeMapData['id'] . '/season/' . $anidbId : null
            ];
        });
    }

    private function processAnimeData(
        AnimeSchedule $schedule,
        array $mapping,
        EloquentCollection $animeMaps,
        EloquentCollection $tvShows,
        EloquentCollection $movies,
        ?AnidbAnime $anidbAnime
    ): array {
        $title = $schedule->title;
        if ($anidbAnime && $anidbAnime->title_main) {
            $title = $anidbAnime->title_main;
        }

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

            $mapTitle = $animeMap->collection_name ?: $schedule->title;

            $tmdbModel = null;
            if ($tmdbType === 'tv' && $tvShows->has($tmdbId)) {
                $tmdbModel = $tvShows->get($tmdbId);
            } elseif ($tmdbType === 'movie' && $movies->has($tmdbId)) {
                $tmdbModel = $movies->get($tmdbId);
            }

            if ($tmdbModel) {
                if ($title === $schedule->title) {
                    $title = $tmdbModel->title;
                }

                if ($mapTitle === $schedule->title) {
                    $mapTitle = $tmdbModel->title;
                }

                $mediaAssets = [
                    'backdrop' => $tmdbModel->backdrop,
                    'logo' => $tmdbModel->highestVotedLogoPath,
                    'poster' => $tmdbModel->poster
                ];
            }

            $animeMapData = [
                'id' => $animeMap->id,
            ];
        }

        return [$title, $animeMapData, $mediaAssets];
    }
}
