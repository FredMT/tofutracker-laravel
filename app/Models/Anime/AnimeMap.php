<?php

namespace App\Models\Anime;

use App\Models\Comment;
use App\Models\Movie;
use App\Models\TvShow;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class AnimeMap extends Model
{
    protected $fillable = ['id', 'data', 'most_common_tmdb_id', 'tmdb_type', 'collection_name'];

    protected $casts = [
        'data' => 'array',
    ];

    public function poster(): Attribute
    {
        return Attribute::get(function () {
            return $this->getTmdbModel()?->poster;
        });
    }

    public function chains(): HasMany
    {
        return $this->hasMany(AnimePrequelSequelChain::class, 'map_id');
    }

    public function title(): Attribute
    {
        return Attribute::get(function () {
            if ($this->collection_name && trim($this->collection_name) !== '') {
                return $this->collection_name;
            }

            return $this->getTmdbModel()?->title;
        });
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

            if (! $model) {
                return null;
            }

            return $model->year_range;
        });
    }

    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function trailer(): Attribute
    {
        return Attribute::get(function () {
            return $this->getTmdbModel()?->trailer;
        });
    }
}
