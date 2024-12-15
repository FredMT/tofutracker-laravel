<?php

namespace App\Actions\Anime;

use App\Actions\Anime\GetMostCommonTmdbId;
use App\Models\AnimeMappingExternalId;
use App\Models\AnimeChainEntry;
use App\Models\AnimePrequelSequelChain;
use App\Models\AnimeRelatedEntry;
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
                    $tmdbData['data']['recommendations'] = $this->transformRecommendations($tmdbData['data']['recommendations']['results'] ?? [], $type);
                    return response()->json($tmdbData);
                } elseif ($type === 'tv') {
                    $tmdbData = $this->tmdbService->getTvAnime($tmdbId);
                    $tmdbData['data']['recommendations'] = $this->transformRecommendations($tmdbData['data']['recommendations']['results'] ?? [], $type);
                    return response()->json($tmdbData);
                }
            }

            return response()->json(['error' => 'TMDb ID or type not found']);
        });
    }

    private function transformRecommendations(array $recommendations, string $type): array
    {
        if (empty($recommendations)) {
            return [];
        }

        return collect($recommendations)
            ->map(function ($recommendation) use ($type) {
                $mappingExternalId = AnimeMappingExternalId::where('themoviedb_id', $recommendation['id'])->first();

                if (!$mappingExternalId) {
                    return null;
                }

                // Try to find map_id through chain entries
                $chainEntry = AnimeChainEntry::where('anime_id', $mappingExternalId->anidb_id)->first();
                if ($chainEntry) {
                    $chain = AnimePrequelSequelChain::find($chainEntry->chain_id);
                    if ($chain) {
                        return $this->formatRecommendation($recommendation, $chain->map_id, $type);
                    }
                }

                // If not found in chain entries, try related entries
                $relatedEntry = AnimeRelatedEntry::where('anime_id', $mappingExternalId->anidb_id)->first();
                if ($relatedEntry) {
                    return $this->formatRecommendation($recommendation, $relatedEntry->map_id, $type);
                }

                return null;
            })
            ->filter()
            ->values()
            ->toArray();
    }

    private function formatRecommendation(array $recommendation, int $mapId, string $type): array
    {
        return [
            'map_id' => $mapId,
            'poster_path' => $recommendation['poster_path'],
            'vote_average' => $recommendation['vote_average'],
            'collection_name' => $type === 'movie' ? $recommendation['title'] : $recommendation['name']
        ];
    }
}
