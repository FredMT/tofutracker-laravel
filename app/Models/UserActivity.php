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

    public function getPoster(): ?array
    {
        $subjectType = $this->subject_type;
        $metadata = $this->metadata;

        $poster = match ($subjectType) {
            'App\Models\UserAnime',
            'App\Models\UserAnimeEpisode' => $metadata['anidb_id']
                ? ['path' => AnidbAnime::find($metadata['anidb_id'])?->poster, 'from' => 'anidb']
                : null,

            'App\Models\UserTvShow' => $metadata['show_id']
                ? ['path' => TvShow::find($metadata['show_id'])?->poster, 'from' => 'tmdb']
                : null,

            'App\Models\UserTvSeason',
            'App\Models\UserTvEpisode' => $metadata['season_id']
                ? ['path' => TvSeason::find($metadata['season_id'])?->poster, 'from' => 'tmdb']
                : null,

            'App\Models\UserMovie' => $metadata['movie_id']
                ? ['path' => Movie::find($metadata['movie_id'])?->poster, 'from' => 'tmdb']
                : null,

            default => null
        };

        // Only return the array if we have a valid poster path
        return ($poster && isset($poster['path']) && !is_null($poster['path'])) ? $poster : null;
    }
}
