<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Models\UserLibrary;
use App\Services\TmdbService;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Cache;
use App\Jobs\UpdateOrCreateMovieData;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Gate;
use App\Enums\WatchStatus;
use Illuminate\Http\RedirectResponse;

class MovieController extends Controller
{

    public function __construct(
        private readonly TmdbService $tmdbService
    ) {}

    public function show(Request $request, string $id): Response
    {

        $user = $request->user();
        $userLibraryData = $user?->library()
            ->where('media_id', $id)
            ->where('media_type', 'movie')
            ->first();

        $cacheKey = "movie.{$id}";

        if (Cache::has($cacheKey)) {
            return Inertia::render('Content', [
                'movie' => Cache::get($cacheKey),
                'user_library' => $userLibraryData,
                'type' => 'movie'
            ]);
        }

        $existingMovie = Movie::find($id);
        if ($existingMovie) {
            if ($existingMovie->updated_at->lt(now()->subHours(6))) {
                UpdateOrCreateMovieData::dispatch($id);
            }

            Cache::put($cacheKey, $existingMovie->filteredData, now()->addHours(6));

            return Inertia::render('Content', [
                'movie' => $existingMovie->filteredData,
                'user_library' => $userLibraryData,
                'type' => 'movie'

            ]);
        }

        $this->fetchAndStoreMovie($id);
        $movie = Movie::find($id);
        Cache::put($cacheKey, $movie->filteredData, now()->addHours(6));


        return Inertia::render('Content', [
            'movie' => Cache::get($cacheKey),
            'user_library' => fn() => $userLibraryData,
            'type' => 'movie'

        ]);
    }

    public function details(Request $request, string $id)
    {
        $user = $request->user();
        $userLibraryData = $user?->library()
            ->where('media_id', $id)
            ->where('media_type', 'movie')
            ->first();

        $cacheKey = "movie.{$id}";

        if (Cache::has($cacheKey)) {
            return response()->json([
                'movie' => Cache::get($cacheKey),
                'user_library' => $userLibraryData,
                'type' => 'movie'
            ]);
        }

        $existingMovie = Movie::find($id);
        if ($existingMovie) {
            if ($existingMovie->updated_at->lt(now()->subHours(6))) {
                UpdateOrCreateMovieData::dispatch($id);
            }

            Cache::put($cacheKey, $existingMovie->filteredData, now()->addHours(6));

            return response()->json([
                'movie' => $existingMovie->filteredData,
                'user_library' => $userLibraryData,
                'type' => 'movie'
            ]);
        }

        $this->fetchAndStoreMovie($id);
        $movie = Movie::find($id);
        Cache::put($cacheKey, $movie->filteredData, now()->addHours(6));

        return response()->json([
            'movie' => Cache::get($cacheKey),
            'user_library' => $userLibraryData,
            'type' => 'movie'
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

    /**
     * Add a movie to user's library
     */
    public function addToLibrary(Request $request, string $movie_id)
    {
        try {
            if (!$request->user()->hasVerifiedEmail()) {
                return back()->with([
                    "success" => false,
                    "message" => "Please verify your email address before adding entries to your library."
                ]);
            }

            $validated = $request->validate([
                'status' => ['nullable', 'string', 'in:' . implode(',', array_column(WatchStatus::cases(), 'value'))],
                'rating' => ['nullable', 'integer', 'min:1', 'max:10'],
            ]);

            $request->user()->library()->create([
                ...$validated,
                'media_id' => $movie_id,
                'media_type' => 'movie',
                'status' => $validated['status'] ?? 'COMPLETED',
            ]);

            return back()->with([
                'success' => true,
                'message' => "Movie added to library",
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to add movie to library: ' . $e->getMessage());
            return back()->with([
                'success' => false,
                'message' => "An error occurred"
            ]);
        }
    }

    /**
     * Remove from user's library
     */
    public function removeFromLibrary(Request $request, string $movie_id): RedirectResponse
    {
        try {
            $entry = UserLibrary::where('media_id', $movie_id)
                ->where('user_id', $request->user()->id)
                ->where('media_type', 'movie')
                ->firstOrFail();

            if (!Gate::allows('manage-library-entry', $entry)) {
                return back()->with([
                    'success' => false,
                    'message' => 'You do not have permission to delete this library entry.'
                ]);
            }

            $entry->delete();

            return back()->with([
                'success' => true,
                'message' => "Movie removed from library"
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to remove movie from library: ' . $e->getMessage());
            return back()->with([
                'success' => false,
                'message' => "An error occurred"
            ]);
        }
    }

    /**
     * Update or create library entry status
     */
    public function updateStatus(Request $request, string $movie_id): RedirectResponse
    {
        try {

            $entry = UserLibrary::where('media_id', $movie_id)
                ->where('user_id', $request->user()->id)
                ->where('media_type', 'movie')
                ->first();

            if ($entry && !Gate::allows('manage-library-entry', $entry)) {
                return back()->with([
                    'success' => false,
                    'message' => 'You do not have permission to update this library entry.'
                ]);
            }

            $validated = $request->validate([
                'status' => ['required', 'string', 'in:' . implode(',', array_column(WatchStatus::cases(), 'value'))],
            ]);

            $movie = Movie::findOrFail($movie_id);
            $movieTitle = $movie->data['title'] ?? 'Movie';

            $isNewEntry = !$entry;
            $request->user()->library()->updateOrCreate(
                [
                    'media_id' => $movie_id,
                    'media_type' => 'movie',
                ],
                [
                    'status' => $validated['status'],
                ]
            );

            $message = $isNewEntry
                ? "{$movieTitle} added to your library with status: {$validated['status']}"
                : "Updated status for {$movieTitle} to: {$validated['status']}";

            return back()->with([
                'success' => true,
                'message' => $message,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update library status: ' . $e->getMessage());
            return back()->with([
                'success' => false,
                'message' => "An error occurred"
            ]);
        }
    }

    /**
     * Update or create library entry rating
     */
    public function updateRating(Request $request, string $movie_id): RedirectResponse
    {
        try {
            if (!$request->user()->hasVerifiedEmail()) {
                return back()->with([
                    "success" => false,
                    "message" => "Please verify your email address before updating your library."
                ]);
            }

            $entry = UserLibrary::where('media_id', $movie_id)
                ->where('user_id', $request->user()->id)
                ->where('media_type', 'movie')
                ->first();

            if ($entry && !Gate::allows('manage-library-entry', $entry)) {
                return back()->with([
                    'success' => false,
                    'message' => 'You do not have permission to update this library entry.'
                ]);
            }

            $validated = $request->validate([
                'rating' => ['required', 'integer', 'min:1', 'max:10'],
            ]);

            // Get movie title from the database
            $movie = Movie::findOrFail($movie_id);
            $movieTitle = $movie->data['title'] ?? 'Movie';

            // Determine if this is a new entry or update
            $isNewEntry = !$entry;

            $request->user()->library()->updateOrCreate(
                [
                    'media_id' => $movie_id,
                    'media_type' => 'movie',
                ],
                [
                    'rating' => $validated['rating'],
                    'status' => $entry ? $entry->status : WatchStatus::COMPLETED->value,
                ]
            );

            $message = $isNewEntry
                ? "{$movieTitle} added to your library with a rating of {$validated['rating']}"
                : "Updated rating for {$movieTitle} to {$validated['rating']} ";

            return back()->with([
                'success' => true,
                'message' => $message,
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to update rating: ' . $e->getMessage());
            return back()->with([
                'success' => false,
                'message' => "An error occurred"
            ]);
        }
    }
}
