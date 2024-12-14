<?php

namespace App\Actions\Anime;

use App\Actions\Anime\GetMostCommonTmdbId;
use App\Services\TmdbService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class GetTmdbData
{
    private TmdbService $tmdbService;
    private GetMostCommonTmdbId $getMostCommonTmdbId;

    public function __construct(
        TmdbService $tmdbService,
        GetMostCommonTmdbId $getMostCommonTmdbId
    ) {
        $this->tmdbService = $tmdbService;
        $this->getMostCommonTmdbId = $getMostCommonTmdbId;
    }

    public function execute($accessId): JsonResponse
    {
        return Cache::remember('tmdb_data_' . $accessId, now()->addMonth(), function () use ($accessId) {
            $result = $this->getMostCommonTmdbId->execute($accessId);

            if (isset($result['most_common_tmdb_id']) && isset($result['tmdb_type'])) {
                $tmdbId = $result['most_common_tmdb_id'];
                $type = $result['tmdb_type'];

                if ($type === 'movie') {
                    $tmdbData = $this->tmdbService->getMovieAnime($tmdbId);
                    return response()->json($tmdbData);
                } elseif ($type === 'tv') {
                    $tmdbData = $this->tmdbService->getTvAnime($tmdbId);
                    return response()->json($tmdbData);
                }
            }

            return response()->json(['error' => 'TMDb ID or type not found']);
        });
    }
}
