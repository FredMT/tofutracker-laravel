<?php

namespace App\Models;

use App\Enums\WatchStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class UserTvEpisode extends Model
{
    protected $fillable = [
        'user_tv_season_id',
        'user_id',
        'show_id',
        'season_id',
        'episode_id',
        'watch_status',
        'rating',
    ];

    protected $casts = [
        'watch_status' => WatchStatus::class,
        'rating' => 'float',
    ];

    protected $hidden = ['created_at', 'updated_at', 'user_tv_season_id'];

    public function userTvSeason(): BelongsTo
    {
        return $this->belongsTo(UserTvSeason::class);
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

    public function episode(): BelongsTo
    {
        return $this->belongsTo(TvEpisode::class, 'episode_id');
    }

    public function plays(): MorphMany
    {
        return $this->morphMany(UserTvPlay::class, 'playable');
    }
}
