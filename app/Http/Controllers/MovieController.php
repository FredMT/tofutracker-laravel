<?php

namespace App\Http\Controllers;

use App\Jobs\UpdateOrCreateMovieData;
use App\Models\Movie;
use App\Models\UserMovie;
use App\Services\TmdbService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

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

        if ($request->user()) {
            $userLibraryData = UserMovie::where([
                'user_id' => $request->user()->id,
                'movie_id' => $id,
            ])->first();

            $userLists = $request->user()
                ->customLists()
                ->select('id', 'title')
                ->orderBy('title', 'ASC')
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
                'user_library' => $userLibraryData,
                'user_lists' => $userLists,

            ]);
        }

        $this->fetchAndStoreMovie($id);
        $movie = Movie::find($id);
        Cache::put($cacheKey, $movie->filteredData, now()->addHours(6));

        return Inertia::render('Movie', [
            'data' => Cache::get($cacheKey),
            'type' => 'movie',
            'user_library' => $userLibraryData,
            'user_lists' => $userLists,

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

        if (! $etag) {
            logger()->warning("No etag received for movie {$id}");
        }

        Movie::create([
            'id' => $id,
            'data' => $movieData,
            'etag' => $etag,
        ]);
    }
}
