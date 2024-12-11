<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AnidbRelatedAnime extends Model
{
    use HasFactory;

    protected $table = 'anidb_related_anime';


    protected $fillable = [
        'anime_id',
        'related_anime_id',
        'name',
        'relation_type'
    ];

    public function anime(): BelongsTo
    {
        return $this->belongsTo(AnidbAnime::class, 'anime_id');
    }
}
