<?php

namespace App\Repositories\Anime;

use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeMap;
use App\Models\Anime\AnimeMappingExternalId;
use App\Services\TmdbService;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Pagination\LengthAwarePaginator as PaginationLengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;

class AnimeCollectionRepository
{
    protected TmdbService $tmdbService;

    private const CACHE_KEY = 'tmdb_categorizations';
    private const MAX_PAGES = 5;
    private const ALLOWED_FIELDS = [
        'id',
        'overview',
        'poster_path',
        'popularity',
        'year',
        'title',
        'vote_average',
        'genres',
        'map_id',
    ];

    public function __construct(TmdbService $tmdbService)
    {
        $this->tmdbService = $tmdbService;
    }

    /**
     * Get paginated anime collections with optional filtering and sorting.
     *
     * @param array $params
     * @return LengthAwarePaginator
     */
    public function getPaginatedCollections(array $params): LengthAwarePaginator
    {
        $perPage = $params['per_page'] ?? 100;
        $search = $params['search'] ?? null;
        $sortField = $params['sort'] ?? 'id';
        $sortDirection = $params['direction'] ?? 'asc';
        $page = $params['page'] ?? 1;

        // If there's a search query, use TMDB search with SearchController approach
        if ($search && !empty(trim($search))) {
            return $this->searchAnimeCollections($search, $page, $perPage);
        }

        // Otherwise, just get paginated collections
        return AnimeMap::query()
            ->with([
                'chains' => function (HasMany $query) {
                    $query->orderBy('importance_order', 'asc');
                },
                'chains.entries' => function (HasMany $query) {
                    $query->orderBy('sequence_order', 'asc');
                },
                'chains.entries.anime',
                'relatedEntries.anime',
            ])
            ->orderBy($sortField, $sortDirection)
            ->paginate($perPage);
    }

    /**
     * Search anime collections using the approach from SearchController, focusing only on anime results.
     *
     * @param string $query
     * @param int $page
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    protected function searchAnimeCollections(string $query, int $page, int $perPage): LengthAwarePaginator
    {
        try {
            // Fetch all anime results using approach similar to SearchController
            $animeResults = $this->fetchAllAnimeResults($query);

            // Get unique map IDs
            $mapIds = collect($animeResults)->pluck('map_id')->unique()->values()->all();

            // Fetch the actual AnimeMap models with these IDs
            $animeCollections = AnimeMap::whereIn('id', $mapIds)
                ->with([
                    'chains' => function (HasMany $query) {
                        $query->orderBy('importance_order', 'asc');
                    },
                    'chains.entries' => function (HasMany $query) {
                        $query->orderBy('sequence_order', 'asc');
                    },
                    'chains.entries.anime',
                    'relatedEntries.anime',
                ])
                ->get();

            // Create a slice of the results for pagination
            $paginatedCount = count($mapIds);
            $offset = ($page - 1) * $perPage;
            $slicedCollections = $animeCollections->slice($offset, $perPage);

            // Create a custom paginator
            return new PaginationLengthAwarePaginator(
                $slicedCollections,
                $paginatedCount,
                $perPage,
                $page,
                ['path' => request()->url(), 'query' => request()->query()]
            );
        } catch (\Exception $e) {
            Log::error('Error searching anime collections', [
                'search_term' => $query,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            // Return empty paginator on error
            return new PaginationLengthAwarePaginator(
                collect(),
                0,
                $perPage,
                $page,
                ['path' => request()->url(), 'query' => request()->query()]
            );
        }
    }

    /**
     * Fetch all anime results similar to SearchController's fetchAllResults, but only focusing on anime.
     *
     * @param string $query
     * @return array
     */
    private function fetchAllAnimeResults(string $query): array
    {
        $allAnimeResults = [];
        $seenMapIds = [];

        for ($page = 1; $page <= self::MAX_PAGES; $page++) {
            $searchResults = $this->tmdbService->search($query, $page);

            if (empty($searchResults['results'])) {
                break;
            }

            $categorizedResults = $this->categorizeResults($searchResults);

            // Only collect anime results, ensuring uniqueness by map_id
            foreach ($categorizedResults['anime'] as $animeResult) {
                if (!isset($seenMapIds[$animeResult['map_id']])) {
                    $seenMapIds[$animeResult['map_id']] = true;
                    $allAnimeResults[] = $this->transformResult($animeResult);
                }
            }

            if ($page >= $searchResults['total_pages']) {
                break;
            }
        }

        return $allAnimeResults;
    }

    /**
     * Transform a result similar to SearchController's transformResult method.
     *
     * @param array $result
     * @return array
     */
    private function transformResult(array $result): array
    {
        // Transform genres
        if (isset($result['genre_ids'])) {
            $genreMap = Config::get('genres');
            $result['genres'] = array_map(
                fn($id) => [
                    'id' => $id,
                    'name' => $genreMap[$id] ?? 'Unknown',
                ],
                $result['genre_ids']
            );
            unset($result['genre_ids']);
        }

        // Normalize title field
        if (isset($result['name']) && !isset($result['title'])) {
            $result['title'] = $result['name'];
            unset($result['name']);
        }

        // Extract year from release date
        $date = $result['release_date'] ?? $result['first_air_date'] ?? null;
        if ($date) {
            $result['year'] = (int) substr($date, 0, 4);
        }
        unset($result['release_date'], $result['first_air_date']);

        return array_intersect_key($result, array_flip(self::ALLOWED_FIELDS));
    }

    /**
     * Categorize search results similar to SearchController's categorizeResults method.
     *
     * @param array $searchResults
     * @return array
     */
    private function categorizeResults(array $searchResults): array
    {
        if (empty($searchResults['results'])) {
            return [
                'movies' => [],
                'tv' => [],
                'anime' => [],
            ];
        }

        $results = collect($searchResults['results'])
            ->filter(fn($item) => $item['media_type'] !== 'person');

        $tmdbIds = $results->pluck('id')->all();

        $categorizations = Cache::get(self::CACHE_KEY, []);

        $uncachedIds = array_values(array_filter($tmdbIds, fn($id) => !isset($categorizations[$id])));

        if (!empty($uncachedIds)) {
            $animeMappings = AnimeMappingExternalId::whereIn('themoviedb_id', $uncachedIds)
                ->whereNotNull('anidb_id')
                ->get()
                ->keyBy('themoviedb_id');

            if ($animeMappings->isNotEmpty()) {
                $anidbIds = $animeMappings->pluck('anidb_id')->unique();
                $anidbAnimes = AnidbAnime::whereIn('id', $anidbIds)
                    ->get()
                    ->keyBy('id');

                foreach ($animeMappings as $tmdbId => $mapping) {
                    $anidbAnime = $anidbAnimes->get($mapping->anidb_id);
                    if ($anidbAnime && ($mapId = $anidbAnime->map())) {
                        $categorizations[$tmdbId] = [
                            'type' => 'anime',
                            'map_id' => $mapId,
                        ];

                        continue;
                    }
                    $categorizations[$tmdbId] = ['type' => 'other'];
                }
            }

            foreach ($uncachedIds as $tmdbId) {
                if (!isset($categorizations[$tmdbId])) {
                    $categorizations[$tmdbId] = ['type' => 'other'];
                }
            }

            Cache::put(self::CACHE_KEY, $categorizations, now()->addMonth());
        }

        $categorizedResults = [
            'movies' => [],
            'tv' => [],
            'anime' => [],
        ];

        foreach ($results as $result) {
            $tmdbId = $result['id'];
            $category = $categorizations[$tmdbId] ?? ['type' => 'other'];

            if ($category['type'] === 'anime') {
                $result['map_id'] = $category['map_id'];
                $categorizedResults['anime'][] = $result;
            } elseif ($result['media_type'] === 'movie') {
                $categorizedResults['movies'][] = $result;
            } elseif ($result['media_type'] === 'tv') {
                $categorizedResults['tv'][] = $result;
            }
        }

        return $categorizedResults;
    }

    /**
     * Get a specific anime collection by ID with its related data.
     *
     * @param int $id
     * @return Model|AnimeMap
     */
    public function getCollectionById(int $id): Model|AnimeMap
    {
        return AnimeMap::with([
            'chains' => function (HasMany $query) {
                $query->orderBy('importance_order', 'asc');
            },
            'chains.entries' => function (HasMany $query) {
                $query->orderBy('sequence_order', 'asc');
            },
            'chains.entries.anime',
            'relatedEntries.anime',
        ])->findOrFail($id);
    }
}
