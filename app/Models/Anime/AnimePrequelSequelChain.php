<?php

namespace App\Models\Anime;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnimePrequelSequelChain extends Model
{
    protected $fillable = [
        'map_id',
        'name',
        'importance_order',
    ];

    public function entries(): HasMany
    {
        return $this->hasMany(AnimeChainEntry::class, 'chain_id');
    }
}
