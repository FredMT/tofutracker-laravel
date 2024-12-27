<?php

namespace App\Models;

use App\Enums\WatchStatus;
use App\Models\TvdbAnimeEpisode;
use Illuminate\Database\Eloquent\Concerns\HasRelationships;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Znck\Eloquent\Relations\BelongsToThrough;

class UserAnimeEpisode extends Model
{
    use \Znck\Eloquent\Traits\BelongsToThrough;

    protected $fillable = [
        'user_anime_id',
        'episode_id',
        'rating',
        'watch_status',
        'is_special'
    ];

    protected $casts = [
        'rating' => 'float',
        'watch_status' => WatchStatus::class,
        'is_special' => 'boolean'
    ];

    protected $hidden = ['created_at', 'updated_at'];

    public function userAnime(): BelongsTo
    {
        return $this->belongsTo(UserAnime::class);
    }

    public function plays(): MorphMany
    {
        return $this->morphMany(UserAnimePlay::class, 'playable');
    }

    public function episode(): BelongsTo
    {
        return $this->belongsTo(TvdbAnimeEpisode::class, 'episode_id');
    }
}
