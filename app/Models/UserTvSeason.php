<?php

namespace App\Models;

use App\Enums\WatchStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class UserTvSeason extends Model
{
    protected $fillable = [
        'user_tv_show_id',
        'user_id',
        'show_id',
        'season_id',
        'watch_status',
        'rating',
    ];

    protected $casts = [
        'watch_status' => WatchStatus::class,
        'rating' => 'float',
    ];

    public function userTvShow(): BelongsTo
    {
        return $this->belongsTo(UserTvShow::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function show(): BelongsTo
    {
        return $this->belongsTo(TvShow::class, 'show_id');
    }

    public function season(): BelongsTo
    {
        return $this->belongsTo(TvSeason::class, 'season_id');
    }

    public function episodes(): HasMany
    {
        return $this->hasMany(UserTvEpisode::class);
    }

    public function plays(): MorphMany
    {
        return $this->morphMany(UserTvPlay::class, 'playable');
    }
}
