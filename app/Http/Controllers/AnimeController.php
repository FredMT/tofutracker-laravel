<?php

namespace App\Http\Controllers;

use App\Actions\Controller\Anime\AnimeControllerAction;
use App\Repositories\Anime\AnimeControllerRepository;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AnimeController extends Controller
{
    public function __construct(
        private AnimeControllerAction $action,
        private AnimeControllerRepository $repository
    ) {}

    public function show(Request $request, $accessId): Response
    {
        try {
            // Get anime data
            $animeData = $this->action->getAnimeData($accessId);

            // Get first chain entry
            $firstChainEntry = $this->action->getFirstChainEntry($animeData['anidbData']['prequel_sequel_chains'] ?? []);

            // Get comments
            $comments = $this->action->getComments(
                $animeData['type'],
                $animeData['type'] === 'animetv' ? $accessId : $firstChainEntry['id'],
                $request
            );

            // Get user content
            $userContent = $this->action->getUserContent($accessId);

            // Prepare and return response
            return Inertia::render(
                'AnimeContent',
                [
                    'type' => $animeData['type'],
                    'data' => [
                        'tmdbData' => json_decode($animeData['tmdbData']->getContent(), true),
                        'anidbData' => $animeData['anidbData'],
                        'collection_name' => $animeData['collectionName'],
                        'map_id' => $firstChainEntry ? $firstChainEntry['map_id'] : $animeData['animeMap']->id,
                        'anidb_id' => $firstChainEntry ? $firstChainEntry['id'] : null,
                        'trailer' => $animeData['animeMap']->trailer,
                    ],
                    'user_library' => $userContent['library'],
                    'user_lists' => $userContent['lists'],
                    'comments' => $comments,
                ]
            );
        } catch (ModelNotFoundException $e) {
            abort(400, 'Could not find this anime');
        } catch (\JsonException $e) {
            abort(500, 'Problem on our end finding this anime');
        } catch (\Exception $e) {
            logger()->error('Error processing anime data', [
                'error' => $e->getMessage(),
            ]);
            abort(500, 'Problem on our end finding this anime');
        }
    }
}
