<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TmdbProvider extends Model
{
    public $incrementing = false;

    public $timestamps = false;

    protected $fillable = [
        'id', 'name', 'logo_path',
    ];

    /**
     * Get the movies that use this provider.
     */
    public function movies()
    {
        return $this->morphedByMany(Movie::class, 'content', 'tmdb_content_providers', 'provider_id', 'content_id');
    }

    /**
     * Get the TV shows that use this provider.
     */
    public function tvShows()
    {
        return $this->morphedByMany(TvShow::class, 'content', 'tmdb_content_providers', 'provider_id', 'content_id');
    }

    /**
     * Get the provider relationships (includes type and country).
     */
    public function contentProviders(): HasMany
    {
        return $this->hasMany(TmdbContentProvider::class, 'provider_id');
    }

    /**
     * Attach this provider to a content (Movie or TvShow) with provider type and country code.
     *
     * @param  Movie|TvShow  $content  The content to attach the provider to
     * @param  string  $providerType  One of: 'ads', 'buy', 'rent', 'flatrate', 'free'
     * @param  string  $countryCode  Two-letter country code
     * @return TmdbContentProvider
     */
    public function attachToContent($content, string $providerType, string $countryCode)
    {
        // Validate provider type
        if (! in_array($providerType, TmdbContentProvider::$providerTypes)) {
            throw new \InvalidArgumentException("Invalid provider type: {$providerType}");
        }

        // Create the relationship
        return TmdbContentProvider::firstOrCreate([
            'content_type' => get_class($content),
            'content_id' => $content->id,
            'provider_id' => $this->id,
            'provider_type' => $providerType,
            'country_code' => $countryCode,
        ]);
    }
}
