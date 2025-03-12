<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnimeSchedule extends Model
{
    use HasFactory;

    protected $fillable = [
        'animeschedule_id',
        'title',
        'episode_date',
        'year',
        'week',
        'episode_number'
    ];

    protected $casts = [
        'episode_date' => 'datetime',
        'year' => 'integer',
        'week' => 'integer',
    ];

    public $timestamps = false;

    public function animeMap(): BelongsTo
    {
        return $this->belongsTo(AnimeScheduleMap::class, 'animeschedule_id', 'animeschedule_id');
    }

    public function getAnidbIdAttribute(): ?int
    {
        return $this->animeMap?->anidb_id;
    }

    public function getRouteAttribute(): ?string
    {
        return $this->animeMap?->animeschedule_route;
    }

    // Scope a query to find schedules by animeschedule_id
    public function scopeByAnimeScheduleId(Builder $query, string $id): Builder
    {
        return $query->where('animeschedule_id', $id);
    }

    // Scope a query to find anime schedules by year and week
    public function scopeByYearAndWeek(Builder $query, int $year, int $week): Builder
    {
        return $query->where('year', $year)->where('week', $week);
    }

    // Scope to only include future episodes
    public function scopeFutureEpisodes(Builder $query): Builder
    {
        return $query->where('episode_date', '>', now());
    }

    public function scopeNext7DaysEpisodes(Builder $query): Builder
    {
        return $query->whereBetween('episode_date', [now(), now()->addDays(7)]);
    }

    // Scope to only include past episodes
    public function scopePastEpisodes(Builder $query): Builder
    {
        return $query->whereNotNull('episode_date')->where(function ($query) {
            $query->where('episode_date', '<', now());
        });
    }

    // Check if a schedule exists for a specific animeschedule_id, year, and week

    public static function scheduleExists(string $animescheduleId, int $year, int $week): bool
    {
        return static::byAnimeScheduleId($animescheduleId)->byYearAndWeek($year, $week)->exists();
    }
}
