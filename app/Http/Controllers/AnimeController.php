<?php

namespace App\Http\Controllers;

use App\Actions\Anime\GetAnidbData;
use App\Actions\Anime\GetAnimeTypeAction;
use App\Actions\Anime\GetTmdbData;
use App\Models\AnimeMap;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;

class AnimeController extends Controller
{
    private GetTmdbData $getTmdbData;
    private GetAnidbData $getAnidbData;
    private GetAnimeTypeAction $getAnimeType;

    public function __construct(GetTmdbData $getTmdbData, GetAnidbData $getAnidbData, GetAnimeTypeAction $getAnimeType)
    {
        $this->getTmdbData = $getTmdbData;
        $this->getAnidbData = $getAnidbData;
        $this->getAnimeType = $getAnimeType;
    }


    public function show($accessId): JsonResponse
    {
        try {
            $animeMap = AnimeMap::where('access_id', $accessId)->firstOrFail();
            $tmdbData = $this->getTmdbData->execute($accessId);
            $anidbData = $this->getAnidbData->execute($animeMap);

            $collectionName = $animeMap->collection_name ?? json_decode($tmdbData->getContent(), true)['data']['title'];

            return response()->json([
                'tmdbData' => json_decode($tmdbData->getContent(), true),
                'anidbData' => $anidbData,
                'user_library' => null,
                'collection_name' => $collectionName,
                'type' => $this->getAnimeType->execute($accessId)
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json(['error' => 'Anime not found'], 404);
        } catch (\JsonException $e) {
            return response()->json(['error' => 'Failed to process TMDB data'], 500);
        } catch (\Exception $e) {
            Log::info('Error processing anime data', [
                'error' => $e->getMessage(),
            ]);
            return response()->json(['error' => 'An error occurred while fetching anime data'], 500);
        }
    }
}
