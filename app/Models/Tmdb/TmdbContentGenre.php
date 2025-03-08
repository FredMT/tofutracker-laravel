<?php

namespace App\Models\Tmdb;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TmdbContentGenre extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'genre_id',
        'content_type',
        'content_id',
    ];

    public function genre(): BelongsTo
    {
        return $this->belongsTo(Genre::class);
    }

    public function content(): MorphTo
    {
        return $this->morphTo();
    }
}
