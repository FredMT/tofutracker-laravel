<?php

namespace App\Http\Controllers;

use App\Actions\Controller\Anime\AnimeSeasonControllerAction;
use App\Http\Controllers\Comment\CommentController;
use App\Repositories\Anime\AnimeSeasonControllerRepository;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnimeSeasonController extends Controller
{
    public function __construct(
        private AnimeSeasonControllerAction     $action,
        private AnimeSeasonControllerRepository $repository,
        private CommentController               $commentController
    ) {
        $this->action = $action;
        $this->repository = $repository;
        $this->commentController = $commentController;
    }

    public function show(Request $request, $accessId, $seasonId): Response
    {
        try {
            $this->action->validateSeasonAccess($accessId, $seasonId);

            $anime = $this->repository->getAnimeWithRelations($seasonId);
            $processedData = $this->action->processAnimeData($anime, $seasonId);
            $userContent = $this->action->getUserContent($request, $seasonId);
            $links = $this->action->generateNavigationLinks($accessId, $seasonId);
            $comments = $this->commentController->index('animeseason', $seasonId);

            return Inertia::render('AnimeSeasonContent', [
                'data' => $processedData,
                'user_library' => $userContent['library'],
                'user_lists' => $userContent['lists'],
                'type' => 'animeseason',
                'links' => $links,
                'comments' => $comments,
            ]);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Anime not found');
        } catch (\Exception $e) {
            \Sentry\captureException($e);
            abort(500, 'An error occurred while fetching anime data');
        }
    }
}
