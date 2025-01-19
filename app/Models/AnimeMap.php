<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class AnimeMap extends Model
{
    protected $fillable = ['id', 'data', 'most_common_tmdb_id', 'tmdb_type'];

    protected $casts = [
        'data' => 'array',
    ];

    public function chains(): HasMany
    {
        return $this->hasMany(AnimePrequelSequelChain::class, 'map_id');
    }

    public function runtime(): Attribute
    {
        return Attribute::get(function () {
            return $this->chainEntries()
                ->join('anidb_anime', 'anime_chain_entries.anime_id', '=', 'anidb_anime.id')
                ->join('anidb_episodes', function ($join) {
                    $join->on('anidb_anime.id', '=', 'anidb_episodes.anime_id')
                        ->where('anidb_episodes.type', 1);
                })
                ->sum('anidb_episodes.length');
        });
    }

    public function chainEntries(): HasManyThrough
    {
        return $this->hasManyThrough(AnimeChainEntry::class, AnimePrequelSequelChain::class, 'map_id', 'chain_id');
    }

    public function relatedEntries(): HasMany
    {
        return $this->hasMany(AnimeRelatedEntry::class, 'map_id');
    }

    public function genres(): Attribute
    {
        return Attribute::get(function () {
            $model = $this->getTmdbModel();
            return $model ? $model->genres : collect();
        });
    }

    public function getTmdbModel(): ?Model
    {
        if (! $this->most_common_tmdb_id || ! $this->tmdb_type) {
            return null;
        }

        return match ($this->tmdb_type) {
            'movie' => Movie::find($this->most_common_tmdb_id),
            'tv' => TvShow::find($this->most_common_tmdb_id),
            default => null,
        };
    }

    public function yearRange(): Attribute
    {
        return Attribute::get(function () {
            $model = $this->getTmdbModel();
            
            if (!$model) {
                return null;
            }

            return $model->year_range;
        });
    }
}
