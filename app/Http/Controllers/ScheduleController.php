<?php

namespace App\Http\Controllers;

use App\Actions\Schedule\GetFutureAnimeSchedules;
use App\Actions\Schedule\GetTrendingTvShowsWithTvdbId;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    protected GetTrendingTvShowsWithTvdbId $getTrendingTvShowsWithTvdbId;
    protected GetFutureAnimeSchedules $getFutureAnimeSchedules;

    public function __construct(
        GetTrendingTvShowsWithTvdbId $getTrendingTvShowsWithTvdbId,
        GetFutureAnimeSchedules $getFutureAnimeSchedules
    ) {
        $this->getTrendingTvShowsWithTvdbId = $getTrendingTvShowsWithTvdbId;
        $this->getFutureAnimeSchedules = $getFutureAnimeSchedules;
    }

    public function index()
    {
        // $trendingShows = $this->getTrendingTvShowsWithTvdbId->execute();
        // $animeSchedule = $this->getFutureAnimeSchedules->execute();

        // return response()->json([
            // 'trendingShows' => $trendingShows,
            // 'animeSchedule' => $animeSchedule,
            // 'trendingShowsCount' => count($trendingShows),
            // 'futureSchedulesCount' => count($futureSchedules),
        // ], 200, [], JSON_UNESCAPED_UNICODE);

        // return Inertia::render('Schedule', [
        //     'trendingShows' => $trendingShows,
        //     'futureSchedules' => $futureSchedules,
        // ]);
    }
}
