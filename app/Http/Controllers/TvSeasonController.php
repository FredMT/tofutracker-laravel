<?php

namespace App\Http\Controllers;

use App\Actions\Tv\TvShowActions;
use App\Models\UserTvEpisode;
use App\Models\UserTvSeason;
use App\Services\TmdbService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class TvSeasonController extends Controller
{
    public function __construct(
        private readonly TvShowActions $tvShowActions,
        private readonly TmdbService $tmdbService
    ) {}

    /**
     * Store or retrieve a TV season with async updates and user library data
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

            // Get user's library data if authenticated
            $userLibraryData = null;
            if (Auth::check()) {
                $user = Auth::user();

                // Get user's season data
                $userSeason = UserTvSeason::where([
                    'user_id' => $user->id,
                    'season_id' => $seasonData['id'],
                ])->first();

                // Get user's episode data
                $userEpisodes = UserTvEpisode::where([
                    'user_id' => $user->id,
                    'show_id' => $seasonData['show_id'],
                ])
                    ->whereIn('episode_id', collect($seasonData['episodes'])->pluck('id'))
                    ->get()
                    ->keyBy('episode_id');

                // Add user data to season
                $userLibraryData = [
                    'watch_status' => $userSeason?->watch_status,
                    'rating' => $userSeason?->rating,
                    'episodes' => $userEpisodes->map(function ($episode) {
                        return [
                            'id' => $episode->episode_id,
                            'watch_status' => $episode->watch_status,
                            'rating' => $episode->rating,
                        ];
                    })->values()->all(),
                ];
            }

            return Inertia::render('Content', [
                'tvseason' => $seasonData,
                'user_library' => $userLibraryData,
                'type' => 'tvseason'
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to retrieve TV season: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());
            return $this->tvShowActions->errorResponse($e);
        }
    }
}
