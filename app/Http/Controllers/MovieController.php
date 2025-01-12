<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Services\TmdbService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Cache;
use App\Jobs\UpdateOrCreateMovieData;
use Illuminate\Http\Request;
use App\Models\UserMovie;

class MovieController extends Controller
{

    public function __construct(
        private readonly TmdbService $tmdbService
    ) {}

    public function show(Request $request, string $id): Response
    {

        $cacheKey = "movie.{$id}";
        $userLibraryData = null;
        $userLists = null;

        // Get user library data if authenticated
        if ($request->user()) {
            $userLibraryData = UserMovie::where([
                'user_id' => $request->user()->id,
                'movie_id' => $id
            ])->first();


            $userLists = $request->user()
                ->customLists()
                ->select('id', 'title')
                ->withExists(['items as has_item' => function ($query) use ($id) {
                    $query->where('listable_type', Movie::class)
                          ->where('listable_id', $id);
                }])
                ->get();

            if ($userLists->isEmpty()) {
                $userLists = null;
            }
        }

        if (Cache::has($cacheKey)) {
            return Inertia::render('Movie', [
                'data' => Cache::get($cacheKey),
                'type' => 'movie',
                'user_library' => $userLibraryData,
                'user_lists' => $userLists,
            ]);
        }

        $existingMovie = Movie::find($id);
        if ($existingMovie) {
            if ($existingMovie->updated_at->lt(now()->subHours(6))) {
                UpdateOrCreateMovieData::dispatch($id);
            }


            return Inertia::render('Movie', [
                'data' => $existingMovie->filteredData,
                'type' => 'movie',
                'user_library' => $userLibraryData

            ]);
        }

        $this->fetchAndStoreMovie($id);
        $movie = Movie::find($id);
        Cache::put($cacheKey, $movie->filteredData, now()->addHours(6));


        return Inertia::render('Movie', [
            'data' => Cache::get($cacheKey),
            'type' => 'movie',
            'user_library' => $userLibraryData

        ]);
    }


    private function fetchAndStoreMovie(string $id): void
    {
        $response = $this->tmdbService->getMovie($id);

        if (isset($response['data']['success']) && $response['data']['success'] === false) {
            logger()->error("Failed to fetch movie {$id}: {$response['data']['status_message']}");
            abort(404, $response['data']['status_message'] ?? 'Movie not found');
        }

        $movieData = $response['data'];
        $etag = $response['etag'] ?? null;

        if (!$etag) {
            logger()->warning("No etag received for movie {$id}");
        }

        Movie::create([
            'id' => $id,
            'data' => $movieData,
            'etag' => $etag
        ]);
    }
}
