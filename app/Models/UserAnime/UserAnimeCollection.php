<?php

namespace App\Models\UserAnime;

use App\Collections\UserAnimeCollectionCollection;
use App\Enums\WatchStatus;
use App\Models\Anime\AnimeMap;
use App\Models\UserLibrary;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserAnimeCollection extends Model
{
    protected $fillable = [
        'user_library_id',
        'map_id',
        'rating',
        'watch_status',
    ];

    protected $casts = [
        'watch_status' => WatchStatus::class,
        'rating' => 'float',
    ];

    public function userLibrary(): BelongsTo
    {
        return $this->belongsTo(UserLibrary::class);
    }

    public function animeMap(): BelongsTo
    {
        return $this->belongsTo(AnimeMap::class, 'map_id');
    }

    public function anime(): HasMany
    {
        return $this->hasMany(UserAnime::class);
    }

    public function newCollection(array $models = []): UserAnimeCollectionCollection
    {
        return new UserAnimeCollectionCollection($models);
    }
}
