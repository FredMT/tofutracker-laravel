<?php

namespace App\Http\Controllers;

use App\Actions\Tv\TvShowActions;
use App\Services\TmdbService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class TvSeasonController extends Controller
{
    public function __construct(
        private readonly TvShowActions $tvShowActions,
        private readonly TmdbService $tmdbService
    ) {}

    /**
     * Store or retrieve a TV season with async updates
     */
    public function show(string $tvId, string $seasonNumber): Response
    {
        try {
            $cacheKey = "tv_season_{$tvId}_{$seasonNumber}";

            $seasonData = Cache::remember($cacheKey, now()->addMinutes(15), function () use ($tvId, $seasonNumber) {
                $tvShow = $this->tvShowActions->getShowAndQueueUpdateIfNeeded($tvId);
                $season = $this->tvShowActions->getSeasonAndQueueUpdateIfNeeded($tvShow, $seasonNumber);

                return $season->filteredData;
            });

            return Inertia::render('Content', [
                'tvseason' => $seasonData,
                'user_library' => null,
                'type' => 'tvseason'
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to retrieve TV season: ' . $e->getMessage());
            return $this->tvShowActions->errorResponse($e);
        }
    }
}
