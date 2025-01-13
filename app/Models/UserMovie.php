<?php

namespace App\Models;

use App\Enums\WatchStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserMovie extends Model
{
    protected $fillable = [
        'user_id',
        'movie_id',
        'user_library_id',
        'watch_status',
        'rating',
    ];

    protected $casts = [
        'watch_status' => WatchStatus::class,
        'rating' => 'float',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function movie(): BelongsTo
    {
        return $this->belongsTo(Movie::class);
    }

    public function plays(): HasMany
    {
        return $this->hasMany(UserMoviePlay::class);
    }

    public function userLibrary(): BelongsTo
    {
        return $this->belongsTo(UserLibrary::class);
    }
}
