<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AnidbExternalLink extends Model
{
    use HasFactory;

    protected $table = 'anidb_external_links';
    protected $hidden = ['id', 'anime_id', 'created_at', 'updated_at'];



    protected $fillable = [
        'anime_id',
        'type',
        'identifier',
    ];

    public function anime(): BelongsTo
    {
        return $this->belongsTo(AnidbAnime::class, 'anime_id');
    }
}
