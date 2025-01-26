<?php

namespace App\Models\UserTv;

use App\Collections\UserTvShowCollection;
use App\Enums\WatchStatus;
use App\Models\TvShow;
use App\Models\User;
use App\Models\UserLibrary;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;

class UserTvShow extends Model
{
    protected $fillable = [
        'user_library_id',
        'user_id',
        'show_id',
        'watch_status',
        'rating',
    ];

    protected $casts = [
        'watch_status' => WatchStatus::class,
        'rating' => 'float',
    ];

    public function userLibrary(): BelongsTo
    {
        return $this->belongsTo(UserLibrary::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function show(): BelongsTo
    {
        return $this->belongsTo(TvShow::class, 'show_id');
    }

    public function seasons(): HasMany
    {
        return $this->hasMany(UserTvSeason::class);
    }

    public function plays(): MorphMany
    {
        return $this->morphMany(UserTvPlay::class, 'playable');
    }

    public function newCollection(array $models = []): UserTvShowCollection
    {
        return new UserTvShowCollection($models);
    }
}
