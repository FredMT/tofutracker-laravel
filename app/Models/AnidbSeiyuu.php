<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AnidbSeiyuu extends Model
{
    use HasFactory;

    protected $table = 'anidb_seiyuus';
    protected $hidden = ['created_at', 'updated_at'];


    protected $fillable = [
        'seiyuu_id',
        'name',
        'picture'
    ];

    public function characters(): BelongsToMany
    {
        return $this->belongsToMany(
            AnidbCharacter::class,
            'anidb_character_seiyuu',
            'seiyuu_id',    // Foreign key on pivot table
            'character_id', // Related key on pivot table
            'id',          // Local key on AnidbSeiyuu
            'id'          // Local key on AnidbCharacter
        )->withTimestamps();
    }
}
