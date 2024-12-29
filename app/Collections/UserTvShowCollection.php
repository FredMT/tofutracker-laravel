<?php

namespace App\Collections;

use App\Enums\WatchStatus;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;
use DateTime;
use Carbon\Carbon;

class UserTvShowCollection extends Collection
{
    public function filterByGenres(string|array|null $genres): self
    {
        if (empty($genres)) {
            return $this;
        }

        $genreIds = is_string($genres)
            ? explode(',', $genres)
            : (array) $genres;

        return $this->filter(function ($userTvShow) use ($genreIds) {
            $showGenres = collect($userTvShow->show->data['genres'] ?? [])
                ->pluck('id')
                ->toArray();

            return !empty(array_intersect($genreIds, $showGenres));
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

        return $this->filter(function ($userTvShow) use ($searchTerms) {
            $showTitle = $userTvShow->show->data['name'] ?? '';

            return collect($searchTerms)->every(function ($term) use ($showTitle) {
                return Str::contains(Str::lower($showTitle), Str::lower($term));
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
            return $this->filter(function ($userTvShow) use ($from) {
                $createdAt = new DateTime($userTvShow->created_at);
                return $createdAt->format('Y-m-d') === $from->format('Y-m-d');
            });
        }

        // Filter for date range
        return $this->filter(function ($userTvShow) use ($from, $to) {
            $createdAt = new DateTime($userTvShow->created_at);
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
        return $this->map(function ($userTvShow) {
            $firstAirDate = isset($userTvShow->show->data['first_air_date'])
                ? Carbon::parse($userTvShow->show->data['first_air_date'])->year
                : null;

            // Load the seasons relationship if it hasn't been loaded
            if (!$userTvShow->relationLoaded('seasons')) {
                $userTvShow->load([
                    'seasons' => function ($query) {
                        $query->with(['season', 'episodes.episode']);
                    }
                ]);
            }

            // Get total seasons count from show (excluding season 0)
            $totalSeasons = $userTvShow->show->seasons()
                ->where('season_number', '>', 0)
                ->count();

            // Get user's total seasons count (excluding season 0)
            $userTotalSeasons = $userTvShow->seasons()
                ->whereHas('season', function ($query) {
                    $query->where('season_number', '>', 0);
                })
                ->count();

            // Transform seasons data
            $seasons = $userTvShow->seasons->map(function ($userSeason) {
                $airDate = isset($userSeason->season->data['air_date'])
                    ? Carbon::parse($userSeason->season->data['air_date'])->year
                    : null;

                // Count total episodes in the season
                $totalEpisodes = $userSeason->season->episodes->count();

                // Count watched episodes (episodes with COMPLETED status)
                $watchedEpisodes = $userSeason->episodes
                    ->where('watch_status', WatchStatus::COMPLETED)
                    ->count();

                return [
                    'id' => $userSeason->season->id,
                    'title' => $userSeason->season->data['name'] ?? null,
                    'poster_path' => $userSeason->season->data['poster_path'] ?? null,
                    'release_date' => $airDate,
                    'rating' => $userSeason->rating,
                    'watch_status' => $userSeason->watch_status->value,
                    'added_at' => $userSeason->created_at->format('j F, Y'),
                    'season_number' => $userSeason->season->season_number,
                    'watched_episodes' => $watchedEpisodes,
                    'total_episodes' => $totalEpisodes,
                ];
            })->sortBy('season_number')->values();

            return [
                'id' => $userTvShow->show->id,
                'title' => $userTvShow->show->data['name'] ?? null,
                'poster_path' => $userTvShow->show->data['poster_path'] ?? null,
                'release_date' => $firstAirDate,
                'rating' => $userTvShow->rating,
                'watch_status' => $userTvShow->watch_status,
                'added_at' => $userTvShow->created_at->format('j F, Y'),
                'seasons' => $seasons,
                'total_seasons' => $totalSeasons,
                'user_total_seasons' => $userTotalSeasons,
            ];
        })->values()->all();
    }
}
