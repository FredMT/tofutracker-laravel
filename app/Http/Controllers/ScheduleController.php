<?php

namespace App\Http\Controllers;

use App\Actions\Schedule\GetTrendingTvShowsWithTvdbId;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    protected GetTrendingTvShowsWithTvdbId $getTrendingTvShowsWithTvdbId;

    public function __construct(GetTrendingTvShowsWithTvdbId $getTrendingTvShowsWithTvdbId)
    {
        $this->getTrendingTvShowsWithTvdbId = $getTrendingTvShowsWithTvdbId;
    }

    public function index()
    {
        $trendingShows = $this->getTrendingTvShowsWithTvdbId->execute();

        $count = count($trendingShows);

        return response()->json([$trendingShows, $count]);

        // return Inertia::render('Schedule', [
        //     'trendingShows' => $trendingShows,
        // ]);
    }
}
