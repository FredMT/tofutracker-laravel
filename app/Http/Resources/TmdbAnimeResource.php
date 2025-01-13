<?php

namespace App\Http\Resources;

use App\Models\AnimeChainEntry;
use App\Models\AnimeMappingExternalId;
use App\Models\AnimePrequelSequelChain;
use App\Models\AnimeRelatedEntry;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TmdbAnimeResource extends JsonResource
{
    private string $type;

    public function __construct($resource, string $type = 'movie')
    {
        parent::__construct($resource);
        $this->type = $type;
    }

    public function toArray(Request $request): array
    {
        return [
            'data' => [
                'id' => $this->resource['id'],
                'title' => $this->type === 'movie' ? $this->resource['title'] : $this->resource['name'],
                'overview' => $this->resource['overview'],
                'poster_path' => $this->resource['poster_path'],
                'backdrop_path' => $this->resource['backdrop_path'],
                'logo_path' => $this->extractLogoPath(),
                'content_rating' => $this->extractContentRating(),
                'release_date' => $this->type === 'movie'
                    ? $this->resource['release_date']
                    : $this->resource['first_air_date'],
                'vote_average' => $this->resource['vote_average'],
                'vote_count' => $this->resource['vote_count'],
                'recommendations' => $this->transformRecommendations(),
                'videos' => $this->when(
                    isset($this->resource['videos']),
                    fn () => $this->resource['videos']['results'] ?? []
                ),
            ],
        ];
    }

    private function transformRecommendations(): array
    {
        if (! isset($this->resource['recommendations']['results'])) {
            return [];
        }

        return collect($this->resource['recommendations']['results'])
            ->map(function ($recommendation) {
                // Find the AniDB ID from TMDB ID
                $mappingExternalId = AnimeMappingExternalId::where('themoviedb_id', $recommendation['id'])->first();

                if (! $mappingExternalId) {
                    return null;
                }

                // Try to find map_id through chain entries
                $chainEntry = AnimeChainEntry::where('anime_id', $mappingExternalId->anidb_id)->first();
                if ($chainEntry) {
                    $chain = AnimePrequelSequelChain::find($chainEntry->chain_id);
                    if ($chain) {
                        return $this->formatRecommendation($recommendation, $chain->map_id);
                    }
                }

                // If not found in chain entries, try related entries
                $relatedEntry = AnimeRelatedEntry::where('anime_id', $mappingExternalId->anidb_id)->first();
                if ($relatedEntry) {
                    return $this->formatRecommendation($recommendation, $relatedEntry->map_id);
                }

                return null;
            })
            ->filter()
            ->values()
            ->toArray();
    }

    private function formatRecommendation(array $recommendation, int $mapId): array
    {
        return [
            'map_id' => $mapId,
            'poster_path' => $recommendation['poster_path'],
            'vote_average' => $recommendation['vote_average'],
            'collection_name' => $this->type === 'movie' ? $recommendation['title'] : $recommendation['name'],
        ];
    }

    /**
     * Extract the highest voted logo path from images.
     */
    private function extractLogoPath(): ?string
    {
        if (! isset($this->resource['images']['logos'])) {
            return null;
        }

        return collect($this->resource['images']['logos'])
            ->sortByDesc('vote_count')
            ->first()['file_path'] ?? null;
    }

    /**
     * Extract content rating based on type (movie/tv).
     */
    private function extractContentRating(): ?string
    {
        if ($this->type === 'movie') {
            $usCertification = collect($this->resource['release_dates']['results'])
                ->firstWhere('iso_3166_1', 'US');

            return $usCertification['release_dates'][0]['certification'] ?? null;
        }

        $usRating = collect($this->resource['content_ratings']['results'])
            ->firstWhere('iso_3166_1', 'US');

        return $usRating['rating'] ?? null;
    }
}
