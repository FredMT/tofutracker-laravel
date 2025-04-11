<?php

namespace App\Actions\Trending;

use App\Jobs\UpdateTrendingGenresAndWatchProvidersJob;
use App\Models\Anime\AnimeMap;
use App\Models\Movie;
use App\Models\TvShow;
use App\Services\TmdbService;
use Illuminate\Support\Facades\Cache;

class GetTrendingGenresAndWatchProvidersAction
{
    private array $watchProviderIds = [
        8 => 'Netflix',
        1899 => 'Max',
        9 => 'Amazon Prime Video',
        283 => 'Crunchyroll',
        337 => 'Disney Plus',
        350 => 'Apple TV Plus',
        531 => 'Paramount Plus',
    ];

    public function __construct(
        private TmdbService $tmdbService
    ) {}

    public function store(): void
    {
        $trendingItems = $this->getTrendingItems();
     
        $withProviders = $this->appendWatchProviders($trendingItems);
     
        $processedItems = $this->processAnimeMapping($withProviders);
     
        $organizedData = $this->organizeResults($processedItems);

        Cache::put('trending_organized', $organizedData, now()->addDay());
    }

    public function execute(): array
    {
        return Cache::flexible('trending_organized', [60 * 60 * 24, 60 * 60 * 48], function () {
            UpdateTrendingGenresAndWatchProvidersJob::dispatch();

            return Cache::get('trending_organized');
        });
    }

    private function getTrendingItems(): array
    {
        $ids = [];
        $page = 1;
        $genreMap = config('genres');

        while (count($ids) < 1000 && ($trendingData = $this->tmdbService->getTrendingAllPaginated($page++))) {
            if (! isset($trendingData['results']) || empty($trendingData['results'])) {
                break;
            }

            foreach ($trendingData['results'] as $item) {
                $genres = collect($item['genre_ids'])
                    ->map(function ($genreId) use ($genreMap) {
                        return [
                            'id' => $genreId,
                            'name' => $genreMap[$genreId] ?? null,
                        ];
                    })
                    ->filter(fn ($genre) => ! is_null($genre['name']))
                    ->values()
                    ->all();

                $ids[] = [
                    'id' => $item['id'],
                    'media_type' => $item['media_type'],
                    'title' => $item['media_type'] === 'movie' ? $item['title'] : $item['name'],
                    'release_date' => $item['media_type'] === 'movie' ? $item['release_date'] : $item['first_air_date'],
                    'vote_average' => $item['vote_average'],
                    'popularity' => $item['popularity'],
                    'genres' => $genres,
                    'poster_path' => $item['poster_path'],
                    'backdrop_path' => $item['backdrop_path'],
                ];

                if (count($ids) >= 1000) {
                    break;
                }
            }
        }

        Cache::put('trending_ids', array_map(fn($item) => ['id' => $item['id'], 'media_type' => $item['media_type']], $ids), now()->addDay());

        return array_slice($ids, 0, 1000);
    }

    private function appendWatchProviders(array $items): array
    {
        return array_map(function ($item) {
            // Skip if not a movie or TV show
            if (!in_array($item['media_type'], ['movie', 'tv'])) {
                return array_merge($item, ['us_watch_providers' => []]);
            }

            $model = $item['media_type'] === 'movie'
                ? Movie::find($item['id'])
                : TvShow::find($item['id']);

            if (! $model) {
                return array_merge($item, ['us_watch_providers' => []]);
            }

            // Get US providers and filter for our supported providers
            $providers = $model->getWatchProvidersForCountry('US');
            $filteredProviders = array_filter($providers, function ($provider) {
                return isset($this->watchProviderIds[$provider['provider_id']]);
            });

            return array_merge($item, ['us_watch_providers' => $filteredProviders]);
        }, $items);
    }

    private function processAnimeMapping(array $items): array
    {
        // Get all anime mappings for the IDs we have
        $tmdbIds = array_column($items, 'id');
        $animeMaps = AnimeMap::whereIn('most_common_tmdb_id', $tmdbIds)
            ->get(['id', 'most_common_tmdb_id', 'tmdb_type'])
            ->keyBy('most_common_tmdb_id');
        
        // Use this to track already processed anime IDs
        $processedAnimeIds = [];
        
        // Process each item
        $result = [];
        foreach ($items as $item) {
            $tmdbId = (string) $item['id'];
            
            // Check if this is an anime
            if (isset($animeMaps[$tmdbId])) {
                $animeMapId = $animeMaps[$tmdbId]->id;
                
                // Skip if we already processed this anime
                if (in_array($animeMapId, $processedAnimeIds)) {
                    continue;
                }
                
                $processedAnimeIds[] = $animeMapId;
                
                // Mark as anime but preserve original media type
                $result[] = array_merge($item, [
                    'media_type' => 'anime',
                    'original_media_type' => $item['media_type'],
                    'anime_id' => $animeMapId,
                ]);
            } else {
                $result[] = $item;
            }
        }
        
        return $result;
    }

    private function organizeResults(array $items): array
    {
        // Get ignored IDs from config
        $ignoredIds = config('trending.ignored_ids', []);

        // Filter out ignored IDs and sort by popularity
        $items = collect($items)
            ->reject(fn ($item) => in_array($item['id'], $ignoredIds))
            ->sortByDesc('popularity')
            ->values()
            ->all();

        $byGenre = [];
        $byProvider = [];

        // Initialize provider arrays
        foreach ($this->watchProviderIds as $providerId => $providerName) {
            $byProvider[$providerId] = [
                'provider_name' => $providerName,
                'provider_logo' => null,
                'items' => [],
            ];
        }

        foreach ($items as $item) {
            // Create clean item data for output
            $cleanItem = [
                'id' => $item['id'],
                'media_type' => $item['media_type'],
                'title' => $item['title'],
                'release_date' => $item['release_date'],
                'vote_average' => $item['vote_average'],
                'popularity' => $item['popularity'],
                'poster_path' => $item['poster_path'],
                'backdrop_path' => $item['backdrop_path'],
            ];

            // Add anime-specific fields if it's anime
            if ($item['media_type'] === 'anime') {
                $cleanItem['original_media_type'] = $item['original_media_type'];
                $cleanItem['anime_id'] = $item['anime_id'];
            }

            // Process by genre
            if (!empty($item['genres'])) {
                foreach ($item['genres'] as $genre) {
                    if (!isset($byGenre[$genre['id']])) {
                        $byGenre[$genre['id']] = [
                            'genre_name' => $genre['name'],
                            'items' => [],
                        ];
                    }

                    // Check if this ID already exists in this genre
                    $existingIds = array_column($byGenre[$genre['id']]['items'], 'id');
                    if (!in_array($item['id'], $existingIds) && count($byGenre[$genre['id']]['items']) < 20) {
                        $byGenre[$genre['id']]['items'][] = $cleanItem;
                    }
                }
            }

            // Process by provider
            if (!empty($item['us_watch_providers'])) {
                foreach ($item['us_watch_providers'] as $provider) {
                    $providerId = $provider['provider_id'];
                    if (isset($this->watchProviderIds[$providerId])) {
                        // Set provider logo if not already set
                        if ($byProvider[$providerId]['provider_logo'] === null) {
                            $byProvider[$providerId]['provider_logo'] = $provider['logo_path'];
                        }

                        // Check if this ID already exists in this provider
                        $existingIds = array_column($byProvider[$providerId]['items'], 'id');
                        if (!in_array($item['id'], $existingIds) && count($byProvider[$providerId]['items']) < 20) {
                            $byProvider[$providerId]['items'][] = $cleanItem;
                        }
                    }
                }
            }
        }

        // Sort genres by name
        ksort($byGenre);

        return [
            'by_genre' => $byGenre,
            'by_provider' => $byProvider,
        ];
    }
}
