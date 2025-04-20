<?php

namespace App\Http\Controllers;

use App\Actions\AnimesPage\Genres\MechaAction;
use App\Actions\AnimesPage\Genres\SchoolRomcomAction;
use App\Actions\AnimesPage\GetAiringNowAnimeAction;
use App\Actions\AnimesPage\GetAnimeGenresAction;
use App\Actions\AnimesPage\GetTrendingAnimesAction;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class AnimesController extends Controller
{
    private GetTrendingAnimesAction $getTrendingAnimesAction;

    private SchoolRomcomAction $schoolRomcomAction;

    private MechaAction $mechaAction;

    private GetAiringNowAnimeAction $getAiringNowAnimeAction;

    private GetAnimeGenresAction $getAnimeGenresAction;

    public function __construct(
        GetTrendingAnimesAction $getTrendingAnimesAction,
        SchoolRomcomAction $schoolRomcomAction,
        MechaAction $mechaAction,
        GetAiringNowAnimeAction $getAiringNowAnimeAction,
        GetAnimeGenresAction $getAnimeGenresAction,
    ) {
        $this->getTrendingAnimesAction = $getTrendingAnimesAction;
        $this->schoolRomcomAction = $schoolRomcomAction;
        $this->mechaAction = $mechaAction;
        $this->getAiringNowAnimeAction = $getAiringNowAnimeAction;
        $this->getAnimeGenresAction = $getAnimeGenresAction;
    }

    public function index()
    {
        $trending = $this->getCachedTrendingAnimes();
        $airingNow = $this->getCachedAiringNowAnime();

        return Inertia::render('Animes', [
            'trending' => $trending,
            'airingNow' => $airingNow,
            'genres' => $this->getDeferredAnimeGenres(),
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

    public function schoolRomcom(): JsonResponse
    {
        $result = $this->schoolRomcomAction->execute();

        return response()->json($result);
    }

    public function mecha(): JsonResponse
    {
        $result = $this->mechaAction->execute();

        return response()->json($result);
    }
}
