<?php

namespace App\Models;

use App\Enums\WatchStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class UserAnime extends Model
{
    protected $fillable = [
        'user_anime_collection_id',
        'anidb_id',
        'is_movie',
        'rating',
        'watch_status'
    ];

    protected $casts = [
        'is_movie' => 'boolean',
        'rating' => 'float',
        'watch_status' => WatchStatus::class
    ];

    public function collection(): BelongsTo
    {
        return $this->belongsTo(UserAnimeCollection::class, 'user_anime_collection_id');
    }

    public function anime(): BelongsTo
    {
        return $this->belongsTo(AnidbAnime::class, 'anidb_id');
    }

    public function episodes(): HasMany
    {
        return $this->hasMany(UserAnimeEpisode::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::deleting(function (UserAnime $anime) {
            UserAnimePlay::query()
                ->where('playable_id', $anime->id)
                ->where('playable_type', UserAnime::class)
                ->delete();

            $episodeIds = $anime->episodes()->pluck('id');

            if ($episodeIds->isNotEmpty()) {
                UserAnimePlay::query()
                    ->where('playable_type', UserAnimeEpisode::class)
                    ->whereIn('playable_id', $episodeIds)
                    ->delete();
            }

            $anime->episodes()->delete();
        });
    }
}
