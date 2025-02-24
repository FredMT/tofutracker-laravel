<?php

namespace App\Pipeline\Shared;

use App\Enums\MediaType;
use App\Models\UserLibrary;
use Closure;

class MediaLibraryPipeline
{
    public function __construct(
        private readonly MediaType $mediaType
    ) {}

    /**
     * Create a new instance for TV library pipeline.
     */
    public static function tv(): self
    {
        return new self(MediaType::TV);
    }

    /**
     * Create a new instance for Anime library pipeline.
     */
    public static function anime(): self
    {
        return new self(MediaType::ANIME);
    }

    /**
     * Create a new instance for Movie library pipeline.
     */
    public static function movie(): self
    {
        return new self(MediaType::MOVIE);
    }

    /**
     * Handle the pipeline operation.
     */
    public function __invoke($payload, Closure $next)
    {
        $library = UserLibrary::firstOrCreate([
            'user_id' => $payload['user']->id,
            'type' => $this->mediaType,
        ]);

        $payload['library'] = $library;

        return $next($payload);
    }
}
