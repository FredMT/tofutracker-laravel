<?php

namespace App\Models\Tmdb;

use App\Models\Movie;
use App\Models\TvShow;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TmdbKeyword extends Model
{
    protected $fillable = [
        'id',
        'name',
    ];

    public $incrementing = false;

    public $timestamps = false;

    public function contentKeywords(): HasMany
    {
        return $this->hasMany(TmdbContentKeyword::class, 'keyword_id');
    }

    public function movies()
    {
        return $this->morphedByMany(Movie::class, 'content', 'tmdb_content_keywords', 'keyword_id');
    }

    public function shows()
    {
        return $this->morphedByMany(TvShow::class, 'content', 'tmdb_content_keywords', 'keyword_id');
    }
}
