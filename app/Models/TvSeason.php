<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;

class TvSeason extends Model
{
    protected $table = 'tv_seasons';
    protected $fillable = ['id', 'data', 'etag', 'show_id'];

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

    public function filteredData(): Attribute
    {
        return Attribute::get(function () {
            $data = $this->data;

            return [
                'id' => $data['id'],
                'name' => $data['name'],
                'overview' => $data['overview'] ?: null,
                'season_number' => $data['season_number'],
                'episode_count' => $data['episodes'] ? count($data['episodes']) : null,
                'air_date' => isset($data['air_date'])
                    ? Carbon::parse($data['air_date'])->format('F j, Y')
                    : null,
                'poster_path' => $data['poster_path'] ?: null,
                'vote_average' => $data['vote_average'] ?: null,
                'episodes' => $this->getEpisodes(),
                'credits' => [
                    'cast' => $this->getCast(),
                    'crew' => $this->getCrew(),
                ],
            ];
        });
    }

    private function getEpisodes(): array
    {
        return collect($this->data['episodes'] ?? [])
            ->map(function ($episode) {
                return [
                    'id' => $episode['id'],
                    'name' => $episode['name'],
                    'overview' => $episode['overview'] ?: null,
                    'episode_number' => $episode['episode_number'],
                    'air_date' => isset($episode['air_date'])
                        ? Carbon::parse($episode['air_date'])->format('F j, Y')
                        : null,
                    'still_path' => $episode['still_path'] ?: null,
                    'vote_average' => $episode['vote_average'] ?: null,
                    'runtime' => $episode['runtime'] ?: null,
                ];
            })
            ->values()
            ->all();
    }

    private function getCast(): array
    {
        return collect($this->data['credits']['cast'] ?? [])
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
            'Director',
            'Writer',
            'Screenplay',
            'Producer',
            'Executive Producer',
        ];

        return collect($this->data['credits']['crew'] ?? [])
            ->filter(function ($crew) use ($importantJobs) {
                return in_array($crew['job'], $importantJobs);
            })
            ->map(function ($crew) {
                return [
                    'id' => $crew['id'],
                    'name' => $crew['name'],
                    'job' => $crew['job'],
                    'profile_path' => $crew['profile_path'] ?: null,
                ];
            })
            ->values()
            ->take(50)
            ->all();
    }
}
