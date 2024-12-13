<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AnimeEpisodeMapping extends Model
{
    protected $fillable = [
        'anidb_id',
        'tvdb_series_id',
        'tvdb_episode_id',
        'anidb_episode_number',
        'is_special',
        'tvdb_season_number',
        'tvdb_episode_number',
    ];
}
