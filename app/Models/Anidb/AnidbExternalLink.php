<?php

namespace App\Models\Anidb;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
