<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AnidbRelatedAnime extends Model
{
    use HasFactory;

    protected $table = 'anidb_related_anime';

    protected $hidden = ['id', 'anime_id', 'created_at', 'updated_at'];

    protected $fillable = [
        'anime_id',
        'related_anime_id',
        'name',
        'relation_type',
    ];

    public function anime(): BelongsTo
    {
        return $this->belongsTo(AnidbAnime::class, 'anime_id');
    }

    public function relatedAnime(): BelongsTo
    {
        return $this->belongsTo(AnidbAnime::class, 'related_anime_id');
    }

    public function relatedEntry(): HasOne
    {
        return $this->hasOne(AnimeRelatedEntry::class, 'anime_id', 'related_anime_id');
    }

    public function chainEntry(): HasOne
    {
        return $this->hasOne(AnimeChainEntry::class, 'anime_id', 'related_anime_id')
            ->with('chain');
    }

    protected static function booted()
    {
        static::addGlobalScope('filter_invalid_types', function ($query) {
            $query->whereHas('relatedAnime', function ($query) {
                $query->whereNotIn('type', ['Music Video', 'unknown']);
            });
        });
    }
}
