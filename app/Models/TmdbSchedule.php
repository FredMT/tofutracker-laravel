<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TmdbSchedule extends Model
{
    protected $fillable = [
        'tmdb_id',
        'tmdb_type',
        'air_date',
    ];

    protected $casts = [
        'air_date' => 'datetime',
    ];

    public $timestamps = false;

     // Get the TV episode associated with this schedule (for TV shows only).
    public function episode(): BelongsTo
    {
        return $this->belongsTo(TvEpisode::class, 'episode_id');
    }

     // Get the movie associated with this schedule (for movies only).
    public function movie()
    {
        if ($this->tmdb_type !== 'movie') {
            return null;
        }

        return Movie::find($this->tmdb_id);
    }

     // Get the TV show associated with this schedule (for TV shows only).
    public function tvShow()
    {
        if ($this->tmdb_type !== 'tv') {
            return null;
        }

        return TvShow::find($this->tmdb_id);
    }

     // Scope a query to only include schedules for a specific date range.
    public function scopeInDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('air_date', [$startDate, $endDate]);
    }

     // Scope a query to only include schedules for today.
    public function scopeToday($query)
    {
        return $query->whereDate('air_date', now()->toDateString());
    }

     // Scope a query to only include schedules for the next 7 days.
    public function scopeNextWeek($query)
    {
        return $query->whereBetween('air_date', [
            now()->startOfDay(),
            now()->addDays(7)->endOfDay(),
        ]);
    }

     // Scope a query to only include TV shows.
    public function scopeTvShows($query)
    {
        return $query->where('tmdb_type', 'tv');
    }

     // Scope a query to only include movies.
    public function scopeMovies($query)
    {
        return $query->where('tmdb_type', 'movie');
    }
}
