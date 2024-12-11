<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AnidbSeiyuu extends Model
{
    use HasFactory;

    protected $table = 'anidb_seiyuus';


    protected $fillable = [
        'seiyuu_id',
        'name',
        'picture'
    ];

    public function characters(): BelongsToMany
    {
        return $this->belongsToMany(AnidbCharacter::class, 'anidb_character_seiyuu', 'seiyuu_id', 'character_id')
            ->withTimestamps();
    }
}
