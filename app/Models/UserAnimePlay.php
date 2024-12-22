<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class UserAnimePlay extends Model
{
    protected $fillable = [
        'playable_id',
        'playable_type',
        'watched_at'
    ];

    protected $casts = [
        'watched_at' => 'datetime'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function userAnime(): BelongsTo
    {
        return $this->belongsTo(UserAnime::class);
    }

    public function anime(): BelongsTo
    {
        return $this->belongsTo(AnidbAnime::class, 'anidb_id');
    }

    public function playable(): MorphTo
    {
        return $this->morphTo();
    }
}
