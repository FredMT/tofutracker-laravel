<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TmdbScheduleEpisode extends Model
{
    protected $fillable = [
        'show_id',
        'season_number',
        'episode_number',
        'episode_id',
        'episode_date',
        'episode_name',
    ];

    protected $casts = [
        'episode_date' => 'datetime',
        'season_number' => 'integer',
        'episode_number' => 'integer',
    ];

    public $timestamps = false;

     // Get the TV show associated with this episode schedule.
    public function tvShow(): BelongsTo
    {
        return $this->belongsTo(TvShow::class, 'show_id', 'id');
    }

     // Get the TV episode associated with this schedule.
    public function episode(): BelongsTo
    {
        return $this->belongsTo(TvEpisode::class, 'episode_id', 'id');
    }

     // Scope a query to only include episodes airing in a specific date range.
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('episode_date', [$startDate, $endDate]);
    }

     // Scope a query to only include episodes airing today.
    public function scopeToday($query)
    {
        return $query->whereDate('episode_date', today());
    }

     // Scope a query to only include episodes airing in the next week.
    public function scopeNextWeek($query)
    {
        return $query->whereBetween('episode_date', [
            today(),
            today()->addDays(7)
        ]);
    }
}
