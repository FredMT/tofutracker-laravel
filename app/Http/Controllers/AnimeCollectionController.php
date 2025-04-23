<?php

namespace App\Http\Controllers;

use App\Actions\Controller\Anime\AnimeCollectionAction;
use App\Http\Requests\AnimeCollectionIndexRequest;
use App\Repositories\Anime\AnimeCollectionRepository;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Inertia\Inertia;
use Inertia\Response;

class AnimeCollectionController extends Controller
{
    public function __construct(
        private AnimeCollectionAction $action,
        private AnimeCollectionRepository $repository
    ) {}

    /**
     * Return a paginated list of anime collections with their chains and related entries.
     */
    public function index(AnimeCollectionIndexRequest $request): AnonymousResourceCollection|JsonResponse|Response
    {
        try {
            $params = $request->validatedWithDefaults();

            $collections = $this->action->getPaginatedCollections($params);

            return Inertia::render('AnimeCollection', [
                'collections' => $this->action->formatPaginatedResponse($collections),
            ]);
        } catch (\Exception $e) {
            logger()->error('Error fetching anime collections', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);

            return response()->json([
                'error' => 'An error occurred while fetching anime collections',
            ], 500);
        }
    }
}
