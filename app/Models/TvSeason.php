<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

class TvSeason extends Model
{
    protected $table = 'tv_seasons';
    protected $fillable = ['id', 'data', 'etag', 'show_id', 'season_number'];

    public $incrementing = false;

    protected $casts = [
        'data' => 'array',
        'updated_at' => 'datetime'
    ];

    public function show(): BelongsTo
    {
        return $this->belongsTo(TvShow::class, 'show_id', 'id');
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
        if (!empty($this->data['overview'])) {
            return $this->data['overview'];
        }

        // Try to get overview from related show
        if ($this->show && !empty($this->show->data['overview'])) {
            return $this->show->data['overview'];
        }

        return null;
    }

    private function getCast(): array
    {
        return collect($this->data['credits']['cast'] ?? [])
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

    private function getCrew(): array
    {
        $importantJobs = [
            'Novel',
            'Writer',
            'Co-Executive Producer',
            'Producer',
            'Original Music Composer'
        ];

        $crewCollection = collect($this->data['credits']['crew'] ?? []);

        $priorityCrew = $crewCollection
            ->filter(function ($crew) use ($importantJobs) {
                return in_array($crew['job'], $importantJobs);
            });

        $otherCrew = $crewCollection
            ->filter(function ($crew) use ($importantJobs) {
                return !in_array($crew['job'], $importantJobs);
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

    public function filteredData(): Attribute
    {
        return Attribute::get(function () {
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
                $runtime = $hours . 'h' . ($minutes > 0 ? ' ' . $minutes . 'm' : '');
            } else if ($totalMinutes > 0) {
                $runtime = $totalMinutes . 'm';
            }

            // Get show data from parent relationship
            $show = $this->show;

            return [
                'id' => $data['id'],
                'title' => $show->data['name'] . ' - ' . $data['name'],
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
}