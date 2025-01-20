<?php

namespace App\Actions\List;

class SortListItems
{
    private function extractYear(string $yearString): int
    {
        if (empty($yearString)) {
            return 0;
        }

        if (preg_match('/^(\d{4})/', $yearString, $matches)) {
            return (int) $matches[1];
        }

        return 0;
    }

    public function execute(array $items, string $sortBy = 'sort_order', string $direction = 'asc'): array
    {
        if (empty($items)) {
            return $items;
        }

        $sortedItems = collect($items)->sortBy(function ($item) use ($sortBy) {
            return match($sortBy) {
                'rating' => $item['vote_average'] ?? 0,
                'alphabetical' => strtolower($item['title']),
                'date_added' => $item['created_at'],
                'updated_at' => $item['updated_at'],
                'year' => $this->extractYear($item['year']),
                default => $item['sort_order']
            };
        }, SORT_REGULAR, $direction === 'desc');

        return $sortedItems->values()->all();
    }
} 