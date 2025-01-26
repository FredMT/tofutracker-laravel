<?php

namespace App\Models\UserTv;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class UserTvPlay extends Model
{
    protected $table = 'user_tv_plays';

    protected $fillable = [
        'user_id',
        'user_tv_show_id',
        'user_tv_season_id',
        'user_tv_episode_id',
        'playable_id',
        'playable_type',
        'watched_at',
    ];

    protected $casts = [
        'watched_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function show(): BelongsTo
    {
        return $this->belongsTo(UserTvShow::class, 'user_tv_show_id');
    }

    public function season(): BelongsTo
    {
        return $this->belongsTo(UserTvSeason::class, 'user_tv_season_id');
    }

    public function episode(): BelongsTo
    {
        return $this->belongsTo(UserTvEpisode::class, 'user_tv_episode_id');
    }

    public function playable(): MorphTo
    {
        return $this->morphTo();
    }
}
