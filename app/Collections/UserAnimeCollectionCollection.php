<?php

namespace App\Collections;

use App\Enums\WatchStatus;
use App\Models\AnimeEpisodeMapping;
use App\Models\UserAnimeEpisode;
use Carbon\Carbon;
use DateTime;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserAnimeCollectionCollection extends Collection
{
    private $episodeStatsCache = [];

    private function getTmdbData($userAnimeCollection)
    {
        $animeMap = $userAnimeCollection->animeMap;
        $cacheKey = "tmdb_data_{$animeMap->tmdb_type}_{$animeMap->most_common_tmdb_id}";

        return Cache::get($cacheKey);
    }

    private function calculateAllEpisodeStats($userAnimeCollection): void
    {
        // Get all anime IDs from both chains and related entries
        $allAnimeIds = collect();

        // Add chain entry anime IDs
        $userAnimeCollection->animeMap->chains->each(function ($chain) use (&$allAnimeIds) {
            $allAnimeIds = $allAnimeIds->concat($chain->entries->pluck('anime_id'));
        });

        // Add related entry anime IDs
        $allAnimeIds = $allAnimeIds->concat($userAnimeCollection->animeMap->relatedEntries->pluck('anime_id'));

        // Get all user animes for these anidb IDs
        $userAnimes = $userAnimeCollection->anime->whereIn('anidb_id', $allAnimeIds);

        // Get total episodes for all anime in one query
        $totalEpisodes = AnimeEpisodeMapping::query()
            ->whereIn('anidb_id', $allAnimeIds)
            ->where('is_special', false)
            ->selectRaw('anidb_id, count(*) as total')
            ->groupBy('anidb_id')
            ->get()
            ->pluck('total', 'anidb_id');

        // Get watched episodes for all user animes in one query
        $watchedEpisodes = UserAnimeEpisode::query()
            ->whereIn('user_anime_id', $userAnimes->pluck('id'))
            ->where('watch_status', WatchStatus::COMPLETED)
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('anime_episode_mappings')
                    ->whereColumn('anime_episode_mappings.tvdb_episode_id', 'user_anime_episodes.episode_id')
                    ->where('anime_episode_mappings.is_special', false);
            })
            ->selectRaw('user_anime_id, count(*) as watched')
            ->groupBy('user_anime_id')
            ->get();

        // Create a map of user_anime_id to anidb_id for easy lookup
        $userAnimeToAnidb = $userAnimes->pluck('anidb_id', 'id');

        // Build the cache
        $watchedEpisodes->each(function ($stat) use ($userAnimeToAnidb, $totalEpisodes) {
            $anidbId = $userAnimeToAnidb[$stat->user_anime_id];
            $this->episodeStatsCache[$stat->user_anime_id] = [
                'total_episodes' => $totalEpisodes[$anidbId] ?? 0,
                'watched_episodes' => $stat->watched,
            ];
        });

        // Add entries for animes with no watched episodes
        $userAnimes->each(function ($userAnime) use ($totalEpisodes) {
            if (! isset($this->episodeStatsCache[$userAnime->id])) {
                $this->episodeStatsCache[$userAnime->id] = [
                    'total_episodes' => $totalEpisodes[$userAnime->anidb_id] ?? 0,
                    'watched_episodes' => 0,
                ];
            }
        });
    }

    private function getEpisodeStats($userAnime): array
    {
        return $this->episodeStatsCache[$userAnime->id] ?? [
            'total_episodes' => 0,
            'watched_episodes' => 0,
        ];
    }

    private function isStandaloneMovie($userAnimeCollection, $userAnime): bool
    {
        // Use eager loaded relationships instead of making new queries
        $totalEntries = $userAnimeCollection->animeMap->chains
            ->sum(function ($chain) {
                return $chain->entries->count();
            });

        $totalRelatedEntries = $userAnimeCollection->animeMap->relatedEntries->count();

        // If there's more than one entry, it's not a standalone movie
        if (($totalEntries + $totalRelatedEntries) > 1) {
            return false;
        }

        // Check if the anime type is Movie
        return $userAnime->anime->type === 'Movie';
    }

    private function formatAnimeEntry($entry, $userAnime, $animeEpisodeStats): array
    {
        return [
            'id' => $entry->anime->id,
            'title' => $entry->anime->title_main,
            'poster_path' => $entry->anime->picture,
            'release_date' => $entry->anime->startdate ? Carbon::parse($entry->anime->startdate)->year : null,
            'rating' => $userAnime->rating,
            'watch_status' => $userAnime->watch_status->value,
            'added_at' => $userAnime->created_at->format('j F, Y'),
            'total_episodes' => $animeEpisodeStats['total_episodes'],
            'watched_episodes' => $animeEpisodeStats['watched_episodes'],
            'sequence_order' => $entry->sequence_order ?? 0,
        ];
    }

    public function filterByGenres(string|array|null $genres): self
    {
        if (empty($genres)) {
            return $this;
        }

        $genreIds = is_string($genres)
            ? explode(',', $genres)
            : (array) $genres;

        return $this->filter(function ($userAnimeCollection) use ($genreIds) {
            $tmdbData = $this->getTmdbData($userAnimeCollection);
            if (! $tmdbData) {
                return false;
            }

            $itemGenres = collect($tmdbData['genres'] ?? [])
                ->pluck('id')
                ->toArray();

            return ! empty(array_intersect($genreIds, $itemGenres));
        });
    }

    public function filterByStatus(?string $status): self
    {
        if (empty($status) || ! WatchStatus::tryFrom($status)) {
            return $this;
        }

        return $this->where('watch_status', WatchStatus::from($status));
    }

    public function filterByTitle(?string $title): self
    {
        if (empty($title)) {
            return $this;
        }

        $searchTerms = array_filter(explode(' ', trim($title)));

        return $this->filter(function ($userAnimeCollection) use ($searchTerms) {
            $tmdbData = $this->getTmdbData($userAnimeCollection);
            if (! $tmdbData) {
                return false;
            }

            $itemTitle = $tmdbData['title'] ?? $tmdbData['name'] ?? '';

            return collect($searchTerms)->every(function ($term) use ($itemTitle) {
                return Str::contains(Str::lower($itemTitle), Str::lower($term));
            });
        });
    }

    public function filterByDateRange(?string $fromDate, ?string $toDate): self
    {
        if (empty($fromDate) || empty($toDate)) {
            return $this;
        }

        $from = new DateTime($fromDate);
        $to = new DateTime($toDate);

        // If dates are the same, filter for that specific day
        if ($from->format('Y-m-d') === $to->format('Y-m-d')) {
            return $this->filter(function ($userAnimeCollection) use ($from) {
                $createdAt = new DateTime($userAnimeCollection->created_at);

                return $createdAt->format('Y-m-d') === $from->format('Y-m-d');
            });
        }

        // Filter for date range
        return $this->filter(function ($userAnimeCollection) use ($from, $to) {
            $createdAt = new DateTime($userAnimeCollection->created_at);

            return $createdAt >= $from && $createdAt <= $to;
        });
    }

    public function applyFilters(array $filters): self
    {
        return $this
            ->filterByGenres($filters['genres'] ?? null)
            ->filterByStatus($filters['status'] ?? null)
            ->filterByTitle($filters['title'] ?? null)
            ->filterByDateRange(
                $filters['from_date'] ?? null,
                $filters['to_date'] ?? null
            );
    }

    public function toPresentation(): array
    {
        // Pre-load all necessary relationships at once
        $this->load([
            'anime.anime',
            'anime.episodes.episode',
            'animeMap',
            'animeMap.chains.entries.anime',
            'animeMap.relatedEntries.anime',
            'animeMap.chains' => function ($query) {
                $query->withCount('entries');
            },
        ]);

        return $this->map(function ($userAnimeCollection) {
            if (! $userAnimeCollection->relationLoaded('animeMap')) {
                throw new \RuntimeException('AnimeMap relationship not loaded. Lazy loading is disabled.');
            }

            // Pre-calculate all episode stats
            $this->calculateAllEpisodeStats($userAnimeCollection);

            // Cache TMDB data
            $tmdbData = $this->getTmdbData($userAnimeCollection);

            $releaseDate = null;
            if ($tmdbData) {
                $dateField = $userAnimeCollection->animeMap->tmdb_type === 'movie' ? 'release_date' : 'first_air_date';
                $releaseDate = isset($tmdbData[$dateField]) ? Carbon::parse($tmdbData[$dateField])->year : null;
            }

            $movies = collect();
            $chainSeasons = collect();

            // Process chain entries once
            if ($userAnimeCollection->animeMap) {
                $userAnimeCollection->animeMap->chains->each(function ($chain) use ($userAnimeCollection, &$movies, &$chainSeasons) {
                    if (! $chain->relationLoaded('entries')) {
                        throw new \RuntimeException('Chain entries relationship not loaded. Lazy loading is disabled.');
                    }

                    $entries = $chain->entries
                        ->map(function ($entry) use ($userAnimeCollection, &$movies) {
                            if (! $entry->relationLoaded('anime')) {
                                throw new \RuntimeException('Chain entry anime relationship not loaded. Lazy loading is disabled.');
                            }

                            $userAnime = $userAnimeCollection->anime
                                ->where('anidb_id', $entry->anime_id)
                                ->first();

                            if (! $userAnime) {
                                return null;
                            }

                            $animeEpisodeStats = $this->getEpisodeStats($userAnime);
                            $formattedEntry = $this->formatAnimeEntry($entry, $userAnime, $animeEpisodeStats);

                            if ($this->isStandaloneMovie($userAnimeCollection, $userAnime)) {
                                $movies->push($formattedEntry);

                                return null;
                            }

                            return $formattedEntry;
                        })
                        ->filter()
                        ->values();

                    if ($entries->isNotEmpty()) {
                        $chainSeasons->push([
                            'chain_id' => $chain->id,
                            'name' => $chain->name,
                            'importance_order' => $chain->importance_order,
                            'entries' => $entries,
                            'type' => 'chain',
                        ]);
                    }
                });

                // Process related entries once
                $relatedSeasons = collect();
                $chainAnimeIds = $userAnimeCollection->animeMap->chains->pluck('entries')->flatten()->pluck('anime_id');

                if ($userAnimeCollection->animeMap->relationLoaded('relatedEntries')) {
                    $relatedEntries = $userAnimeCollection->animeMap->relatedEntries
                        ->whereNotIn('anime_id', $chainAnimeIds)
                        ->map(function ($entry) use ($userAnimeCollection, &$movies) {
                            if (! $entry->relationLoaded('anime')) {
                                throw new \RuntimeException('Related entry anime relationship not loaded. Lazy loading is disabled.');
                            }

                            $userAnime = $userAnimeCollection->anime
                                ->where('anidb_id', $entry->anime_id)
                                ->first();

                            if (! $userAnime) {
                                return null;
                            }

                            $animeEpisodeStats = $this->getEpisodeStats($userAnime);
                            $formattedEntry = $this->formatAnimeEntry($entry, $userAnime, $animeEpisodeStats);

                            if ($this->isStandaloneMovie($userAnimeCollection, $userAnime)) {
                                $movies->push($formattedEntry);

                                return null;
                            }

                            return $formattedEntry;
                        })
                        ->filter()
                        ->values();

                    if ($relatedEntries->isNotEmpty()) {
                        $relatedSeasons->push([
                            'chain_id' => 0,
                            'name' => 'Related Entries',
                            'importance_order' => 9999,
                            'entries' => $relatedEntries,
                            'type' => 'related',
                        ]);
                    }
                }

                // Combine and sort seasons once
                $seasons = $chainSeasons->concat($relatedSeasons)
                    ->sortBy('importance_order')
                    ->values();

                // Calculate total episodes and watched episodes from the cached stats
                $totalEpisodes = 0;
                $watchedEpisodes = 0;
                $userAnimeCollection->anime->each(function ($userAnime) use (&$totalEpisodes, &$watchedEpisodes) {
                    $stats = $this->getEpisodeStats($userAnime);
                    $totalEpisodes += $stats['total_episodes'];
                    $watchedEpisodes += $stats['watched_episodes'];
                });

                // Calculate season stats
                $totalSeasons = $userAnimeCollection->animeMap->chains->sum('entries_count');
                $userTotalSeasons = $userAnimeCollection->anime->unique('anidb_id')->count();

                return [
                    'id' => $userAnimeCollection->animeMap->id,
                    'title' => $tmdbData['title'] ?? $tmdbData['name'] ?? null,
                    'poster_path' => $tmdbData['poster_path'] ?? null,
                    'release_date' => $releaseDate,
                    'rating' => $userAnimeCollection->rating,
                    'watch_status' => $userAnimeCollection->watch_status->value,
                    'added_at' => $userAnimeCollection->created_at->format('j F, Y'),
                    'total_episodes' => $totalEpisodes,
                    'watched_episodes' => $watchedEpisodes,
                    'total_seasons' => $totalSeasons,
                    'user_total_seasons' => $userTotalSeasons,
                    'tmdb_type' => $userAnimeCollection->animeMap->tmdb_type,
                    'collection_name' => $userAnimeCollection->animeMap->collection_name,
                    'genres' => collect($tmdbData['genres'] ?? [])->map(function ($genre) {
                        return [
                            'id' => $genre['id'],
                            'name' => $genre['name'],
                        ];
                    })->values()->all(),
                    'seasons' => $seasons,
                    'movies' => $movies->values()->all(),
                ];
            }

            // Return empty data if no animeMap
            return [
                'id' => null,
                'title' => null,
                'poster_path' => null,
                'release_date' => null,
                'rating' => $userAnimeCollection->rating,
                'watch_status' => $userAnimeCollection->watch_status->value,
                'added_at' => $userAnimeCollection->created_at->format('j F, Y'),
                'total_episodes' => 0,
                'watched_episodes' => 0,
                'total_seasons' => 0,
                'user_total_seasons' => 0,
                'tmdb_type' => null,
                'collection_name' => null,
                'genres' => [],
                'seasons' => [],
                'movies' => [],
            ];
        })->values()->all();
    }
}
