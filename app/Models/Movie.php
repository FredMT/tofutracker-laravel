<?php

namespace App\Models;

use App\Models\Tmdb\Genre;
use App\Models\Tmdb\TmdbContentGenre;
use App\Models\Tmdb\TmdbContentKeyword;
use App\Models\Tmdb\TmdbContentVideo;
use App\Models\Tmdb\TmdbKeyword;
use App\Models\Tmdb\TmdbVideo;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class Movie extends Model
{
    protected $fillable = [
        'id',
        'data',
        'etag',
        'popularity',
        'vote_average',
        'vote_count',
    ];

    public $incrementing = false;

    protected $casts = [
        'data' => 'array',
        'updated_at' => 'datetime',
    ];

    public function poster(): Attribute
    {
        return Attribute::get(function () {
            return $this->data['poster_path'];
        });
    }

    public function overview(): Attribute
    {
        return Attribute::get(function () {
            return $this->data['overview'] ?? null;
        });
    }

    public function backdrop(): Attribute
    {
        return Attribute::get(function () {
            return $this->data['backdrop_path'] ?? null;
        });
    }

    public function releaseDate(): Attribute
    {
        return Attribute::get(function () {
            return $this->data['release_date'];
        });
    }

    public function yearRange(): Attribute
    {
        return Attribute::get(function () {
            $releaseDate = $this->data['release_date'] ?? null;

            if (! $releaseDate) {
                return null;
            }

            $releaseYear = Carbon::parse($releaseDate)->year;

            return $releaseYear;
        });
    }

    public function budget(): Attribute
    {
        return Attribute::get(function () {
            $budget = $this->data['budget'] ?? null;

            return $budget > 0 ? $budget : null;
        });
    }

    public function revenue(): Attribute
    {
        return Attribute::get(function () {
            $revenue = $this->data['revenue'] ?? null;

            return $revenue > 0 ? $revenue : null;
        });
    }

    public function year(): Attribute
    {
        return Attribute::get(function () {
            return isset($this->data['release_date'])
                ? Carbon::parse($this->data['release_date'])->year
                : null;
        });
    }

    public function runtime(): Attribute
    {
        return Attribute::get(function () {
            $runtime = $this->data['runtime'] ?? null;

            return $runtime > 0 ? $runtime : null;
        });
    }

    public function popularity(): Attribute
    {
        return Attribute::get(function () {
            return $this->data['popularity'] ?? null;
        });
    }

    public function productionCompanies(): Attribute
    {
        return Attribute::get(function () {
            return collect($this->data['production_companies'] ?? [])->map(function ($company) {
                return [
                    'id' => $company['id'],
                    'name' => $company['name'],
                    'logo_path' => $company['logo_path'],
                    'origin_country' => $company['origin_country'],
                ];
            })->values();
        });
    }

    public function productionCountries(): Attribute
    {
        return Attribute::get(function () {
            return collect($this->data['production_countries'] ?? [])->map(function ($country) {
                return [
                    'name' => $country['name'],
                    'iso_3166_1' => $country['iso_3166_1'],
                ];
            })->values();
        });
    }

    public function title(): Attribute
    {
        return Attribute::get(function () {
            return $this->data['title'] ?? null;
        });
    }

    public function logos(): Attribute
    {
        return Attribute::get(function () {
            return collect($this->data['images']['logos'] ?? [])->map(function ($logo) {
                return [
                    'file_path' => $logo['file_path'] ?? null,
                    'width' => $logo['width'] ?? null,
                    'height' => $logo['height'] ?? null,
                    'aspect_ratio' => $logo['aspect_ratio'] ?? null,
                    'language' => $logo['iso_639_1'] ?? null,
                    'vote_average' => $logo['vote_average'] ?? null,
                    'vote_count' => $logo['vote_count'] ?? null,
                ];
            })->values();
        });
    }

    public function highestVotedLogoPath(): Attribute
    {
        return Attribute::get(function () {
            return $this->logos
                ->sortByDesc('vote_average')
                ->first()['file_path'] ?? null;
        });
    }

    public function backdrops(): Attribute
    {
        return Attribute::get(function () {
            return collect($this->data['images']['backdrops'] ?? [])
                ->sortByDesc('vote_average')
                ->take(10)
                ->map(function ($backdrop) {
                    return [
                        'file_path' => $backdrop['file_path'],
                        'vote_average' => $backdrop['vote_average'],
                        'width' => $backdrop['width'],
                        'height' => $backdrop['height'],
                    ];
                })
                ->values();
        });
    }

    public function posters(): Attribute
    {
        return Attribute::get(function () {
            return collect($this->data['images']['posters'] ?? [])->map(function ($poster) {
                return [
                    'file_path' => $poster['file_path'] ?? null,
                    'width' => $poster['width'] ?? null,
                    'height' => $poster['height'] ?? null,
                    'aspect_ratio' => $poster['aspect_ratio'] ?? null,
                    'language' => $poster['iso_639_1'] ?? null,
                    'vote_average' => $poster['vote_average'] ?? null,
                    'vote_count' => $poster['vote_count'] ?? null,
                ];
            })->values();
        });
    }

    public function cast(): Attribute
    {
        return Attribute::get(function () {
            return collect($this->data['credits']['cast'] ?? [])
                ->sortBy('order')
                ->take(50)
                ->map(function ($cast) {
                    return [
                        'id' => $cast['id'],
                        'name' => $cast['name'],
                        'character' => $cast['character'],
                        'profile_path' => $cast['profile_path'],
                        'order' => $cast['order'],
                    ];
                })->values();
        });
    }

    public function crew(): Attribute
    {
        return Attribute::get(function () {
            $importantJobs = [
                'Director',
                'Original Story',
                'Writer',
                'Novel',
                'Screenplay',
                'Producer',
            ];

            $crewCollection = collect($this->data['credits']['crew'] ?? []);

            $priorityCrew = $crewCollection
                ->filter(function ($crew) use ($importantJobs) {
                    return in_array($crew['job'], $importantJobs);
                })
                ->sortByDesc('popularity');

            $additionalCrew = $crewCollection
                ->filter(function ($crew) use ($importantJobs) {
                    return ! in_array($crew['job'], $importantJobs);
                })
                ->sortByDesc('popularity')
                ->take(50);

            return $priorityCrew->merge($additionalCrew)
                ->groupBy('id')
                ->map(function ($groupedCrew) {
                    $firstCrew = $groupedCrew->first();

                    return [
                        'id' => $firstCrew['id'],
                        'name' => $firstCrew['name'],
                        'job' => $groupedCrew->pluck('job')->unique()->implode(', '),
                        'profile_path' => $firstCrew['profile_path'],
                        'popularity' => $firstCrew['popularity'],
                    ];
                })
                ->values();
        });
    }

    private function getUSCertification(): ?string
    {
        $releaseDates = $this->data['release_dates']['results'] ?? [];

        // Find US release dates
        $usReleases = collect($releaseDates)
            ->firstWhere('iso_3166_1', 'US');

        if (! $usReleases) {
            return null;
        }

        // Get first non-empty certification
        $certification = collect($usReleases['release_dates'] ?? [])
            ->map(fn ($date) => $date['certification'] ?? '')
            ->filter(fn ($cert) => ! empty($cert))
            ->first();

        return $certification ?: null;
    }

    private function getSimilarMovies(): array
    {
        $similarMovies = $this->data['similar']['results'] ?? [];

        return collect($similarMovies)
            ->filter(function ($movie) {
                return ! empty($movie['poster_path']) &&
                    ! empty($movie['vote_average']) &&
                    ! empty($movie['title']) &&
                    ! empty($movie['release_date']);
            })
            ->map(function ($movie) {
                return [
                    'id' => $movie['id'],
                    'title' => $movie['title'],
                    'poster_path' => $movie['poster_path'],
                    'vote_average' => $movie['vote_average'],
                    'release_date' => $movie['release_date'],
                ];
            })
            ->values()
            ->all();
    }

    private function getRecommendedMovies(): array
    {
        $similarMovies = $this->data['recommendations']['results'] ?? [];

        return collect($similarMovies)
            ->filter(function ($movie) {
                return ! empty($movie['poster_path']) &&
                    ! empty($movie['vote_average']) &&
                    ! empty($movie['title']) &&
                    ! empty($movie['release_date']);
            })
            ->map(function ($movie) {
                return [
                    'id' => $movie['id'],
                    'title' => $movie['title'],
                    'poster_path' => $movie['poster_path'],
                    'vote_average' => $movie['vote_average'],
                    'release_date' => $movie['release_date'],
                ];
            })
            ->values()
            ->all();
    }

    public function filteredData(): Attribute
    {
        return Attribute::get(function () {
            $data = $this->data;

            // Convert empty string to null for overview
            if (isset($data['overview']) && $data['overview'] === '') {
                $data['overview'] = null;
            }

            // Convert zero values to null for numeric fields
            $numericFields = ['budget', 'revenue', 'runtime', 'vote_average'];
            foreach ($numericFields as $field) {
                if (isset($data[$field]) && (int) $data[$field] === 0) {
                    $data[$field] = null;
                }
            }

            return [
                'id' => $data['id'],
                'title' => $data['title'],
                'original_title' => $data['original_title'],
                'original_language' => $data['original_language'],
                'overview' => $data['overview'],
                'poster_path' => $data['poster_path'],
                'backdrop_path' => $data['backdrop_path'],
                'logo_path' => $this->highestVotedLogoPath,
                'release_date' => isset($data['release_date'])
                    ? Carbon::parse($data['release_date'])->format('F j, Y')
                    : null,
                'year' => isset($data['release_date'])
                    ? Carbon::parse($data['release_date'])->year
                    : null,
                'runtime' => isset($data['runtime']) ? (function () use ($data) {
                    $minutes = $data['runtime'];
                    $hours = intdiv($minutes, 60);
                    $remainingMinutes = $minutes % 60;

                    return $hours > 0
                        ? "{$hours}h {$remainingMinutes}m"
                        : "{$minutes}m";
                })() : null,
                'status' => $data['status'],
                'tagline' => $data['tagline'],
                'trailer' => $this->trailer,
                'vote_average' => $data['vote_average'],
                'vote_count' => $data['vote_count'],
                'genres' => $this->genres(),
                'details' => $this->getDetails(),
                'credits' => [
                    'cast' => $this->cast,
                    'crew' => $this->crew,
                ],
                'certification' => $this->getUSCertification(),
                'similar' => $this->getSimilarMovies(),
                'recommended' => $this->getRecommendedMovies(),
            ];
        });
    }

    private function getDetails(): array
    {
        $details = [];

        foreach (['budget', 'revenue'] as $field) {
            if (isset($this->data[$field]) && (int) $this->data[$field] > 0) {
                $details[$field] = $this->data[$field];
            }
        }

        $crewByJob = collect($this->data['credits']['crew'] ?? [])
            ->filter(fn ($crew) => in_array($crew['job'], [
                'Director',
                'Original Story',
                'Writer',
                'Novel',
                'Screenplay',
                'Producer',
            ]))
            ->groupBy('job');

        foreach ($crewByJob as $job => $members) {
            $key = match ($job) {
                'Original Story' => 'original_stories',
                default => strtolower($job).'s'
            };
            $details[$key] = $members->pluck('name')->implode(', ');
        }

        return $details;
    }

    public function watchProviders(): Attribute
    {
        return Attribute::get(function () {
            $providers = $this->data['watch/providers']['results'] ?? [];

            return collect($providers)
                ->filter(function ($countryData) {
                    return isset($countryData['flatrate']);
                })
                ->map(function ($countryData, $countryCode) {
                    return collect($countryData['flatrate'])->map(function ($provider) use ($countryCode, $countryData) {
                        return [
                            'country_code' => $countryCode,
                            'provider_id' => $provider['provider_id'],
                            'provider_name' => $provider['provider_name'],
                            'logo_path' => $provider['logo_path'],
                            'link' => $countryData['link'],
                        ];
                    });
                })
                ->flatten(1)
                ->values();
        });
    }

    public function getWatchProvidersForCountry(string $countryCode): array
    {
        $countryData = $this->data['watch/providers']['results'][$countryCode] ?? null;

        if (! $countryData || ! isset($countryData['flatrate'])) {
            return [];
        }

        return collect($countryData['flatrate'])
            ->map(function ($provider) use ($countryCode, $countryData) {
                return [
                    'country_code' => $countryCode,
                    'provider_id' => $provider['provider_id'],
                    'provider_name' => $provider['provider_name'],
                    'logo_path' => $provider['logo_path'],
                    'link' => $countryData['link'],
                ];
            })
            ->values()
            ->all();
    }

    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function genreRelations(): MorphMany
    {
        return $this->morphMany(TmdbContentGenre::class, 'content');
    }

    public function genres()
    {
        return $this->morphToMany(Genre::class, 'content', 'tmdb_content_genres', 'content_id', 'genre_id')
            ->select('genres.id', 'genres.name')
            ->get()
            ->map(function ($genre) {
                return (object) [
                    'id' => $genre->id,
                    'name' => $genre->name,
                ];
            });
    }

    public function trailer(): Attribute
    {
        return Attribute::get(function () {
            $videos = collect($this->data['videos']['results'] ?? []);

            $trailer = $videos
                ->filter(function ($video) {
                    return $video['site'] === 'YouTube' &&
                        $video['type'] === 'Trailer' &&
                        $video['official'] === true;
                })
                ->sortByDesc('published_at')
                ->first();

            if (! $trailer) {
                return null;
            }

            return [
                'link' => "https://www.youtube.com/embed/{$trailer['key']}",
                'name' => $trailer['name'],
            ];
        });
    }

    /**
     * Get the schedules for this movie.
     */
    public function schedules()
    {
        return TmdbSchedule::where('tmdb_type', 'movie')
            ->where('tmdb_id', $this->id)
            ->get();
    }

    /**
     * Get all content providers for this movie.
     */
    public function contentProviders(): MorphMany
    {
        return $this->morphMany(TmdbContentProvider::class, 'content');
    }

    /**
     * Get the providers for this movie.
     */
    public function providers()
    {
        return $this->morphToMany(TmdbProvider::class, 'content', 'tmdb_content_providers', 'content_id', 'provider_id');
    }

    /**
     * Get content providers for a specific country.
     */
    public function getProvidersForCountry(string $countryCode)
    {
        return $this->contentProviders()
            ->where('country_code', $countryCode)
            ->get();
    }

    /**
     * Get content providers by type.
     */
    public function getProvidersByType(string $type)
    {
        return $this->contentProviders()
            ->where('provider_type', $type)
            ->get();
    }

    /**
     * Attach a provider to this movie.
     *
     * @param  TmdbProvider  $provider  The provider to attach
     * @param  string  $providerType  One of: 'ads', 'buy', 'rent', 'flatrate', 'free'
     * @param  string  $countryCode  Two-letter country code
     * @return TmdbContentProvider
     */
    public function attachProvider(TmdbProvider $provider, string $providerType, string $countryCode)
    {
        return $provider->attachToContent($this, $providerType, $countryCode);
    }

    /**
     * Attach a genre to this movie.
     *
     * @param  Genre  $genre  The genre to attach
     * @return TmdbContentGenre
     */
    public function attachGenre(Genre $genre)
    {
        return TmdbContentGenre::firstOrCreate([
            'content_type' => get_class($this),
            'content_id' => $this->id,
            'genre_id' => $genre->id,
        ]);
    }

    /**
     * Get all content keywords for this movie.
     */
    public function keywordRelations(): MorphMany
    {
        return $this->morphMany(TmdbContentKeyword::class, 'content');
    }

    /**
     * Get the keywords for this movie.
     */
    public function keywords()
    {
        return $this->morphToMany(TmdbKeyword::class, 'content', 'tmdb_content_keywords', 'content_id', 'keyword_id');
    }

    /**
     * Attach a keyword to this movie.
     *
     * @param  TmdbKeyword  $keyword  The keyword to attach
     * @return TmdbContentKeyword
     */
    public function attachKeyword(TmdbKeyword $keyword)
    {
        return TmdbContentKeyword::firstOrCreate([
            'content_type' => get_class($this),
            'content_id' => $this->id,
            'keyword_id' => $keyword->id,
        ]);
    }

    /**
     * Get all content videos for this movie.
     */
    public function videoRelations(): MorphMany
    {
        return $this->morphMany(TmdbContentVideo::class, 'content');
    }

    /**
     * Get the videos for this movie.
     */
    public function videos()
    {
        return $this->morphToMany(TmdbVideo::class, 'content', 'tmdb_content_videos', 'content_id', 'video_id');
    }

    /**
     * Attach a video to this movie.
     *
     * @param  TmdbVideo  $video  The video to attach
     * @return TmdbContentVideo
     */
    public function attachVideo(TmdbVideo $video)
    {
        return TmdbContentVideo::firstOrCreate([
            'content_type' => get_class($this),
            'content_id' => $this->id,
            'video_id' => $video->id,
        ]);
    }
}
