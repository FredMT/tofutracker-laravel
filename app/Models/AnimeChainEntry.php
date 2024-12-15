<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnimeChainEntry extends Model
{
    protected $fillable = [
        'chain_id',
        'anime_id',
        'sequence_order'
    ];

    public function chain(): BelongsTo
    {
        return $this->belongsTo(AnimePrequelSequelChain::class, 'chain_id');
    }
}
