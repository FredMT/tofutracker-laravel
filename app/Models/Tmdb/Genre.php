<?php

namespace App\Models\Tmdb;

use App\Models\Movie;
use App\Models\TvShow;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Genre extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'id',
        'name',
    ];

    public function contentGenres(): HasMany
    {
        return $this->hasMany(TmdbContentGenre::class);
    }

    public function movies()
    {
        return $this->morphedByMany(Movie::class, 'content', 'tmdb_content_genres', 'genre_id');
    }

    public function shows()
    {
        return $this->morphedByMany(TvShow::class, 'content', 'tmdb_content_genres', 'genre_id');
    }
}
