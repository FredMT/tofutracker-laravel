<?php

namespace App\Models\Tmdb;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphToMany;

class TmdbVideo extends Model
{
    protected $table = 'tmdb_videos';

    public $timestamps = false; // Disable default timestamps
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id',
        'key',
        'name',
        'site',
        'size',
        'type',
        'official',
        'iso_639_1',
        'iso_3166_1',
        'published_at',
    ];

    protected $casts = [
        'official' => 'boolean',
        'published_at' => 'datetime',
        'size' => 'integer',
    ];

    /**
     * Get all of the content (movies/tv shows) that are assigned this video.
     */
    public function contents(): MorphToMany
    {
        // Determine possible content types dynamically or list them explicitly
        // For now, assuming Movie and TvShow are the only types
        return $this->morphedByMany(\App\Models\Movie::class, 'content', 'tmdb_content_videos', 'video_id', 'content_id')
                    ->withPivot('content_type')
                    ->union($this->morphedByMany(\App\Models\TvShow::class, 'content', 'tmdb_content_videos', 'video_id', 'content_id')
                    ->withPivot('content_type'));
    }
} 