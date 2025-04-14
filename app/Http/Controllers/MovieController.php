<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Comment\CommentController;
use App\Jobs\UpdateOrCreateMovieData;
use App\Models\Movie;
use App\Models\UserMovie\UserMovie;
use App\Services\TmdbService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

class MovieController extends Controller
{
    public function __construct(
        private readonly TmdbService $tmdbService,
        private readonly CommentController $commentController
    ) {}

    public function show(Request $request, string $id): Response
    {
        $cacheKey = "movie.{$id}";
        $userLibraryData = null;
        $userLists = null;
        $existingMovie = Movie::find($id);
        $color = $existingMovie->getColorPalette();
        $comments = $this->commentController->index($request, 'movie', $id);

        $user = null;
        $configuration = (object) [
            'hide_episode_description' => false,
            'hide_character_name' => false,
            'hide_anime_character_picture' => false,
        ];
        if ($request->user()) {
            $user = $request->user();
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

            $configuration = $user?->configuration->first();
        }

        if (Cache::has($cacheKey)) {
            return Inertia::render('Movie', [
                'data' => Cache::get($cacheKey),
                'navbar_color' => $color,
                'type' => 'movie',
                'user_library' => $userLibraryData,
                'user_lists' => $userLists,
                'comments' => $comments,
                'configuration' => $configuration,
            ]);
        }

        if ($existingMovie) {
            if ($existingMovie->updated_at->lt(now()->subHours(6))) {
                UpdateOrCreateMovieData::dispatch($id);
            }

            return Inertia::render('Movie', [
                'navbar_color' => $color,
                'data' => $existingMovie->filteredData,
                'type' => 'movie',
                'user_library' => $userLibraryData,
                'user_lists' => $userLists,
                'comments' => $comments,
                'configuration' => $configuration,

            ]);
        }

        $this->fetchAndStoreMovie($id);
        $movie = Movie::find($id);
        Cache::put($cacheKey, $movie->filteredData, now()->addHours(6));

        $color = $movie->getColorPalette();

        return Inertia::render('Movie', [
            'navbar_color' => $color,
            'data' => Cache::get($cacheKey),
            'type' => 'movie',
            'user_library' => $userLibraryData,
            'user_lists' => $userLists,
            'comments' => $comments,
            'configuration' => $configuration,

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
