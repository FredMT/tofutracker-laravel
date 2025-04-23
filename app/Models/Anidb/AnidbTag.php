<?php

namespace App\Models\Anidb;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class AnidbTag extends Model
{
    use HasFactory;

    protected $table = 'anidb_tags';

    public $incrementing = false;

    protected $keyType = 'integer';

    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
        'description',
    ];

    public function anime(): BelongsToMany
    {
        return $this->belongsToMany(AnidbAnime::class, 'anidb_anime_tags', 'tag_id', 'anidb_id');
    }
}
