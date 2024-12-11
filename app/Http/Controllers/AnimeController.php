<?php

namespace App\Http\Controllers;

use App\Services\AnimeRelationshipService;
use Illuminate\Http\JsonResponse;

class AnimeController extends Controller
{
    public function getRelatedAnime(
        int $id,
        AnimeRelationshipService $relationshipService
    ): JsonResponse {
        return response()->json($relationshipService->getRelatedAnimeIds($id));
    }
}
