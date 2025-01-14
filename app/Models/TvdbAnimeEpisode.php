<?php

namespace App\Models;

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
}
