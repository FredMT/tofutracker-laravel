<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Collection;

class TmdbAnimeResource extends JsonResource
{
    private string $type;
    private ?string $etag;

    public function __construct($resource, string $type, ?string $etag = null)
    {
        parent::__construct($resource);
        $this->type = $type;
        $this->etag = $etag;
    }

    /**
     * Transform the resource into an array.
     */
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
                'recommendations' => $this->when(
                    isset($this->resource['recommendations']),
                    fn() => $this->resource['recommendations']['results'] ?? []
                ),
                'videos' => $this->when(
                    isset($this->resource['videos']),
                    fn() => $this->resource['videos']['results'] ?? []
                ),
            ],
            'etag' => $this->etag,
        ];
    }

    /**
     * Extract the highest voted logo path from images.
     */
    private function extractLogoPath(): ?string
    {
        if (!isset($this->resource['images']['logos'])) {
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
