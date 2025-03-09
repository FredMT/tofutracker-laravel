<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnimeScheduleMap extends Model
{
    use HasFactory;

    protected $fillable = [
        'animeschedule_id',
        'animeschedule_route',
        'anidb_id',
    ];

    public $timestamps = false;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $primaryKey = 'animeschedule_id';

    public function schedules(): HasMany
    {
        return $this->hasMany(AnimeSchedule::class, 'animeschedule_id', 'animeschedule_id');
    }

    // Scope a query to find a mapping by animeschedule_id
    public function scopeByAnimeScheduleId(Builder $query, string $id): Builder
    {
        return $query->where('animeschedule_id', $id);
    }

    // Scope a query to find a mapping by animeschedule_route
    public function scopeByAnimeScheduleRoute(Builder $query, string $route): Builder
    {
        return $query->where('animeschedule_route', $route);
    }

    // Scope a query to find a mapping by anidb_id
    public function scopeByAnidbId(Builder $query, int $anidbId): Builder
    {
        return $query->where('anidb_id', $anidbId);
    }

    public static function animeScheduleIdExists(string $id): bool
    {
        return static::byAnimeScheduleId($id)->exists();
    }

    public static function animeScheduleRouteExists(string $route): bool
    {
        return static::byAnimeScheduleRoute($route)->exists();
    }
}
