<?php

namespace App\Http\Controllers;

use App\Actions\Anime\GetAnidbData;
use App\Actions\Anime\GetAnimeTypeAction;
use App\Actions\Anime\GetTmdbData;
use App\Models\AnimeMap;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

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


    public function show($accessId): Response
    {
        try {
            $animeMap = AnimeMap::where('id', $accessId)->firstOrFail();
            $tmdbData = $this->getTmdbData->execute($accessId);
            $anidbData = $this->getAnidbData->execute($animeMap);

            $collectionName = $animeMap->collection_name ?? json_decode($tmdbData->getContent(), true)['data']['title'];
            $type = $this->getAnimeType->execute($accessId);

            return Inertia::render('AnimeContent', [
                'type' => $type,
                $type => [
                    'tmdbData' => json_decode($tmdbData->getContent(), true),
                    'anidbData' => $anidbData,
                    'collection_name' => $collectionName,
                ],
                'user_library' => null
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
