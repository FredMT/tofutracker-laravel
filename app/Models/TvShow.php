<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class TvShow extends Model
{

    protected $table = 'tv_shows';
    protected $fillable = ['id', 'data', 'etag'];

    public $incrementing = false;

    protected $casts = [
        'data' => 'array',
        'updated_at' => 'datetime'
    ];

    public function title(): Attribute
    {
        return Attribute::get(function () {
            return $this->data['name'];
        });
    }

    public function seasons()
    {
        return $this->hasMany(TvSeason::class, 'show_id', 'id');
    }

    public function episodes()
    {
        return $this->hasMany(TvEpisode::class, 'show_id', 'id');
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
            return collect($this->data['aggregate_credits']['cast'] ?? [])
                ->sortBy('order')
                ->take(50)
                ->map(function ($cast) {
                    $role = collect($cast['roles'] ?? [])->first();
                    return [
                        'id' => $cast['id'],
                        'name' => $cast['name'],
                        'character' => $role['character'] ?? null,
                        'profile_path' => $cast['profile_path'],
                        'order' => $cast['order'],
                        'total_episodes' => $cast['total_episode_count'],
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
                'Executive Producer',
                'Showrunner'
            ];

            $crewCollection = collect($this->data['aggregate_credits']['crew'] ?? []);

            $priorityCrew = $crewCollection
                ->filter(function ($crew) use ($importantJobs) {
                    return collect($crew['jobs'] ?? [])->contains(function ($job) use ($importantJobs) {
                        return in_array($job['job'], $importantJobs);
                    });
                })
                ->sortByDesc('popularity');

            $additionalCrew = $crewCollection
                ->filter(function ($crew) use ($importantJobs) {
                    return !collect($crew['jobs'] ?? [])->contains(function ($job) use ($importantJobs) {
                        return in_array($job['job'], $importantJobs);
                    });
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
                        'job' => collect($firstCrew['jobs'] ?? [])
                            ->pluck('job')
                            ->unique()
                            ->implode(', '),
                        'profile_path' => $firstCrew['profile_path'],
                        'popularity' => $firstCrew['popularity'],
                        'total_episodes' => $firstCrew['total_episode_count'],
                    ];
                })
                ->values();
        });
    }

    public function getUSCertification(): ?string
    {
        $contentRatings = $this->data['content_ratings']['results'] ?? [];

        // Find US content rating
        $usRating = collect($contentRatings)
            ->firstWhere('iso_3166_1', 'US');

        return $usRating['rating'] ?? null;
    }

    private function getSimilarShows(): array
    {
        $similarShows = $this->data['similar']['results'] ?? [];

        return collect($similarShows)
            ->filter(function ($show) {
                return !empty($show['poster_path']) &&
                    !empty($show['vote_average']) &&
                    !empty($show['name']) &&
                    !empty($show['first_air_date']);
            })
            ->map(function ($show) {
                return [
                    'id' => $show['id'],
                    'title' => $show['name'],
                    'poster_path' => $show['poster_path'],
                    'vote_average' => $show['vote_average'],
                    'release_date' => $show['first_air_date']
                ];
            })
            ->values()
            ->all();
    }

    public function filteredData(): Attribute
    {
        return Attribute::get(function () {
            $this->loadMissing(['seasons.episodes']);
            $data = $this->data;

            // Convert empty string to null for overview
            if (isset($data['overview']) && $data['overview'] === '') {
                $data['overview'] = null;
            }

            // Convert zero values to null for numeric fields
            $numericFields = ['vote_average', 'number_of_episodes', 'number_of_seasons'];
            foreach ($numericFields as $field) {
                if (isset($data[$field]) && (int)$data[$field] === 0) {
                    $data[$field] = null;
                }
            }

            $lastAirDate = isset($data['last_air_date'])
                ? Carbon::parse($data['last_air_date'])
                : null;

            return [
                'id' => $data['id'],
                'title' => $data['name'],
                'original_title' => $data['original_name'],
                'original_language' => $data['original_language'],
                'overview' => $data['overview'],
                'poster_path' => $data['poster_path'],
                'backdrop_path' => $data['backdrop_path'],
                'logo_path' => $this->highestVotedLogoPath,
                'first_air_date' => isset($data['first_air_date'])
                    ? Carbon::parse($data['first_air_date'])->format('F j, Y')
                    : null,
                'last_air_date' => $lastAirDate?->format('F j, Y'),
                'year' => isset($data['first_air_date'])
                    ? Carbon::parse($data['first_air_date'])->year
                    : null,
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
                'similar' => $this->getSimilarShows(),
                'seasons' => $this->seasons->map(function ($season) {
                    return [
                        'id' => $season->data['id'],
                        'name' => $season->data['name'],
                        'show_id' => $this->id,
                        'season_number' => $season->data['season_number'],
                        'air_date' => isset($season->data['air_date'])
                            ? Carbon::parse($season->data['air_date'])->format('F j, Y')
                            : null,
                        'poster_path' => $season->data['poster_path'] ?: null,
                        'vote_average' => $season->data['vote_average'] ?: null,
                        'episode_count' => $season->episodes->count(),
                    ];
                })->sortBy('season_number')->values()->all(),
                'network' => $this->getNetwork(),
                'episode_runtime' => collect(
                    $this->data['episode_run_time']
                ),
                'in_production' => $data['in_production'] ?? false,
                'type' => $data['type'] ?? null,
                'number_of_episodes' => $data['number_of_episodes'] ?? null,
                'number_of_seasons' => $data['number_of_seasons'] ?? null,
            ];
        });
    }

    private function getDetails(): array
    {
        $details = [];

        // Add episode and season count if available
        if (isset($this->data['number_of_episodes']) && $this->data['number_of_episodes'] > 0) {
            $details['episodes'] = $this->data['number_of_episodes'];
        }
        if (isset($this->data['number_of_seasons']) && $this->data['number_of_seasons'] > 0) {
            $details['seasons'] = $this->data['number_of_seasons'];
        }

        // Add creators
        if (!empty($this->data['created_by'])) {
            $details['creators'] = collect($this->data['created_by'])
                ->pluck('name')
                ->implode(', ');
        }

        // Add status
        if (!empty($this->data['status'])) {
            $details['status'] = $this->data['status'];
        }

        // Add production companies
        if (!empty($this->data['production_companies'])) {
            $details['production_companies'] = collect($this->data['production_companies'])
                ->pluck('name')
                ->implode(', ');
        }

        // Add networks
        if (!empty($this->data['networks'])) {
            $details['networks'] = collect($this->data['networks'])
                ->pluck('name')
                ->implode(', ');
        }

        return $details;
    }


    private function getNetwork(): ?array
    {
        $network = collect($this->data['networks'] ?? [])->first();

        if (!$network) {
            return null;
        }

        return [
            'id' => $network['id'],
            'name' => $network['name'],
            'logo_path' => $network['logo_path'],
            'origin_country' => $network['origin_country'],
        ];
    }
}
