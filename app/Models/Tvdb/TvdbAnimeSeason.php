<?php

namespace App\Models\Tvdb;

use Illuminate\Database\Eloquent\Model;

class TvdbAnimeSeason extends Model
{
    protected $table = 'tvdb_anime_seasons';

    public $timestamps = false;

    public $incrementing = false;

    protected $fillable = [
        'id',
        'slug',
        'status_name',
        'status_record_type',
        'status_keep_updated',
        'last_updated',
        'average_runtime',
        'last_fetched_at',
    ];

    protected $casts = [
        'last_fetched_at' => 'datetime',
        'last_updated' => 'datetime',
    ];

    public function episodes()
    {
        return $this->hasMany(TvdbAnimeEpisode::class, 'series_id', 'id');
    }
}
