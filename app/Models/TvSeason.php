<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Kiritokatklian\LaravelColorPalette\Facades\ColorPalette;

class TvSeason extends Model
{
    protected $table = 'tv_seasons';

    protected $fillable = ['id', 'data', 'etag', 'show_id', 'season_number'];

    public $incrementing = false;

    protected $casts = [
        'data' => 'array',
        'season_number' => 'integer',
        'updated_at' => 'datetime',
    ];

    public function title(): Attribute
    {
        return Attribute::get(function () {
            return $this->data['name'];
        });
    }

    public function year(): Attribute
    {
        return Attribute::get(function () {
            return isset($this->data['air_date'])
                ? Carbon::parse($this->data['air_date'])->year
                : null;
        });
    }

    public function voteAverage(): Attribute
    {
        return Attribute::get(function () {
            return number_format($this->data['vote_average'], 2, '.', '');
        });
    }

    public function seasonNumber(): Attribute
    {
        return Attribute::get(fn () => $this->data['season_number'] ?? null);
    }

    public function show(): BelongsTo
    {
        return $this->belongsTo(TvShow::class, 'show_id', 'id');
    }

    public function poster(): Attribute
    {
        return Attribute::get(function () {
            return $this->data['poster_path'];
        });
    }

    public function genres(): Attribute
    {
        return Attribute::get(function () {
            return $this->show->genres;
        });
    }

    public function episodes()
    {
        return $this->hasMany(TvEpisode::class, 'season_id', 'id');
    }

    /**
     * Get overview from season or fallback to show overview
     */
    private function getOverview(): ?string
    {
        // Check if season has a valid overview
        if (! empty($this->data['overview'])) {
            return $this->data['overview'];
        }

        // Try to get overview from related show
        if ($this->show && ! empty($this->show->data['overview'])) {
            return $this->show->data['overview'];
        }

        return null;
    }

    private function getCast(): array
    {
        $seasonCast = $this->data['credits']['cast'] ?? [];

        if (!empty($seasonCast)) {
            return collect($seasonCast)
                ->sortBy('order')
                ->take(50)
                ->map(function ($cast) {
                    return [
                        'id' => $cast['id'],
                        'name' => $cast['name'],
                        'character' => $cast['character'],
                        'profile_path' => $cast['profile_path'] ?: null,
                        'order' => $cast['order'],
                    ];
                })
                ->values()
                ->all();
        }

        // Fallback to show's cast if season cast is empty
        if ($this->show) {
             // Access the cast attribute from the TvShow model
            $showCast = $this->show->cast;
            // Ensure it's converted to a plain array if it's a collection
            return is_array($showCast) ? $showCast : $showCast->all();
        }

        return []; // Return empty array if no cast found
    }

    private function getCrew(): array
    {
        $importantJobs = [
            'Novel',
            'Writer',
            'Co-Executive Producer',
            'Producer',
            'Original Music Composer',
        ];

        $crewCollection = collect($this->data['credits']['crew'] ?? []);

        $priorityCrew = $crewCollection
            ->filter(function ($crew) use ($importantJobs) {
                return in_array($crew['job'], $importantJobs);
            });

        $otherCrew = $crewCollection
            ->filter(function ($crew) use ($importantJobs) {
                return ! in_array($crew['job'], $importantJobs);
            });

        return $priorityCrew->merge($otherCrew)
            ->groupBy('id')
            ->map(function ($groupedCrew) {
                $firstCrew = $groupedCrew->first();

                return [
                    'id' => $firstCrew['id'],
                    'name' => $firstCrew['name'],
                    'job' => $groupedCrew->pluck('job')->unique()->implode(', '),
                    'profile_path' => $firstCrew['profile_path'] ?: null,
                ];
            })
            ->values()
            ->take(50)
            ->all();
    }

    private function getNextEpisodeTimestamp(): ?int
    {
        return TmdbScheduleEpisode::where('show_id', $this->show->id)
            ->where('season_number', $this->season_number)
            ->where('episode_date', '>', now())
            ->orderBy('episode_date', 'asc')
            ->first()?->episode_date->timestamp;
    }

    public function filteredData(): Attribute
    {
        return Attribute::get(function () {
            $this->loadMissing(['show', 'episodes']);
            $data = $this->data;

            // Calculate total runtime from episodes
            $totalMinutes = $this->episodes->sum(function ($episode) {
                return $episode->data['runtime'] ?? 0;
            });

            // Format runtime string
            $runtime = '';
            if ($totalMinutes >= 60) {
                $hours = floor($totalMinutes / 60);
                $minutes = $totalMinutes % 60;
                $runtime = $hours.'h'.($minutes > 0 ? ' '.$minutes.'m' : '');
            } elseif ($totalMinutes > 0) {
                $runtime = $totalMinutes.'m';
            }

            // Get show data from parent relationship
            $show = $this->show;

            return [
                'id' => $data['id'],
                'show_id' => $show->id,
                'title' => $show->data['name'].' - '.$data['name'],
                'type' => 'tvseason',
                'overview' => $this->getOverview(),
                'season_number' => $data['season_number'],
                'air_date' => isset($data['air_date'])
                    ? Carbon::parse($data['air_date'])->format('F j, Y')
                    : null,
                'year' => isset($data['air_date'])
                    ? Carbon::parse($data['air_date'])->year
                    : null,
                'poster_path' => $data['poster_path'] ?: null,
                'backdrop_path' => $show->data['backdrop_path'] ?? null,
                'logo_path' => $show->highestVotedLogoPath,
                'genres' => $show->genres,
                'certification' => $show->getUSCertification(),
                'runtime' => $runtime ?: null,
                'vote_average' => $data['vote_average'] ?: null,
                'countdown' => $this->getNextEpisodeTimestamp(),
                'episodes' => $this->episodes->map(function ($episode) {
                    return [
                        'id' => $episode->data['id'],
                        'name' => $episode->data['name'],
                        'overview' => $episode->data['overview'] ?: null,
                        'episode_number' => $episode->data['episode_number'],
                        'air_date' => isset($episode->data['air_date'])
                            ? Carbon::parse($episode->data['air_date'])->format('F j, Y')
                            : null,
                        'still_path' => $episode->data['still_path'] ?: null,
                        'vote_average' => $episode->data['vote_average'] ?: null,
                        'runtime' => $episode->data['runtime'] ?: null,
                    ];
                })->values()->all(),
                'credits' => [
                    'cast' => $this->getCast(),
                    'crew' => $this->getCrew(),
                ],
            ];
        });
    }

    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function getColorPalette(): array
    {
        $backdrop = $this->show->backdrop;
        if (empty($backdrop)) {
            $backdrop = $this->poster;
        }

        if (empty($backdrop)) {
            $backdrop = 'https://picsum.photos/200/300';
        } else {
            $backdrop = 'https://image.tmdb.org/t/p/original'.$backdrop;
        }

        return ColorPalette::getPalette($backdrop);
    }

    protected static function booted()
    {
        static::creating(function ($season) {
            $season->season_number = $season->data['season_number'] ?? null;
        });

        static::updating(function ($season) {
            $season->season_number = $season->data['season_number'] ?? null;
        });
    }
}
