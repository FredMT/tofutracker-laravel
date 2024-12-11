<?php

namespace App\Actions\Tv;

use App\Services\TmdbService;

class FetchTvSeasonAction
{
    public function __construct(
        private readonly TmdbService $tmdbService
    ) {}

    public function execute(string $tvId, string $seasonNumber): array
    {
        return $this->tmdbService->getSeason($tvId, $seasonNumber);
    }
}
