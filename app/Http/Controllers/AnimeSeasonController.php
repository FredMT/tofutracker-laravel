<?php

namespace App\Http\Controllers;

use App\Actions\Controller\Anime\AnimeSeasonControllerAction;
use App\Http\Controllers\Comment\CommentController;
use App\Repositories\Anime\AnimeSeasonControllerRepository;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AnimeSeasonController extends Controller
{
    public function __construct(
        private AnimeSeasonControllerAction $action,
        private AnimeSeasonControllerRepository $repository,
        private CommentController $commentController
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
            $comments = $this->commentController->index($request, 'animeseason', $seasonId);

            $user = Auth::user();

            $configuration = $user?->configuration()->first() ?? (object) [
                'hide_episode_description' => false,
                'hide_character_name' => false,
                'hide_anime_character_picture' => false,
            ];

            return Inertia::render('AnimeSeasonContent', [
                'data' => $processedData,
                'user_library' => $userContent['library'],
                'user_lists' => $userContent['lists'],
                'type' => 'animeseason',
                'links' => $links,
                'comments' => $comments,
                'configuration' => $configuration,
            ]);
        } catch (ModelNotFoundException $e) {
            abort(404, 'Anime not found');
        } catch (\Exception $e) {
            logger()->error($e);
            abort(500, 'An error occurred while fetching anime data');
        }
    }
}
