<?php

namespace App\Models\UserAnime;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class UserAnimePlay extends Model
{
    protected $fillable = [
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

    public function playable(): MorphTo
    {
        return $this->morphTo();
    }

    public function userAnimeEpisode(): BelongsTo
    {
        return $this->belongsTo(UserAnimeEpisode::class, 'playable_id')
            ->where('playable_type', UserAnimeEpisode::class);
    }

    public function userAnime(): BelongsTo
    {
        return $this->belongsTo(UserAnime::class, 'playable_id')
            ->where('playable_type', UserAnime::class);
    }
}
