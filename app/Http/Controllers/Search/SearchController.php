<?php

namespace App\Http\Controllers\Search;

use App\Http\Controllers\Controller;
use App\Models\AnidbAnime;
use App\Models\AnimeMappingExternalId;
use App\Services\TmdbService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Inertia\Response;

class SearchController extends Controller
{
    private TmdbService $tmdbService;

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

    public function search(Request $request): Response
    {
        // If no query parameter, return with null results
        if (! $request->has('q') || empty($request->query('q'))) {
            return Inertia::render('Search', [
                'search_results' => null,
                'query' => '',
            ]);
        }

        $validator = Validator::make($request->all(), [
            'q' => ['required', 'string', 'min:2', 'max:100', 'regex:/^[\p{L}\p{N}\s\-\'\.,]+$/u'],
        ], [
            'q.regex' => 'The search query can only contain letters, numbers, spaces, and basic punctuation.',
        ]);

        if ($validator->fails()) {
            return Inertia::render('Search', [
                'search_results' => null,
                'query' => $request->query('q'),
                'errors' => $validator->errors(),
            ]);
        }

        try {
            $query = $request->query('q');
            $results = $this->fetchAllResults($query);

            return Inertia::render('Search', [
                'search_results' => $results,
                'query' => $query,
            ]);
        } catch (\Exception $e) {
            logger()->error('Search error: '.$e->getMessage());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while processing your search',
            ]);
        }
    }

    private function fetchAllResults(string $query): array
    {
        $allResults = [
            'movies' => [],
            'tv' => [],
            'anime' => [],
        ];

        $seenMapIds = [];

        for ($page = 1; $page <= self::MAX_PAGES; $page++) {
            $searchResults = $this->tmdbService->search($query, $page);

            if (empty($searchResults['results'])) {
                break;
            }

            $categorizedPage = $this->categorizeResults($searchResults);

            // Merge results, ensuring unique anime by map_id
            foreach ($categorizedPage['anime'] as $animeResult) {
                if (! isset($seenMapIds[$animeResult['map_id']])) {
                    $seenMapIds[$animeResult['map_id']] = true;
                    $allResults['anime'][] = $this->transformResult($animeResult);
                }
            }

            $allResults['movies'] = array_merge(
                $allResults['movies'],
                array_map([$this, 'transformResult'], $categorizedPage['movies'])
            );

            $allResults['tv'] = array_merge(
                $allResults['tv'],
                array_map([$this, 'transformResult'], $categorizedPage['tv'])
            );

            if ($page >= $searchResults['total_pages']) {
                break;
            }
        }

        return $allResults;
    }

    private function transformResult(array $result): array
    {
        // Transform genres
        if (isset($result['genre_ids'])) {
            $genreMap = Config::get('genres');
            $result['genres'] = array_map(
                fn ($id) => [
                    'id' => $id,
                    'name' => $genreMap[$id] ?? 'Unknown',
                ],
                $result['genre_ids']
            );
            unset($result['genre_ids']);
        }

        // Normalize title field
        if (isset($result['name']) && ! isset($result['title'])) {
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
            ->filter(fn ($item) => $item['media_type'] !== 'person');

        $tmdbIds = $results->pluck('id')->all();

        $categorizations = Cache::get(self::CACHE_KEY, []);

        $uncachedIds = array_values(array_filter($tmdbIds, fn ($id) => ! isset($categorizations[$id])));

        if (! empty($uncachedIds)) {
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
                if (! isset($categorizations[$tmdbId])) {
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
            $category = $categorizations[$tmdbId];

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
}
