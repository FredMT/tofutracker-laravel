<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AnidbCharacter extends Model
{
    use HasFactory;

    protected $table = 'anidb_characters';


    protected $fillable = [
        'anime_id',
        'character_id',
        'character_type',
        'name',
        'gender',
        'description',
        'picture',
        'rating',
        'rating_votes'
    ];

    protected $casts = [
        'rating' => 'decimal:2',
        'rating_votes' => 'integer'
    ];

    public function anime(): BelongsTo
    {
        return $this->belongsTo(AnidbAnime::class, 'anime_id');
    }

    public function seiyuus(): BelongsToMany
    {
        return $this->belongsToMany(AnidbSeiyuu::class, 'anidb_character_seiyuu', 'character_id', 'seiyuu_id')
            ->withTimestamps();
    }
}
