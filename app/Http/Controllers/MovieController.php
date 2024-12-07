<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Services\TmdbService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use App\Jobs\UpdateOrCreateMovieData;
use Illuminate\Support\Facades\Log;

class MovieController extends Controller
{
    public function __construct(
        private readonly TmdbService $tmdbService
    ) {}

    public function show(string $id): Response
    {
        $cacheKey = "movie.{$id}";

        if (Cache::has($cacheKey)) {
            Log::info("Returning cached movie data for {$id}");
            return Inertia::render('Movie', [
                'movie' => Cache::get($cacheKey)
            ]);
        }


        $existingMovie = Movie::find($id);
        if ($existingMovie) {
            Log::info("Movie {$id} found in database");
            if ($existingMovie->updated_at->lt(now()->subHours(6))) {
                Log::info("Attempting update for movie {$id} ");
                UpdateOrCreateMovieData::dispatch($id);
            }

            Cache::put($cacheKey, $existingMovie->filteredData, now()->addHours(6));
            Log::info("Adding movie {$id} to cache");

            return Inertia::render('Movie', [
                'movie' => $existingMovie->filteredData
            ]);
        }

        Log::info("Movie {$id} not found in database, fetching from TMDB");

        $this->fetchAndStoreMovie($id);
        $movie = Movie::find($id);
        Cache::put($cacheKey, $movie->filteredData, now()->addHours(6));

        return Inertia::render('Movie', [
            'movie' => Cache::get($cacheKey)
        ]);
    }



    private function fetchAndStoreMovie(string $id): void
    {
        $response = $this->tmdbService->getMovie($id);

        if (isset($response['data']['success']) && $response['data']['success'] === false) {
            Log::error("Failed to fetch movie {$id}: {$response['data']['status_message']}");
            abort(404, $response['data']['status_message'] ?? 'Movie not found');
        }

        Log::info("Fetched movie {$id} from TMDB");

        $movieData = $response['data'];
        $etag = $response['etag'] ?? null;

        if (!$etag) {
            Log::warning("No etag received for movie {$id}");
        }

        Movie::create([
            'id' => $id,
            'data' => $movieData,
            'etag' => $etag
        ]);
    }

    public function genres(string $id): JsonResponse
    {
        $movie = Movie::findOrFail($id);

        return response()->json([
            'genres' => $movie->genres,
            'movie_title' => $movie->data['title'] ?? null
        ]);
    }

    public function logos(string $id): JsonResponse
    {
        $movie = Movie::findOrFail($id);

        return response()->json([
            'logos' => $movie->logos,
            'movie_title' => $movie->data['title'] ?? null
        ]);
    }

    public function backdrops(string $id): JsonResponse
    {
        $movie = Movie::findOrFail($id);

        return response()->json([
            'backdrops' => $movie->backdrops,
            'movie_title' => $movie->data['title'] ?? null
        ]);
    }

    public function posters(string $id): JsonResponse
    {
        $movie = Movie::findOrFail($id);

        return response()->json([
            'posters' => $movie->posters,
            'movie_title' => $movie->data['title'] ?? null
        ]);
    }

    public function credits(string $id): JsonResponse
    {
        $movie = Movie::findOrFail($id);

        return response()->json([
            'cast' => $movie->cast,
            'crew' => $movie->crew,
            'movie_title' => $movie->data['title'] ?? null
        ]);
    }

    public function allGenres(): JsonResponse
    {
        $genres = DB::table('movies')
            ->whereNotNull('data->genres')
            ->get()
            ->flatMap(function ($movie) {
                return json_decode($movie->data, true)['genres'] ?? [];
            })
            ->unique('id')
            ->sortBy('name')
            ->values();

        return response()->json([
            'genres' => $genres,
            'total' => $genres->count()
        ]);
    }
}
