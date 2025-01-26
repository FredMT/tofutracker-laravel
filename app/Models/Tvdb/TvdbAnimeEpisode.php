<?php

namespace App\Models\Tvdb;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;

class TvdbAnimeEpisode extends Model
{
    protected $table = 'tvdb_anime_episodes';

    public $timestamps = false;

    public $incrementing = false;

    protected $fillable = [
        'id',
        'series_id',
        'is_movie',
        'name',
        'aired',
        'runtime',
        'overview',
        'image',
        'number',
        'absolute_number',
        'season_number',
        'last_updated',
        'finale_type',
        'year',
    ];

    public function season()
    {
        return $this->belongsTo(TvdbAnimeSeason::class, 'series_id', 'id');
    }

    public function poster(): Attribute
    {
        return Attribute::get(function () {
            return $this->image;
        });
    }
}
