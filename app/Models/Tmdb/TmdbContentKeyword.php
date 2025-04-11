<?php

namespace App\Models\Tmdb;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TmdbContentKeyword extends Model
{
    protected $fillable = [
        'keyword_id',
        'content_type',
        'content_id',
    ];

    public $timestamps = false;

    public function keyword(): BelongsTo
    {
        return $this->belongsTo(TmdbKeyword::class, 'keyword_id');
    }

    public function content(): MorphTo
    {
        return $this->morphTo();
    }
}
