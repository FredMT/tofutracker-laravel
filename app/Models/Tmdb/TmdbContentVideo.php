<?php

namespace App\Models\Tmdb;

use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TmdbContentVideo extends Pivot
{
    protected $table = 'tmdb_content_videos';

    public $timestamps = false;

    protected $fillable = [
        'content_id',
        'content_type',
        'video_id',
    ];

    /**
     * Get the parent content model (movie or tv show).
     */
    public function content(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get the video associated with the content.
     */
    public function video()
    {
        return $this->belongsTo(TmdbVideo::class, 'video_id');
    }
} 