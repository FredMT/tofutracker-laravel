<?php

namespace App\Actions\AnimesPage;

use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeMap;
use App\Models\Anime\AnimeMappingExternalId;
use App\Services\AnidbService;
use App\Services\TmdbService;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class GetTrendingAnimesAction
{
    private TmdbService $tmdbService;
    private AnidbService $anidbService;
    public function __construct(TmdbService $tmdbService, AnidbService $anidbService)
    {
        $this->tmdbService = $tmdbService;
        $this->anidbService = $anidbService;
    }

    public function execute(): array
    {
        $maxResults = 500;
        $tvResults = $this->fetchTrendingTv($maxResults);

        $tmdbIdsOrdered = $tvResults->pluck('id')->toArray();
        $ignoredIds = config('trending.ignored_ids', []);

        // Query all AnimeMappingExternalId for these tmdb ids
        $mappings = AnimeMappingExternalId::whereIn('themoviedb_id', $tmdbIdsOrdered)
            ->whereNotIn('themoviedb_id', $ignoredIds)
            ->whereNotNull('anidb_id')
            ->get(['themoviedb_id', 'anidb_id'])
            ->keyBy('themoviedb_id');

        // Build the ordered list of anidb_ids and tmdb info
        $anidbIdToTmdb = [];
        foreach ($tvResults as $item) {
            $tmdbId = $item['id'];
            if (isset($mappings[$tmdbId])) {
                $anidbIdToTmdb[$mappings[$tmdbId]->anidb_id] = $item;
            }
        }
        $anidbIds = array_keys($anidbIdToTmdb);
        $anidbIds = array_unique($anidbIds);

        // Get map_ids for these anidb_ids
        $anidbAnimes = AnidbAnime::whereIn('id', $anidbIds)->get(['id', 'map_id']);
        $anidbIdToMapId = $anidbAnimes->pluck('map_id', 'id');

        // Get AnimeMap models
        $animeMaps = AnimeMap::whereIn('id', $anidbIdToMapId->values())->get()->keyBy('id');

        // Genre mapping
        $genreMap = config('genres');

        $result = [];
        $processedMapIds = []; // Track already processed map IDs to avoid duplicates

        foreach ($anidbIds as $anidbId) {
            if (!isset($anidbIdToMapId[$anidbId])) continue;
            
            $mapId = $anidbIdToMapId[$anidbId];
            
            // Skip if we've already processed this map_id
            if (in_array($mapId, $processedMapIds)) continue;
            
            $animeMap = $animeMaps[$mapId] ?? null;
            $tmdb = $anidbIdToTmdb[$anidbId];
            if (!$animeMap || !$tmdb) continue;

            $isTv = $tmdb['media_type'] === 'tv';

            $title = $isTv ? ($tmdb['name'] ?? null) : ($tmdb['title'] ?? null);
            $backdrop = $tmdb['backdrop_path'] ?? null;
            $poster = $tmdb['poster_path'] ?? null;
            $overview = $tmdb['overview'] ?? null;
            $rating = isset($tmdb['vote_average']) ? number_format($tmdb['vote_average'], 1, '.', '') : null;
            $genreIds = $tmdb['genre_ids'] ?? [];
            $genres = collect($genreIds)->map(function ($id) use ($genreMap) {
                return isset($genreMap[$id]) ? ['id' => $id, 'name' => $genreMap[$id]] : null;
            })->filter()->values()->all();
            $firstAirDate = $tmdb['first_air_date'] ?? null;
            $lastAirDate = $tmdb['last_air_date'] ?? null;
            $releaseDate = $tmdb['release_date'] ?? null;
            $year = $this->calculateYearString($firstAirDate, $lastAirDate, $releaseDate);
            $logo = $animeMap->getTmdbModel()->highestVotedLogoPath ?? null;


            if (
                !$mapId || !$title || !$logo || !$backdrop || !$poster || !$overview || !$year || empty($genres) || $logo === '' || $backdrop === '' || $poster === '' || $overview === '' || $year === '' || $firstAirDate < Carbon::now()->subyears(2)->year
            ) {
                continue;
            }

            $result[] = [
                'id' => $mapId,
                'title' => $title,
                'logo' => $logo,
                'backdrop' => $backdrop,
                'poster' => $poster,
                'overview' => $overview,
                'year' => $year,
                'genres' => $genres,
                'rating' => $rating,
            ];
            
            // Track this map_id as processed
            $processedMapIds[] = $mapId;

            if (count($result) >= 20) break;
        }

        // Get hot anime from anidb
        $hotAnime = $this->anidbService->getHotAnime();

        /* 
"hotAnime": [
18935,
18794,
18528,
18931,
18939,
18816,
17110,
17420,
18130,
18793
]
        */

        $hotAnime = AnidbAnime::whereIn('id', $hotAnime)->get();
        $hotAnime = $hotAnime->map(function ($anime) {
            return [
                'id' => $anime->id,
                'title' => $anime->title,
                'logo' => $anime->logo,
            ];
        });

        $result = collect($result)->sortByDesc('rating')->values()->take(20)->all();

        return [
            'success' => true,
            'message' => 'Trending anime fetched successfully',
            'anime' => $result,
            'hotAnime' => $hotAnime,
        ];
    }

    private function fetchTrendingTv(int $maxResults): Collection
    {
        $results = collect();
        $page = 1;

        while ($results->count() < $maxResults) {
            $trending = $this->tmdbService->getTrendingTvPaginated($page);
            $batch = collect($trending['results'] ?? []);
            if ($batch->isEmpty()) {
                break;
            }
            $results = $results->concat($batch);
            if ($results->count() >= $maxResults || ($trending['total_pages'] ?? 1) <= $page) {
                break;
            }
            $page++;
        }

        return $results->take($maxResults);
    }

    private function calculateYearString(?string $firstAirDate, ?string $lastAirDate, ?string $releaseDate): ?string
    {
        $firstYear = null;
        $lastYear = null;
        try {
            if (!empty($firstAirDate)) {
                $firstYear = Carbon::parse($firstAirDate)->year;
            }
            if (!empty($lastAirDate)) {
                $lastYear = Carbon::parse($lastAirDate)->year;
            }
            if ($firstYear && $lastYear) {
                return ($firstYear === $lastYear) ? (string) $firstYear : "{$firstYear}-{$lastYear}";
            } elseif ($firstYear) {
                return (string) $firstYear;
            }
            if (!empty($releaseDate)) {
                return (string) Carbon::parse($releaseDate)->year;
            }
            return null;
        } catch (\Exception $e) {
            return null;
        }
    }
} 