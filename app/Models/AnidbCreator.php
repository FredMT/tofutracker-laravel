<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AnidbCreator extends Model
{
    use HasFactory;

    protected $table = 'anidb_creators';



    protected $fillable = [
        'anime_id',
        'creator_id',
        'name',
        'role'
    ];

    public function anime(): BelongsTo
    {
        return $this->belongsTo(AnidbAnime::class, 'anime_id');
    }
}
