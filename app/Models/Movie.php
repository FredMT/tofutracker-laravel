<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Movie extends Model
{
    protected $fillable = ['id', 'data', 'etag'];

    public $incrementing = false;

    protected $casts = [
        'data' => 'array',
        'updated_at' => 'datetime'
    ];

    public function poster(): Attribute
    {
        return Attribute::get(function () {
            return $this->data['poster_path'];
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

    public function genres(): Attribute
    {
        return Attribute::get(function () {
            return collect($this->data['genres'] ?? [])->map(function ($genre) {
                return [
                    'id' => $genre['id'],
                    'name' => $genre['name']
                ];
            })->values();
        });
    }

    public function keywords(): Attribute
    {
        return Attribute::get(function () {
            return collect($this->data['keywords']['keywords'] ?? [])->map(function ($keyword) {
                return [
                    'id' => $keyword['id'],
                    'name' => $keyword['name']
                ];
            })->values();
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
                    'origin_country' => $company['origin_country']
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
                    'iso_3166_1' => $country['iso_3166_1']
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
                ->sortByDesc('vote_count')
                ->first()['file_path'] ?? null;
        });
    }

    public function backdrops(): Attribute
    {
        return Attribute::get(function () {
            return collect($this->data['images']['backdrops'] ?? [])->map(function ($backdrop) {
                return [
                    'file_path' => $backdrop['file_path'] ?? null,
                    'width' => $backdrop['width'] ?? null,
                    'height' => $backdrop['height'] ?? null,
                    'aspect_ratio' => $backdrop['aspect_ratio'] ?? null,
                    'language' => $backdrop['iso_639_1'] ?? null,
                    'vote_average' => $backdrop['vote_average'] ?? null,
                    'vote_count' => $backdrop['vote_count'] ?? null,
                ];
            })->values();
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
                'Producer'
            ];

            $crewCollection = collect($this->data['credits']['crew'] ?? []);

            $priorityCrew = $crewCollection
                ->filter(function ($crew) use ($importantJobs) {
                    return in_array($crew['job'], $importantJobs);
                })
                ->sortByDesc('popularity');

            $additionalCrew = $crewCollection
                ->filter(function ($crew) use ($importantJobs) {
                    return !in_array($crew['job'], $importantJobs);
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

        if (!$usReleases) {
            return null;
        }

        // Get first non-empty certification
        $certification = collect($usReleases['release_dates'] ?? [])
            ->map(fn($date) => $date['certification'] ?? '')
            ->filter(fn($cert) => !empty($cert))
            ->first();

        return $certification ?: null;
    }

    private function getSimilarMovies(): array
    {
        $similarMovies = $this->data['similar']['results'] ?? [];

        return collect($similarMovies)
            ->filter(function ($movie) {
                return !empty($movie['poster_path']) &&
                    !empty($movie['vote_average']) &&
                    !empty($movie['title']) &&
                    !empty($movie['release_date']);
            })
            ->map(function ($movie) {
                return [
                    'id' => $movie['id'],
                    'title' => $movie['title'],
                    'poster_path' => $movie['poster_path'],
                    'vote_average' => $movie['vote_average'],
                    'release_date' => $movie['release_date']
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
                if (isset($data[$field]) && (int)$data[$field] === 0) {
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
                'vote_average' => $data['vote_average'],
                'vote_count' => $data['vote_count'],
                'genres' => $this->genres,
                'details' => $this->getDetails(),
                'credits' => [
                    'cast' => $this->cast,
                    'crew' => $this->crew,
                ],
                'certification' => $this->getUSCertification(),
                'similar' => $this->getSimilarMovies()
            ];
        });
    }

    private function getDetails(): array
    {
        $details = [];

        foreach (['budget', 'revenue'] as $field) {
            if (isset($this->data[$field]) && (int)$this->data[$field] > 0) {
                $details[$field] = $this->data[$field];
            }
        }

        $crewByJob = collect($this->data['credits']['crew'] ?? [])
            ->filter(fn($crew) => in_array($crew['job'], [
                'Director',
                'Original Story',
                'Writer',
                'Novel',
                'Screenplay',
                'Producer'
            ]))
            ->groupBy('job');

        foreach ($crewByJob as $job => $members) {
            $key = match ($job) {
                'Original Story' => 'original_stories',
                default => strtolower($job) . 's'
            };
            $details[$key] = $members->pluck('name')->implode(', ');
        }

        return $details;
    }
}
