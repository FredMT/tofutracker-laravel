<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class UserActivity extends Model
{
    protected $fillable = [
        'user_id',
        'activity_type',
        'subject_type',
        'subject_id',
        'anime_id',
        'anidb_id',
        'description',
        'metadata',
        'occurred_at'
    ];

    protected $casts = [
        'metadata' => 'array',
        'occurred_at' => 'datetime'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function subject(): MorphTo
    {
        return $this->morphTo();
    }

    public function anime(): BelongsTo
    {
        return $this->belongsTo(UserAnime::class, 'anime_id');
    }
}
