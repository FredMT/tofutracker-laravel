<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AnidbEpisode extends Model
{
    use HasFactory;

    protected $table = 'anidb_episodes';
    protected $hidden = ['created_at', 'updated_at'];


    protected $fillable = [
        'anime_id',
        'episode_id',
        'episode_number',
        'type',
        'prefix',
        'length',
        'airdate',
        'title_en',
        'title_ja',
        'summary',
        'rating',
        'rating_votes',
        'resource_type',
        'resource_identifier'
    ];

    protected $casts = [
        'airdate' => 'date',
        'rating' => 'decimal:2',
        'rating_votes' => 'integer',
        'length' => 'integer',
        'episode_number' => 'integer'
    ];

    public function anime(): BelongsTo
    {
        return $this->belongsTo(AnidbAnime::class, 'anime_id');
    }
}
