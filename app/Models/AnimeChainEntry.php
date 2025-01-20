<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnimeChainEntry extends Model
{
    protected $fillable = [
        'chain_id',
        'anime_id',
        'sequence_order',
    ];

    public function chain(): BelongsTo
    {
        return $this->belongsTo(AnimePrequelSequelChain::class, 'chain_id');
    }

    public function anime(): BelongsTo
    {
        return $this->belongsTo(AnidbAnime::class, 'anime_id');
    }

    public static function getOrderedAnimeIdsForChain(int $chainId): array
    {
        return self::where('chain_id', $chainId)
            ->orderBy('sequence_order', 'asc')
            ->pluck('anime_id')
            ->toArray();
    }
}
