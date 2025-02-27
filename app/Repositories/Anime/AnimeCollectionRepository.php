<?php

namespace App\Repositories\Anime;

use App\Models\Anime\AnimeMap;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnimeCollectionRepository
{
    /**
     * Get paginated anime collections with optional filtering and sorting.
     *
     * @param array $params
     * @return LengthAwarePaginator
     */
    public function getPaginatedCollections(array $params): LengthAwarePaginator
    {
        $perPage = $params['per_page'] ?? 100;
        $sortField = $params['sort'] ?? 'id';
        $sortDirection = $params['direction'] ?? 'asc';

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
