<?php

namespace App\Actions\AnimesPage;

use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeMap;
use App\Models\Anime\AnimeMappingExternalId;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GetAnimeGenresAction
{
    private array $targetGenreIds = [1, 2, 46, 4, 8, 14, 22, 36, 24, 30, 52, 62, 66, 18, 40, 72, 11, 76, 82];

    private int $randomGenresCount = 15;

    private string $cacheKey = 'anime_genre_data';

    public function execute(): array
    {
        try {
            $allGenres = Cache::get($this->cacheKey, ['genres' => []]);

            if (empty($allGenres['genres'])) {
                return [];
            }

            $randomGenres = collect($allGenres['genres'])->random($this->randomGenresCount);

            return $randomGenres->values()->all();
        } catch (\Exception $e) {
            Log::error('Error fetching anime genres from cache: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return [];
        }
    }

    public function fetchAndStore(): void
    {
        try {
            $cacheTTL = seconds_until('first sunday next month at 8 am');

            $allGenres = $this->fetchAllGenres();

            if (empty($allGenres)) {
                Cache::put($this->cacheKey, ['genres' => []], $cacheTTL);

                return;
            }

            Cache::put($this->cacheKey, ['genres' => $allGenres], $cacheTTL);
        } catch (\Exception $e) {
            Log::error('Error in fetchAndStore for anime genres: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);
        }
    }

    private function fetchAllGenres(): array
    {
        try {
            $genres = [];

            foreach ($this->targetGenreIds as $genreId) {
                try {
                    $genreName = config("jikan.{$genreId}");

                    if (! $genreName) {
                        continue;
                    }

                    $shows = $this->fetchAnimeForGenre($genreId);

                    if ($shows->isNotEmpty()) {
                        $genres[] = [
                            'id' => $genreId,
                            'name' => $genreName,
                            'shows' => $shows->values()->all(),
                        ];
                    }
                } catch (\Exception $e) {
                    Log::error("Error fetching genre {$genreId}: ".$e->getMessage(), ['trace' => $e->getTraceAsString()]);

                    continue;
                }
            }

            return $genres;
        } catch (\Exception $e) {
            Log::error('Error in fetching genres from jikan api: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return [];
        }
    }

    private function fetchAnimeForGenre(int $genreId): Collection
    {
        try {
            $apiUrl = 'https://api.jikan.moe/v4/anime';
            $response = Http::get($apiUrl, [
                'genres' => $genreId,
                'order_by' => 'popularity',
                'sort' => 'asc',
            ]);

            if (! $response->successful()) {
                Log::warning("Jikan API request failed for genre {$genreId}: ".$response->status());

                return collect();
            }

            $data = $response->json('data', []);
            $malIds = collect($data)->pluck('mal_id')->filter()->all();

            if (empty($malIds)) {
                Log::info("No anime found for genre {$genreId}");

                return collect();
            }

            $mappings = AnimeMappingExternalId::whereIn('mal_id', $malIds)
                ->whereNotNull('anidb_id')
                ->get();

            $anidbIds = $mappings->pluck('anidb_id')->all();

            if (empty($anidbIds)) {
                Log::info("No mappings found for MAL IDs in genre {$genreId}");

                return collect();
            }

            $animeWithMapIds = AnidbAnime::whereIn('id', $anidbIds)
                ->whereNotNull('map_id')
                ->get(['id', 'map_id']);

            $mapIds = $animeWithMapIds->pluck('map_id')->all();

            if (empty($mapIds)) {
                Log::info("No anime maps found for AniDB IDs in genre {$genreId}");

                return collect();
            }

            $animeMaps = AnimeMap::whereIn('id', $mapIds)
                ->get(['id', 'most_common_tmdb_id', 'tmdb_type']);

            $shows = collect();

            foreach ($animeMaps as $animeMap) {
                try {
                    $tmdbModel = $animeMap->getTmdbModel();

                    if (! $tmdbModel) {
                        continue;
                    }

                    $shows->push([
                        'id' => $animeMap->id,
                        'title' => $animeMap->title,
                        'poster' => $animeMap->poster,
                        'rating' => number_format($animeMap->rating ?? 0, 1, '.', ''),
                        'year' => $animeMap->yearRange ? explode('-', $animeMap->yearRange)[0] : null,
                        'backdrop' => $animeMap->backdrop ?? null,
                    ]);

                    if ($shows->count() >= 10) {
                        break;
                    }
                } catch (\Exception $e) {
                    Log::error("Error processing anime map {$animeMap->id}: ".$e->getMessage());

                    continue;
                }
            }

            return $shows;
        } catch (\Exception $e) {
            Log::error('Error in fetchAnimeForGenre: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return collect();
        }
    }
}
