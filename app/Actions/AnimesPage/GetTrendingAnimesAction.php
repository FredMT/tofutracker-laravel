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
    public function __construct(private TmdbService $tmdbService, private AnidbService $anidbService)
    {
        $this->tmdbService = $tmdbService;
        $this->anidbService = $anidbService;
    }

    public function execute(): array
    {
        $hotAnimeIds = $this->anidbService->getHotAnime();
        $hotAnime = AnidbAnime::whereIn('id', $hotAnimeIds)->get();
        $finalResult = $this->processAnimeCollection($hotAnime, true);

        if (count($finalResult) < 20) {
            $trendingAnime = $this->getTrendingAnime();

            $existingIds = collect($finalResult)->pluck('id')->toArray();
            $filteredTrending = collect($trendingAnime)
                ->filter(fn ($item) => ! in_array($item['id'], $existingIds))
                ->sortByDesc('rating')
                ->take(20 - count($finalResult))
                ->values()
                ->all();

            $finalResult = array_merge($finalResult, $filteredTrending);
        }

        return $finalResult;
    }

    private function processAnimeCollection($animeCollection, bool $isHotAnime = false): array
    {
        $result = [];
        $notRequiredFields = ['rating'];

        foreach ($animeCollection as $anime) {
            $genresArray = $anime->genres()->pluck('name')->toArray();
            $animeData = $isHotAnime ? [
                'id' => $anime->id,
                'title' => $anime->title,
                'logo' => $anime->logo,
                'backdrop' => $anime->backdrop,
                'poster' => $anime->poster,
                'overview' => $anime->overview,
                'year' => $anime->yearRange,
                'genres' => $genresArray,
                'rating' => number_format($anime->tmdbRating, 1, '.', ''),
            ] : $anime;
            $animeData = array_filter($animeData, fn ($value, $key) => ! in_array($key, $notRequiredFields) || ! empty($value), ARRAY_FILTER_USE_BOTH);
        }

        return $result;
    }

    private function getTrendingAnime(): array
    {
        $maxResults = 500;
        $tvResults = $this->fetchTrendingTv($maxResults);
        $ignoredIds = config('trending.ignored_ids', []);
        $genreMap = config('genres');
        $result = [];
        $processedMapIds = [];

        $tmdbIdsOrdered = $tvResults->pluck('id')->toArray();
        $mappings = AnimeMappingExternalId::whereIn('themoviedb_id', $tmdbIdsOrdered)
            ->whereNotIn('themoviedb_id', $ignoredIds)
            ->whereNotNull('anidb_id')
            ->get(['themoviedb_id', 'anidb_id'])
            ->keyBy('themoviedb_id');

        $anidbIdToTmdb = [];
        foreach ($tvResults as $item) {
            $tmdbId = $item['id'];
            if (isset($mappings[$tmdbId])) {
                $anidbIdToTmdb[$mappings[$tmdbId]->anidb_id] = $item;
            }
        }

        $anidbIds = array_unique(array_keys($anidbIdToTmdb));
        $anidbAnimes = AnidbAnime::whereIn('id', $anidbIds)->get(['id', 'map_id']);
        $anidbIdToMapId = $anidbAnimes->pluck('map_id', 'id');
        $animeMaps = AnimeMap::whereIn('id', $anidbIdToMapId->values())->get()->keyBy('id');

        foreach ($anidbIds as $anidbId) {
            if (! isset($anidbIdToMapId[$anidbId]) || in_array($anidbIdToMapId[$anidbId], $processedMapIds)) {
                continue;
            }

            $mapId = $anidbIdToMapId[$anidbId];
            $animeMap = $animeMaps[$mapId] ?? null;
            $tmdb = $anidbIdToTmdb[$anidbId];

            if (! $animeMap || ! $tmdb) {
                continue;
            }

            $title = $tmdb['name'] ?? null;
            $backdrop = $tmdb['backdrop_path'] ?? null;
            $poster = $tmdb['poster_path'] ?? null;
            $overview = $tmdb['overview'] ?? null;
            $rating = isset($tmdb['vote_average']) ? number_format($tmdb['vote_average'], 1, '.', '') : null;

            $genreIds = $tmdb['genre_ids'] ?? [];
            $genreNames = collect($genreIds)
                ->map(fn ($id) => $genreMap[$id] ?? null)
                ->filter()
                ->all();
            $genresArray = $genreNames;

            $firstAirDate = $tmdb['first_air_date'] ?? null;
            $lastAirDate = $tmdb['last_air_date'] ?? null;
            $year = $this->calculateYearString($firstAirDate, $lastAirDate);
            $logo = $animeMap->getTmdbModel()->highestVotedLogoPath ?? null;

            if (
                ! $mapId || ! $title || ! $logo || ! $backdrop || ! $poster ||
                ! $overview || ! $year || empty($genresArray) ||
                $firstAirDate < Carbon::now()->subyears(2)->year
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
                'genres' => $genresArray,
                'rating' => $rating,
            ];

            $processedMapIds[] = $mapId;
        }

        return $result;
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

    private function calculateYearString(?string $firstAirDate, ?string $lastAirDate): ?string
    {
        if (! $firstAirDate) {
            return null;
        }

        $firstYear = Carbon::parse($firstAirDate)->year;

        if (! $lastAirDate) {
            return (string) $firstYear;
        }

        $lastYear = Carbon::parse($lastAirDate)->year;

        return $firstYear === $lastYear ? (string) $firstYear : "$firstYear-$lastYear";
    }
}
