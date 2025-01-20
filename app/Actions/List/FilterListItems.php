<?php

namespace App\Actions\List;

use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;

class FilterListItems
{
    public function execute(array $items, array $filters): array
    {
        if (empty($filters)) {
            return $items;
        }

        $items = collect($items);

        if (isset($filters['search'])) {
            $items = $this->applySearchFilter($items, $filters['search']);
        }

        if (isset($filters['genre'])) {
            $items = $this->applyGenreFilter($items, $filters['genre']);
        }

        if (isset($filters['rating'])) {
            $items = $this->applyRatingFilter($items, $filters['rating']);
        }

        if (isset($filters['released'])) {
            $items = $this->applyReleasedFilter($items, $filters['released']);
        }

        return $items->values()->all();
    }

    private function normalizeText(string $text): string
    {
        return Str::lower(
            preg_replace('/[^a-zA-Z0-9\s]/', '',
                str_replace('-', ' ', $text)
            )
        );
    }

    private function applySearchFilter(Collection $items, ?string $search): Collection
    {
        if (! $search) {
            return $items;
        }

        $searchTerms = collect(explode(' ', $this->normalizeText($search)))
            ->filter();

        return $items->filter(function ($item) use ($searchTerms) {
            $normalizedTitle = $this->normalizeText($item['title']);
            $normalizedYear = $item['year'] ? $this->normalizeText($item['year']) : '';

            return $searchTerms->some(function ($term) use ($normalizedTitle, $normalizedYear) {
                return Str::contains($normalizedTitle, $term) ||
                       Str::contains($normalizedYear, $term);
            });
        });
    }

    private function applyGenreFilter(Collection $items, ?string $genreId): Collection
    {
        if (! $genreId || $genreId === 'any') {
            return $items;
        }

        return $items->filter(function ($item) use ($genreId) {
            return collect($item['genres'])->contains('id', (int) $genreId);
        });
    }

    private function applyRatingFilter(Collection $items, ?string $minRating): Collection
    {
        if (! $minRating || $minRating === 'any') {
            return $items;
        }

        $minRatingValue = (float) $minRating;

        return $items->filter(function ($item) use ($minRatingValue) {
            return isset($item['vote_average']) &&
                   $item['vote_average'] !== null &&
                   $item['vote_average'] >= $minRatingValue;
        });
    }

    private function applyReleasedFilter(Collection $items, string $released): Collection
    {
        if ($released === 'any') {
            return $items;
        }

        $now = Carbon::now();

        // Handle relative time periods (1y, 5y)
        if (Str::endsWith($released, 'y')) {
            $years = (int) Str::before($released, 'y');
            $startDate = $now->copy()->subYears($years)->startOfYear();

            return $items->filter(function ($item) use ($startDate) {
                return $this->isYearInRange($item['year'], $startDate->year, Carbon::now()->year);
            });
        }

        // Handle decades (2020s, 2010s, etc.)
        if (Str::endsWith($released, 's')) {
            $decadeStart = (int) Str::before($released, 's');
            $decadeEnd = $decadeStart + 9;

            return $items->filter(function ($item) use ($decadeStart, $decadeEnd) {
                return $this->isYearInRange($item['year'], $decadeStart, $decadeEnd);
            });
        }

        // Handle specific years
        $year = (int) $released;

        return $items->filter(function ($item) use ($year) {
            return $this->isYearInRange($item['year'], $year, $year);
        });
    }

    private function isYearInRange(?string $yearString, int $startYear, int $endYear): bool
    {
        if (! $yearString) {
            return false;
        }

        // Handle single year
        if (is_numeric($yearString)) {
            $year = (int) $yearString;

            return $year >= $startYear && $year <= $endYear;
        }

        // Handle year ranges (e.g., "2020 - 2024" or "2020 - Now")
        if (Str::contains($yearString, '-')) {
            [$rangeStart, $rangeEnd] = array_map('trim', explode('-', $yearString));

            $rangeStartYear = (int) $rangeStart;
            $rangeEndYear = Str::lower($rangeEnd) === 'now'
                ? Carbon::now()->year
                : (int) $rangeEnd;

            // Check if any year in the range overlaps with the target range
            return ! ($rangeEndYear < $startYear || $rangeStartYear > $endYear);
        }

        return false;
    }
}
