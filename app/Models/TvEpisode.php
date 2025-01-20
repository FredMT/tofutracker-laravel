<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TvEpisode extends Model
{
    protected $table = 'tv_episodes';

    protected $fillable = ['id', 'show_id', 'season_id', 'data'];

    public $incrementing = false;

    protected $casts = [
        'data' => 'array',
        'updated_at' => 'datetime',
    ];

    public function show(): BelongsTo
    {
        return $this->belongsTo(TvShow::class, 'show_id', 'id');
    }

    public function season(): BelongsTo
    {
        return $this->belongsTo(TvSeason::class, 'season_id', 'id');
    }

    public function filteredData(): Attribute
    {
        return Attribute::get(function () {
            $data = $this->data;

            return [
                'id' => $data['id'],
                'name' => $data['name'],
                'overview' => $data['overview'] ?: null,
                'episode_number' => $data['episode_number'],
                'season_number' => $data['season_number'],
                'air_date' => isset($data['air_date'])
                    ? Carbon::parse($data['air_date'])->format('F j, Y')
                    : null,
                'still_path' => $data['still_path'] ?: null,
                'vote_average' => $data['vote_average'] ?: null,
                'vote_count' => $data['vote_count'] ?: null,
                'runtime' => $data['runtime'] ?: null,
                'credits' => [
                    'cast' => $this->getCast(),
                    'crew' => $this->getCrew(),
                ],
                'images' => $this->getImages(),
            ];
        });
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
            ->all();
    }

    private function getImages(): array
    {
        return collect($this->data['images']['stills'] ?? [])
            ->map(function ($still) {
                return [
                    'file_path' => $still['file_path'],
                    'aspect_ratio' => $still['aspect_ratio'],
                    'height' => $still['height'],
                    'width' => $still['width'],
                    'vote_average' => $still['vote_average'],
                    'vote_count' => $still['vote_count'],
                ];
            })
            ->values()
            ->all();
    }
}
