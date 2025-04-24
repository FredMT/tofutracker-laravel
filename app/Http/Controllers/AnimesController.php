<?php

namespace App\Http\Controllers;

use App\Actions\AnimesPage\GetAiringNowAnimeAction;
use App\Actions\AnimesPage\GetAiringScheduleAction;
use App\Actions\AnimesPage\GetAnimeGenresAction;
use App\Actions\AnimesPage\GetLatestAnimeTrailersAction;
use App\Actions\AnimesPage\GetTrendingAnimesAction;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class AnimesController extends Controller
{
    private GetTrendingAnimesAction $getTrendingAnimesAction;

    private GetAiringNowAnimeAction $getAiringNowAnimeAction;

    private GetAnimeGenresAction $getAnimeGenresAction;

    private GetLatestAnimeTrailersAction $getLatestAnimeTrailersAction;

    private GetAiringScheduleAction $getAiringScheduleAction;

    public function __construct(
        GetTrendingAnimesAction $getTrendingAnimesAction,
        GetAiringNowAnimeAction $getAiringNowAnimeAction,
        GetAnimeGenresAction $getAnimeGenresAction,
        GetLatestAnimeTrailersAction $getLatestAnimeTrailersAction,
        GetAiringScheduleAction $getAiringScheduleAction,
    ) {
        $this->getTrendingAnimesAction = $getTrendingAnimesAction;
        $this->getAiringNowAnimeAction = $getAiringNowAnimeAction;
        $this->getAnimeGenresAction = $getAnimeGenresAction;
        $this->getLatestAnimeTrailersAction = $getLatestAnimeTrailersAction;
        $this->getAiringScheduleAction = $getAiringScheduleAction;
    }

    public function index()
    {
        $trending = $this->getCachedTrendingAnimes();
        $airingNow = $this->getCachedAiringNowAnime();

        return Inertia::render('Animes', [
            'trending' => $trending,
            'airingNow' => $airingNow,
            'genres' => $this->getDeferredAnimeGenres(),
            'trailers' => $this->getCachedDeferredTrailers(),
            'airingSchedule' => $this->getDeferredAiringSchedule(),
        ]);
    }

    public function getCachedTrendingAnimes()
    {
        $cacheTTL = seconds_until('next sunday at 9 am');

        return Cache::remember('animes_page_trending', $cacheTTL, function () {
            return $this->getTrendingAnimesAction->execute();
        });
    }

    public function getCachedAiringNowAnime()
    {
        $cacheTTL = seconds_until('next sunday at 9 am');

        return Cache::remember('animes_page_airing_now', $cacheTTL, function () {
            return $this->getAiringNowAnimeAction->execute();
        });
    }

    public function getDeferredAnimeGenres()
    {
        return Inertia::defer(function () {
            return $this->getAnimeGenresAction->execute();
        });
    }

    public function getCachedDeferredTrailers()
    {
        return Inertia::defer(function () {
            $cacheTTL = seconds_until('next sunday at 9 am');

            return Cache::remember('animes_page_trailers', $cacheTTL, function () {
                return $this->getLatestAnimeTrailersAction->execute();
            });
        });
    }

    public function getDeferredAiringSchedule()
    {
        return Inertia::defer(function () {
            return $this->getAiringScheduleAction->execute();
        });
    }
}
