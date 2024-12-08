<?php

namespace App\Http\Controllers;

use App\Models\UserLibrary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Enums\WatchStatus;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class UserLibraryMovieController extends Controller
{
    use AuthorizesRequests;

    /**
     * Get all movie entries from user's library
     */
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', UserLibrary::class);

        $movies = UserLibrary::query()
            ->movies()
            ->visibleTo($request->user())
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $movies,
            'message' => 'Movies retrieved successfully'
        ]);
    }

    /**
     * Get a specific movie entry from user's library
     */
    public function show(Request $request, UserLibrary $movie): JsonResponse
    {
        $this->authorize('view', $movie);

        return response()->json([
            'success' => true,
            'data' => $movie,
            'message' => 'Movie retrieved successfully'
        ]);
    }

    /**
     * Add a movie to user's library
     */
    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', UserLibrary::class);

        $validated = $request->validate([
            'media_id' => ['required', 'integer'],
            'status' => ['required', 'string', 'in:' . implode(',', array_column(WatchStatus::cases(), 'value'))],
            'rating' => ['nullable', 'integer', 'min:1', 'max:10'],
            'is_private' => ['sometimes', 'boolean'],
        ]);

        $movie = $request->user()->library()->create([
            ...$validated,
            'media_type' => 'movie',
            'is_private' => $validated['is_private'] ?? false,
        ]);

        return response()->json([
            'success' => true,
            'data' => $movie,
            'message' => 'Movie added to library successfully'
        ], 201);
    }

    /**
     * Update a movie entry in user's library
     */
    public function update(Request $request, UserLibrary $movie): JsonResponse
    {
        $this->authorize('update', $movie);

        $validated = $request->validate([
            'status' => ['sometimes', 'string', 'in:' . implode(',', array_column(WatchStatus::cases(), 'value'))],
            'rating' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:10'],
            'is_private' => ['sometimes', 'boolean'],
        ]);

        $movie->update($validated);

        return response()->json([
            'success' => true,
            'data' => $movie->fresh(),
            'message' => 'Movie updated successfully'
        ]);
    }

    /**
     * Remove a movie from user's library
     */
    public function destroy(Request $request, UserLibrary $movie): JsonResponse
    {
        $this->authorize('delete', $movie);

        $movie->delete();

        return response()->json([
            'success' => true,
            'data' => null,
            'message' => 'Movie removed from library successfully'
        ]);
    }
}
