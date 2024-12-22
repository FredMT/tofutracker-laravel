<?php

namespace App\Models;

use App\Enums\WatchStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class UserAnimeCollection extends Model
{
    protected $fillable = [
        'user_library_id',
        'map_id',
        'rating',
        'watch_status'
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

    public function collectionAnime(): HasMany
    {
        return $this->hasMany(UserAnime::class, 'user_anime_collection_id');
    }
}
