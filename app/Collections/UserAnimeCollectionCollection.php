<?php

namespace App\Collections;

use App\Enums\WatchStatus;
use App\Models\AnimeChainEntry;
use App\Models\AnimeEpisodeMapping;
use App\Models\UserAnimeEpisode;
use App\Services\TmdbService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use DateTime;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class UserAnimeCollectionCollection extends Collection
{
    private function getTmdbData($userAnimeCollection)
    {
        $animeMap = $userAnimeCollection->animeMap;
        $cacheKey = "tmdb_data_{$animeMap->tmdb_type}_{$animeMap->most_common_tmdb_id}";

        return Cache::remember($cacheKey, now()->addDays(1), function () use ($animeMap) {
            if (!$animeMap->most_common_tmdb_id || !$animeMap->tmdb_type) {
                return null;
            }

            $tmdbService = app(TmdbService::class);

            try {
                if ($animeMap->tmdb_type === 'movie') {
                    return $tmdbService->getMovieBasic($animeMap->most_common_tmdb_id);
                } else {
                    return $tmdbService->getTvBasic($animeMap->most_common_tmdb_id);
                }
            } catch (\Exception $e) {
                logger()->error("Failed to fetch TMDB data for {$animeMap->tmdb_type} {$animeMap->most_common_tmdb_id}: " . $e->getMessage());
                return null;
            }
        });
    }

    private function calculateEpisodeStats($userAnimeCollection): array
    {
        // Get all anime entries in the chain
        $chainEntryAnidbIds = AnimeChainEntry::query()
            ->whereIn('chain_id', $userAnimeCollection->animeMap->chains->pluck('id'))
            ->pluck('anime_id');

        // Get total episodes from episode mappings (excluding specials)
        $totalEpisodes = AnimeEpisodeMapping::query()
            ->whereIn('anidb_id', $chainEntryAnidbIds)
            ->where('is_special', false)
            ->count();

        // Get the user's anime entries for this collection
        $userAnimeIds = $userAnimeCollection->anime()
            ->whereIn('anidb_id', $chainEntryAnidbIds)
            ->pluck('id');

        // Get watched episodes count
        $watchedEpisodes = UserAnimeEpisode::query()
            ->whereIn('user_anime_id', $userAnimeIds)
            ->where('watch_status', WatchStatus::COMPLETED)
            ->whereExists(function ($query) {
                $query->select(DB::raw(1))
                    ->from('anime_episode_mappings')
                    ->whereColumn('anime_episode_mappings.tvdb_episode_id', 'user_anime_episodes.episode_id')
                    ->where('anime_episode_mappings.is_special', false);
            })
            ->count();

        return [
            'total_episodes' => $totalEpisodes,
            'watched_episodes' => $watchedEpisodes
        ];
    }

    private function calculateSeasonStats($userAnimeCollection): array
    {
        // Get all chain IDs for this collection
        $chainIds = $userAnimeCollection->animeMap->chains->pluck('id');

        // Get total possible seasons (total unique anime in the chain)
        $totalSeasons = AnimeChainEntry::query()
            ->whereIn('chain_id', $chainIds)
            ->distinct('anime_id')
            ->count();

        // Get user's total seasons (total unique anime the user has added)
        $userTotalSeasons = $userAnimeCollection->anime()
            ->distinct('anidb_id')
            ->count();

        return [
            'total_seasons' => $totalSeasons,
            'user_total_seasons' => $userTotalSeasons
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
            if (!$tmdbData) {
                return false;
            }

            $itemGenres = collect($tmdbData['genres'] ?? [])
                ->pluck('id')
                ->toArray();

            return !empty(array_intersect($genreIds, $itemGenres));
        });
    }

    public function filterByStatus(?string $status): self
    {
        if (empty($status) || !WatchStatus::tryFrom($status)) {
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
            if (!$tmdbData) {
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
        return $this->map(function ($userAnimeCollection) {
            // Load all necessary relationships upfront
            if (
                !$userAnimeCollection->relationLoaded('anime') ||
                !$userAnimeCollection->anime->first()?->relationLoaded('anime')
            ) {
                $userAnimeCollection->load([
                    'anime.anime', // Load AnidbAnime through UserAnime
                    'anime.episodes.episode', // Load UserAnimeEpisode and its relationships
                    'animeMap.chains.entries.anime' // Load chain entries with their anime
                ]);
            }

            $tmdbData = $this->getTmdbData($userAnimeCollection);

            $releaseDate = null;
            if ($tmdbData) {
                $dateField = $userAnimeCollection->animeMap->tmdb_type === 'movie'
                    ? 'release_date'
                    : 'first_air_date';

                $releaseDate = isset($tmdbData[$dateField])
                    ? Carbon::parse($tmdbData[$dateField])->year
                    : null;
            }

            $episodeStats = $this->calculateEpisodeStats($userAnimeCollection);
            $seasonStats = $this->calculateSeasonStats($userAnimeCollection);

            // Transform chains into seasons
            $seasons = $userAnimeCollection->animeMap->chains->map(function ($chain) use ($userAnimeCollection) {
                // Get entries sorted by sequence_order with eager loaded anime
                $entries = $chain->entries()
                    ->with('anime')
                    ->orderBy('sequence_order', 'asc')
                    ->get()
                    ->map(function ($entry) use ($userAnimeCollection) {
                        // Find corresponding UserAnime if it exists
                        $userAnime = $userAnimeCollection->anime
                            ->where('anidb_id', $entry->anime_id)
                            ->first();

                        if (!$userAnime) {
                            return null;
                        }

                        $animeEpisodeStats = $this->calculateEpisodeStatsForAnime($userAnime);

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
                            'sequence_order' => $entry->sequence_order
                        ];
                    })
                    ->filter() // Remove null entries
                    ->values();

                // Only return chain if it has entries
                if ($entries->isEmpty()) {
                    return null;
                }

                return [
                    'chain_id' => $chain->id,
                    'name' => $chain->name,
                    'importance_order' => $chain->importance_order,
                    'entries' => $entries
                ];
            })
                ->filter() // Remove null chains
                ->sortBy('importance_order')
                ->values();

            return [
                'id' => $userAnimeCollection->animeMap->id,
                'title' => $tmdbData['title'] ?? $tmdbData['name'] ?? null,
                'poster_path' => $tmdbData['poster_path'] ?? null,
                'release_date' => $releaseDate,
                'rating' => $userAnimeCollection->rating,
                'watch_status' => $userAnimeCollection->watch_status->value,
                'added_at' => $userAnimeCollection->created_at->format('j F, Y'),
                'total_episodes' => $episodeStats['total_episodes'],
                'watched_episodes' => $episodeStats['watched_episodes'],
                'total_seasons' => $seasonStats['total_seasons'],
                'user_total_seasons' => $seasonStats['user_total_seasons'],
                'tmdb_type' => $userAnimeCollection->animeMap->tmdb_type,
                'collection_name' => $userAnimeCollection->animeMap->collection_name,
                'genres' => collect($tmdbData['genres'] ?? [])->map(function ($genre) {
                    return [
                        'id' => $genre['id'],
                        'name' => $genre['name']
                    ];
                })->values()->all(),
                'seasons' => $seasons,
            ];
        })->values()->all();
    }

    private function calculateEpisodeStatsForAnime($userAnime): array
    {
        // Get total episodes from episode mappings (excluding specials)
        $totalEpisodes = AnimeEpisodeMapping::query()
            ->where('anidb_id', $userAnime->anidb_id)
            ->where('is_special', false)
            ->count();

        // Get watched episodes count
        $watchedEpisodes = UserAnimeEpisode::query()
            ->where('user_anime_id', $userAnime->id)
            ->where('watch_status', WatchStatus::COMPLETED)
            ->whereExists(function ($query) use ($userAnime) {
                $query->select(DB::raw(1))
                    ->from('anime_episode_mappings')
                    ->whereColumn('anime_episode_mappings.tvdb_episode_id', 'user_anime_episodes.episode_id')
                    ->where('anime_episode_mappings.is_special', false)
                    ->where('anime_episode_mappings.anidb_id', $userAnime->anidb_id);
            })
            ->count();

        return [
            'total_episodes' => $totalEpisodes,
            'watched_episodes' => $watchedEpisodes
        ];
    }
}
