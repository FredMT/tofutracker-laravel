<?php

namespace App\Models\Anidb;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnidbAnimeTag extends Model
{
    protected $fillable = [
        'anidb_id',
        'tag_id',
        'weight',
    ];

    protected $casts = [
        'weight' => 'integer',
    ];

    public function anime(): BelongsTo
    {
        return $this->belongsTo(AnidbAnime::class, 'anidb_id');
    }

    public function tag(): BelongsTo
    {
        return $this->belongsTo(AnidbTag::class, 'tag_id');
    }
}
