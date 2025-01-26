<?php

namespace App\Models\UserMovie;

use App\Models\Movie;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserMoviePlay extends Model
{
    protected $fillable = [
        'user_movie_id',
        'user_id',
        'movie_id',
        'watched_at',
    ];

    protected $casts = [
        'watched_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function movie(): BelongsTo
    {
        return $this->belongsTo(Movie::class);
    }

    public function userMovie(): BelongsTo
    {
        return $this->belongsTo(UserMovie::class, 'user_movie_id');
    }
}
