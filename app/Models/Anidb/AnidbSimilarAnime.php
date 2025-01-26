<?php

namespace App\Models\Anidb;

use App\Models\Anime\AnimeChainEntry;
use App\Models\Anime\AnimeRelatedEntry;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AnidbSimilarAnime extends Model
{
    use HasFactory;

    protected $table = 'anidb_similar_anime';

    protected $hidden = ['id', 'anime_id', 'created_at', 'updated_at'];

    protected $fillable = [
        'anime_id',
        'similar_anime_id',
        'name',
    ];

    public function anime(): BelongsTo
    {
        return $this->belongsTo(AnidbAnime::class, 'anime_id');
    }

    public function similarAnime(): BelongsTo
    {
        return $this->belongsTo(AnidbAnime::class, 'similar_anime_id');
    }

    public function relatedEntry(): HasOne
    {
        return $this->hasOne(AnimeRelatedEntry::class, 'anime_id', 'similar_anime_id');
    }

    public function chainEntry(): HasOne
    {
        return $this->hasOne(AnimeChainEntry::class, 'anime_id', 'similar_anime_id')
            ->with('chain');
    }

    protected static function booted()
    {
        static::addGlobalScope('filter_invalid_types', function ($query) {
            $query->whereHas('similarAnime', function ($query) {
                $query->whereNotIn('type', ['Music Video', 'unknown']);
            });
        });
    }
}
