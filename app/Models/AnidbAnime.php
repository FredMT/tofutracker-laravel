<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class AnidbAnime extends Model
{
    use HasFactory;

    protected $table = 'anidb_anime';

    protected $fillable = [
        'id',
        'type',
        'episode_count',
        'startdate',
        'enddate',
        'title_main',
        'title_en',
        'title_ja',
        'title_ko',
        'title_zh',
        'homepage',
        'description',
        'rating',
        'rating_count',
        'picture'
    ];

    protected $casts = [
        'startdate' => 'date',
        'enddate' => 'date',
        'rating' => 'decimal:2',
        'rating_count' => 'integer',
        'episode_count' => 'integer'
    ];

    public function characters(): HasMany
    {
        return $this->hasMany(AnidbCharacter::class, 'anime_id');
    }

    public function episodes(): HasMany
    {
        return $this->hasMany(AnidbEpisode::class, 'anime_id');
    }

    public function relatedAnime(): HasMany
    {
        return $this->hasMany(AnidbRelatedAnime::class, 'anime_id');
    }

    public function similarAnime(): HasMany
    {
        return $this->hasMany(AnidbSimilarAnime::class, 'anime_id');
    }

    public function creators(): HasMany
    {
        return $this->hasMany(AnidbCreator::class, 'anime_id');
    }

    public function externalLinks(): HasMany
    {
        return $this->hasMany(AnidbExternalLink::class, 'anime_id');
    }
}
