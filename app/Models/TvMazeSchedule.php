<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TvMazeSchedule extends Model
{
    protected $table = 'tv_maze_schedules';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
        'airstamp',
        'runtime',
        'summary',
        'thetvdb_id',
        'official_site',
        'schedule',
        'web_channel',
    ];

    public $incrementing = false;

    protected $casts = [
        'id' => 'integer',
        'airstamp' => 'datetime',
        'runtime' => 'integer',
        'thetvdb_id' => 'integer',
        'schedule' => 'array',
        'web_channel' => 'array',
    ];

    /**
     * Get the sanitized summary attribute.
     *
     * @return string|null
     */
    public function getSummaryAttribute($value)
    {
        return $value ? htmlspecialchars(strip_tags($value), ENT_QUOTES, 'UTF-8') : $value;
    }
}
