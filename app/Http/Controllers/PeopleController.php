<?php

namespace App\Http\Controllers;

use App\Services\TmdbService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class PeopleController extends Controller
{
    protected TmdbService $tmdbService;

    public function __construct(TmdbService $tmdbService)
    {
        $this->tmdbService = $tmdbService;
    }

    public function show(string $id)
    {
        $personData = Cache::remember(
            "person_details_{$id}",
            seconds_until('next sunday at 8 am'),
            function () use ($id) {
                $jsonData = json_encode($this->tmdbService->getPersonDetails($id));

                return Collection::fromJson($jsonData);
            }
        );

        $movieCredits = $personData['movie_credits'] ?? [];
        $tvCredits = $personData['tv_credits'] ?? [];

        return Inertia::render('Person', [
            'person' => $personData->only([
                'id', 'name', 'profile_path', 'biography', 'birthday',
                'place_of_birth', 'gender', 'known_for_department',
            ])->toArray(),
            'external_ids' => $personData['external_ids'] ?? [],
            'credits' => [
                'movie_cast' => array_values($this->processMovieCast($movieCredits['cast'] ?? [])),
                'movie_crew' => array_values($this->processMovieCrew($movieCredits['crew'] ?? [])),
                'tv_cast' => array_values($this->processTvCast($tvCredits['cast'] ?? [])),
                'tv_crew' => array_values($this->processTvCrew($tvCredits['crew'] ?? [])),
            ],
        ]);
    }

    private function processMovieCast(array $castData): array
    {
        $today = now()->format('Y-m-d');
        $nextYear = now()->addYear()->format('Y-m-d');

        return collect($castData)
            ->map(function ($item) use ($today, $nextYear) {
                $releaseDate = $item['release_date'] ?? null;

                return [
                    'backdrop_path' => $item['backdrop_path'] ?? null,
                    'character' => $item['character'] ?? '',
                    'id' => $item['id'] ?? null,
                    'poster_path' => $item['poster_path'] ?? null,
                    'year' => isset($releaseDate) ? substr($releaseDate, 0, 4) : null,
                    'title' => $item['title'] ?? '',
                    'popularity' => $item['popularity'] ?? 0,
                    'rating' => isset($item['vote_average']) ? round($item['vote_average'] * 10) / 10 : null,
                    'vote_count' => $item['vote_count'] ?? 0,
                    'release_date' => $releaseDate,
                    'priority' => $this->calculatePriority($releaseDate, $today, $nextYear),
                ];
            })
            ->groupBy('id')
            ->map(function ($group) {
                $first = $group->first();
                $first['character'] = $group->pluck('character')->filter()->unique()->implode(', ');

                return $first;
            })
            ->values()
            ->sortByDesc(function ($item) {
                // Sort first by priority, then by popularity
                return ($item['priority'] * 1000) + min(999, $item['popularity']);
            })
            ->map(function ($item) {
                unset($item['release_date']);

                return $item;
            })
            ->toArray();
    }

    private function processMovieCrew(array $crewData): array
    {
        $today = now()->format('Y-m-d');
        $nextYear = now()->addYear()->format('Y-m-d');

        return collect($crewData)
            ->map(function ($item) use ($today, $nextYear) {
                $releaseDate = $item['release_date'] ?? null;

                return [
                    'backdrop_path' => $item['backdrop_path'] ?? null,
                    'department' => $item['department'] ?? '',
                    'job' => $item['job'] ?? '',
                    'id' => $item['id'] ?? null,
                    'poster_path' => $item['poster_path'] ?? null,
                    'year' => isset($releaseDate) ? substr($releaseDate, 0, 4) : null,
                    'title' => $item['title'] ?? '',
                    'popularity' => $item['popularity'] ?? 0,
                    'rating' => isset($item['vote_average']) ? round($item['vote_average'] * 10) / 10 : null,
                    'vote_count' => $item['vote_count'] ?? 0,
                    'release_date' => $releaseDate,
                    'priority' => $this->calculatePriority($releaseDate, $today, $nextYear),
                ];
            })
            ->groupBy('id')
            ->map(function ($group) {
                $first = $group->first();
                $jobInfo = $group->map(function ($item) {
                    return $item['department'].': '.$item['job'];
                })->unique()->implode(', ');
                $first['department'] = $jobInfo;

                return $first;
            })
            ->values()
            ->sortByDesc(function ($item) {
                // Sort first by priority, then by popularity
                return ($item['priority'] * 1000) + min(999, $item['popularity']);
            })
            ->map(function ($item) {
                // Keep priority and release_date for debugging
                unset($item['release_date']);

                return $item;
            })
            ->toArray();
    }

    private function processTvCast(array $castData): array
    {
        $today = now()->format('Y-m-d');
        $nextYear = now()->addYear()->format('Y-m-d');

        return collect($castData)
            ->map(function ($item) use ($today, $nextYear) {
                $firstAirDate = $item['first_air_date'] ?? null;

                return [
                    'backdrop_path' => $item['backdrop_path'] ?? null,
                    'character' => $item['character'] ?? '',
                    'id' => $item['id'] ?? null,
                    'poster_path' => $item['poster_path'] ?? null,
                    'year' => isset($firstAirDate) ? substr($firstAirDate, 0, 4) : null,
                    'title' => $item['name'] ?? '',
                    'popularity' => $item['popularity'] ?? 0,
                    'rating' => isset($item['vote_average']) ? round($item['vote_average'] * 10) / 10 : null,
                    'vote_count' => $item['vote_count'] ?? 0,
                    'release_date' => $firstAirDate,
                    'priority' => $this->calculatePriority($firstAirDate, $today, $nextYear),
                ];
            })
            ->groupBy('id')
            ->map(function ($group) {
                $first = $group->first();
                $first['character'] = $group->pluck('character')->filter()->unique()->implode(', ');

                return $first;
            })
            ->values()
            ->sortByDesc(function ($item) {
                // Sort first by priority, then by popularity
                return ($item['priority'] * 1000) + min(999, $item['popularity']);
            })
            ->map(function ($item) {
                // Keep priority and release_date for debugging
                unset($item['release_date']);

                return $item;
            })
            ->toArray();
    }

    private function processTvCrew(array $crewData): array
    {
        $today = now()->format('Y-m-d');
        $nextYear = now()->addYear()->format('Y-m-d');

        return collect($crewData)
            ->map(function ($item) use ($today, $nextYear) {
                $firstAirDate = $item['first_air_date'] ?? null;

                return [
                    'backdrop_path' => $item['backdrop_path'] ?? null,
                    'department' => $item['department'] ?? '',
                    'job' => $item['job'] ?? '',
                    'id' => $item['id'] ?? null,
                    'poster_path' => $item['poster_path'] ?? null,
                    'year' => isset($firstAirDate) ? substr($firstAirDate, 0, 4) : null,
                    'title' => $item['name'] ?? '',
                    'popularity' => $item['popularity'] ?? 0,
                    'rating' => isset($item['vote_average']) ? round($item['vote_average'] * 10) / 10 : null,
                    'vote_count' => $item['vote_count'] ?? 0,
                    'release_date' => $firstAirDate,
                    'priority' => $this->calculatePriority($firstAirDate, $today, $nextYear),
                ];
            })
            ->groupBy('id')
            ->map(function ($group) {
                $first = $group->first();
                $jobInfo = $group->map(function ($item) {
                    return $item['department'].': '.$item['job'];
                })->unique()->implode(', ');
                $first['department'] = $jobInfo;

                return $first;
            })
            ->values()
            ->sortByDesc(function ($item) {
                // Sort first by priority, then by popularity
                return ($item['priority'] * 1000) + min(999, $item['popularity']);
            })
            ->map(function ($item) {
                unset($item['release_date']);

                return $item;
            })
            ->toArray();
    }

    private function calculatePriority(?string $releaseDate, string $today, string $nextYear): int
    {
        if (! $releaseDate) {
            return 0; // Lowest priority for items without a date
        }

        // Future releases coming soon (within the next year)
        if ($releaseDate >= $today && $releaseDate <= $nextYear) {
            return 3; // Highest priority
        }

        // Future releases beyond next year
        if ($releaseDate > $nextYear) {
            return 2; // Medium-high priority
        }

        // Recent releases (last 3 months)
        if ($releaseDate >= now()->subMonths(3)->format('Y-m-d') && $releaseDate < $today) {
            return 1; // Medium priority
        }

        return 0; // Low priority for older releases
    }
}
