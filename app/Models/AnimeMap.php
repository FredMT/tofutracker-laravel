<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AnimeMap extends Model
{
    protected $fillable = ['id', 'data', 'most_common_tmdb_id', 'tmdb_type'];

    protected $casts = [
        'data' => 'array',
    ];

    public function chains(): HasMany
    {
        return $this->hasMany(AnimePrequelSequelChain::class, 'map_id');
    }

    public function relatedEntries(): HasMany
    {
        return $this->hasMany(AnimeRelatedEntry::class, 'map_id');
    }
}
