<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class TmdbContentProvider extends Model
{
    protected $fillable = [
        'content_type',
        'content_id',
        'provider_id',
        'provider_type',
        'country_code',
    ];

    /**
     * The valid provider types.
     */
    public static $providerTypes = [
        'ads',
        'buy',
        'rent',
        'flatrate',
        'free'
    ];

    public $timestamps = false;

    /**
     * Get the provider that owns this relationship.
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(TmdbProvider::class, 'provider_id');
    }

    /**
     * Get the content model (Movie or TvShow) that this provider is associated with.
     */
    public function content(): MorphTo
    {
        return $this->morphTo();
    }
} 