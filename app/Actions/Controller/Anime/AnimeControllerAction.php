<?php

namespace App\Actions\Controller\Anime;

use App\Actions\Anime\GetAnidbData;
use App\Actions\Anime\GetAnimeTypeAction;
use App\Actions\Anime\GetTmdbData;
use App\Http\Controllers\Comment\CommentController;
use App\Repositories\Anime\AnimeControllerRepository;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class AnimeControllerAction
{
    public function __construct(
        private GetTmdbData $getTmdbData,
        private GetAnidbData $getAnidbData,
        private GetAnimeTypeAction $getAnimeType,
        private CommentController $commentController,
        private AnimeControllerRepository $repository
    ) {}

    public function getAnimeData(int $accessId): array
    {
        $animeMap = $this->repository->getAnimeMap($accessId);
        $tmdbData = $this->getTmdbData->execute($accessId);
        $anidbData = $this->getAnidbData->execute($animeMap);

        return [
            'animeMap' => $animeMap,
            'tmdbData' => $tmdbData,
            'anidbData' => $anidbData,
            'type' => $this->getAnimeType->execute($accessId),
            'collectionName' => $animeMap->collection_name ?? json_decode($tmdbData->getContent(), true)['data']['title'],
        ];
    }

    public function getFirstChainEntry(array $prequelSequelChains): ?array
    {
        return $this->repository->getFirstChainEntry($prequelSequelChains);
    }

    public function getComments(string $type, int $commentId, Request $request): array
    {
        return $this->commentController->index($request, $type, $commentId);
    }

    public function getUserContent(int $accessId): array
    {
        if (! Auth::check()) {
            return [
                'library' => null,
                'lists' => null,
            ];
        }

        return [
            'library' => $this->processUserLibrary($accessId),
            'lists' => $this->repository->getUserLists($accessId),
        ];
    }

    private function processUserLibrary(int $accessId): ?array
    {
        $userAnimeCollection = $this->repository->getUserAnimeCollection($accessId);
        if (! $userAnimeCollection) {
            return null;
        }

        return [
            'collection' => [
                'id' => $userAnimeCollection->id,
                'user_library_id' => $userAnimeCollection->user_library_id,
                'map_id' => $userAnimeCollection->map_id,
                'rating' => $userAnimeCollection->rating,
                'watch_status' => $userAnimeCollection->watch_status,
            ],
            'anime' => $userAnimeCollection->anime->map(function ($anime) {
                return [
                    'id' => $anime->id,
                    'anidb_id' => $anime->anidb_id,
                    'is_movie' => $anime->is_movie,
                    'rating' => $anime->rating,
                    'watch_status' => $anime->watch_status,
                ];
            })->toArray(),
        ];
    }
}
