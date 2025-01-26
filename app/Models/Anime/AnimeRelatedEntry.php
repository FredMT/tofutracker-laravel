<?php

namespace App\Models\Anime;

use App\Models\Anidb\AnidbAnime;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnimeRelatedEntry extends Model
{
    protected $fillable = [
        'map_id',
        'anime_id',
    ];

    public function map(): BelongsTo
    {
        return $this->belongsTo(AnimeMap::class, 'map_id');
    }

    public function anime(): BelongsTo
    {
        return $this->belongsTo(AnidbAnime::class, 'anime_id');
    }
}
