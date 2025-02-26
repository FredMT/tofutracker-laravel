<?php

namespace App\Http\Controllers;

use App\Actions\Tv\TvShowActions;
use App\Http\Controllers\Comment\CommentController;
use App\Models\TvSeason;
use App\Models\TvShow;
use App\Models\UserTv\UserTvSeason;
use App\Services\TmdbService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class TvSeasonController extends Controller
{
    public function __construct(
        private readonly TvShowActions $tvShowActions,
        private readonly TmdbService $tmdbService,
        private readonly CommentController $commentController
    ) {}

    /**
     * Store or retrieve a TV season with async updates and user library data
     */
    public function show(Request $request, string $tvId, string $seasonNumber): Response
    {
        try {
            $cacheKey = "tv_season_{$tvId}_{$seasonNumber}";

            $seasonData = Cache::remember($cacheKey, now()->addMinutes(15), function () use ($tvId, $seasonNumber) {
                $tvShow = $this->tvShowActions->getShowAndQueueUpdateIfNeeded($tvId);
                $season = $this->tvShowActions->getSeasonAndQueueUpdateIfNeeded($tvShow, $seasonNumber);

                return $season->filteredData;
            });
            $seasonId = $seasonData['id'];
            $comments = $this->commentController->index($request, 'tvseason', $seasonId);

            $userLibrary = null;
            $userLists = null;
            if (Auth::check()) {
                $userSeason = UserTvSeason::where([
                    'user_id' => Auth::id(),
                    'season_id' => $seasonData['id'],
                    'show_id' => $seasonData['show_id'],

                ])->first();

                if ($userSeason) {
                    $userLibrary = [
                        'id' => $userSeason->id,
                        'watch_status' => $userSeason->watch_status?->value,
                        'rating' => $userSeason->rating,
                        'episodes' => $userSeason->episodes,
                    ];
                }

                $userLists = $request->user()
                    ->customLists()
                    ->select('id', 'title')
                    ->orderBy('title', 'ASC')
                    ->withExists(['items as has_item' => function ($query) use ($seasonId) {
                        $query->where('listable_type', TvSeason::class)
                            ->where('listable_id', $seasonId);
                    }])
                    ->get();

                if ($userLists->isEmpty()) {
                    $userLists = null;
                }
            }

            $links = $this->generateNavigationLinks($tvId, (int) $seasonNumber);

            return Inertia::render('TVSeason', [
                'data' => $seasonData,
                'user_library' => $userLibrary,
                'user_lists' => $userLists,
                'type' => 'tvseason',
                'links' => $links,
                'comments' => $comments,
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to retrieve TV season: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());

            return $this->tvShowActions->errorResponse($e);
        }
    }

    /**
     * Generate navigation links with names for show and season navigation
     */
    private function generateNavigationLinks(string $tvId, int $seasonNumber): array
    {
        $tvShow = TvShow::with('seasons')->findOrFail($tvId);

        return [
            'show' => [
                'url' => url("/tv/{$tvId}"),
                'name' => $tvShow->title,
            ],
            'seasons' => $tvShow->seasons
                ->sortBy('season_number')
                ->map(function ($season) use ($tvId, $seasonNumber) {
                    return [
                        'url' => url("/tv/{$tvId}/season/{$season->season_number}"),
                        'name' => $season->title,
                        'season_number' => $season->season_number,
                        'is_current' => $season->season_number === $seasonNumber,
                    ];
                })
                ->values()
                ->all(),
        ];
    }
}
