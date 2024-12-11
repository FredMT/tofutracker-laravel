<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AnidbSimilarAnime extends Model
{
    use HasFactory;

    protected $table = 'anidb_similar_anime';


    protected $fillable = [
        'anime_id',
        'similar_anime_id',
        'name'
    ];

    public function anime(): BelongsTo
    {
        return $this->belongsTo(AnidbAnime::class, 'anime_id');
    }
}
