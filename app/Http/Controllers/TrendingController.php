<?php

namespace App\Http\Controllers;

use App\Jobs\FetchMovieDetails;
use App\Jobs\FetchTvDetails;
use App\Services\TmdbService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class TrendingController extends Controller
{
    public function __construct(
        private readonly TmdbService $tmdbService
    ) {}

    public function index(): JsonResponse
    {
        $trending = $this->tmdbService->getTrendingAll();

        // Dispatch jobs for each movie and TV show
        foreach ($trending['movies'] as $movie) {
            if (!cache()->has("movie.{$movie['id']}")) {
                FetchMovieDetails::dispatch($movie['id']);
            }
        }

        foreach ($trending['tv'] as $show) {
            if (!cache()->has("tv.{$show['id']}")) {
                FetchTvDetails::dispatch($show['id']);
            }
        }

        // Return basic data immediately
        return response()->json([
            'message' => 'Details are being fetched in the background',
            'data' => $trending
        ]);
    }

    public function getDetails(): JsonResponse
    {
        $trending = $this->tmdbService->getTrendingAll();

        $detailedMovies = collect($trending['movies'])->map(function ($movie) {
            return cache()->get("movie.{$movie['id']}", $movie);
        });

        $detailedTv = collect($trending['tv'])->map(function ($show) {
            return cache()->get("tv.{$show['id']}", $show);
        });

        return response()->json([
            'movies' => $detailedMovies,
            'tv' => $detailedTv
        ]);
    }
}
