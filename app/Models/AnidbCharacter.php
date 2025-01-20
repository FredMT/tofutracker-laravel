<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AnidbCharacter extends Model
{
    use HasFactory;

    protected $table = 'anidb_characters';

    protected $hidden = ['created_at', 'updated_at'];

    protected $fillable = [
        'anime_id',
        'character_id',
        'character_type',
        'name',
        'gender',
        'description',
        'picture',
        'rating',
        'rating_votes',
    ];

    protected $casts = [
        'rating' => 'decimal:2',
        'rating_votes' => 'integer',
    ];

    public function anime(): BelongsTo
    {
        return $this->belongsTo(AnidbAnime::class, 'anime_id');
    }

    public function seiyuus(): BelongsToMany
    {
        return $this->belongsToMany(
            AnidbSeiyuu::class,
            'anidb_character_seiyuu',
            'character_id',  // Foreign key on pivot table
            'seiyuu_id',     // Related key on pivot table
            'id',            // Local key on AnidbCharacter
            'id'            // Local key on AnidbSeiyuu
        )->withTimestamps();
    }
}
