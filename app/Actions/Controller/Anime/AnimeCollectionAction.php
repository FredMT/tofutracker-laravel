<?php

namespace App\Actions\Controller\Anime;

use App\Http\Resources\AnimeCollectionResource;
use App\Repositories\Anime\AnimeCollectionRepository;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AnimeCollectionAction
{
    /**
     * @param AnimeCollectionRepository $repository
     */
    public function __construct(
        private AnimeCollectionRepository $repository
    ) {}

    /**
     * Get paginated anime collections with optional filtering and sorting.
     *
     * @param array $params Validated params from the request
     * @return LengthAwarePaginator
     */
    public function getPaginatedCollections(array $params): LengthAwarePaginator
    {
        return $this->repository->getPaginatedCollections($params);
    }

    /**
     * Format the paginated collections response using the resource.
     *
     * @param LengthAwarePaginator $collections
     * @return AnonymousResourceCollection
     */
    public function formatPaginatedResponse(LengthAwarePaginator $collections): AnonymousResourceCollection
    {
        return AnimeCollectionResource::collection($collections);
    }
}
