<?php

namespace App\Models;

use App\Traits\Likeable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class UserActivity extends Model
{
    use Likeable;

    protected $fillable = [
        'user_id',
        'activity_type',
        'subject_type',
        'subject_id',
        'anime_id',
        'anidb_id',
        'description',
        'metadata',
        'occurred_at',
    ];

    protected $casts = [
        'metadata' => 'array',
        'occurred_at' => 'datetime',
    ];

    /**
     * The metadata keys that should be hidden when sending to the frontend.
     *
     * @var array
     */
    protected $hiddenMetadataKeys = [
        'user_movie_id',
        'user_show_id',
        'user_anime_id',
        'user_anime_episode_ids',
        'user_tv_show_id',
        'user_tv_episode_ids',
        'user_tv_season_id',

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
        return ($poster && isset($poster['path']) && ! is_null($poster['path'])) ? $poster : null;
    }

    /**
     * Get the array representation of the model.
     *
     * @return array<string, mixed>
     */
    public function toArray(): array
    {
        $array = parent::toArray();

        // Filter out hidden metadata keys if metadata exists
        if (isset($array['metadata']) && is_array($array['metadata'])) {
            $array['metadata'] = $this->filterHiddenMetadata($array['metadata']);
        }

        return $array;
    }

    /**
     * Filter out hidden metadata keys.
     *
     * @param array<string, mixed> $metadata
     * @return array<string, mixed>
     */
    protected function filterHiddenMetadata(array $metadata): array
    {
        return array_diff_key(
            $metadata,
            array_flip($this->hiddenMetadataKeys)
        );
    }
}
