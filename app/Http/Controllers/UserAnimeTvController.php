<?php

namespace App\Http\Controllers;

use App\Enums\MediaType;
use App\Enums\WatchStatus;
use App\Models\UserAnimeCollection;
use App\Models\UserLibrary;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use App\Actions\Anime\Plays\DeleteUserAnimeCollectionPlayAction;

class UserAnimeTvController extends Controller
{
    public function __construct(
        private readonly DeleteUserAnimeCollectionPlayAction $deleteAnimeCollectionPlay
    ) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                // Get or create user's anime library
                $library = UserLibrary::firstOrCreate([
                    'user_id' => $request->user()->id,
                    'type' => MediaType::ANIME,
                ]);

                // Create collection for the TV show
                UserAnimeCollection::create([
                    'user_library_id' => $library->id,
                    'map_id' => $validated['map_id'],
                    'watch_status' => WatchStatus::WATCHING,
                ]);

                return back()->with([
                    'success' => true,
                    'message' => "Anime TV show added to your library",
                ]);
            });
        } catch (\Exception $e) {
            logger()->error('Failed to add anime TV show to library: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());
            return back()->with([
                'success' => false,
                'message' => "An error occurred while adding anime TV show to library",
            ]);
        }
    }

    /**
     * Remove an anime TV show from the user's library.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function destroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request): RedirectResponse {
                // Find the collection
                $collection = UserAnimeCollection::where('map_id', $validated['map_id'])
                    ->whereHas('userLibrary', function ($query) use ($request) {
                        $query->where('user_id', $request->user()->id);
                    })
                    ->first();

                if (!$collection) {
                    return back()->with([
                        'success' => false,
                        'message' => 'Anime collection not found in your library.',
                    ]);
                }

                if (Gate::denies('delete-anime-collection', $collection)) {
                    throw new AuthorizationException('You do not own this anime.');
                }

                // Delete all plays and activities first
                $this->deleteAnimeCollectionPlay->execute($collection);

                // Then delete the collection
                $collection->delete();

                return back()->with([
                    'success' => true,
                    'message' => 'Anime removed from your library.',
                ]);
            });
        } catch (AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to remove anime from library: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());
            return back()->with([
                'success' => false,
                'message' => 'An error occurred while removing anime from library.',
            ]);
        }
    }

    /**
     * Rate an anime TV show in the user's library.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function rate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
            'rating' => ['required', 'numeric', 'min:1', 'max:10'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request): RedirectResponse {
                // Find existing collection
                $collection = UserAnimeCollection::where('map_id', $validated['map_id'])
                    ->whereHas('userLibrary', function ($query) use ($request) {
                        $query->where('user_id', $request->user()->id);
                    })
                    ->first();

                // If no collection exists, create new one with rating
                if (!$collection) {
                    if (Gate::denies('rate-anime-collection', null)) {
                        throw new AuthorizationException('You are not authorized to rate this anime.');
                    }

                    $library = UserLibrary::firstOrCreate([
                        'user_id' => $request->user()->id,
                        'type' => MediaType::ANIME,
                    ]);

                    $collection = UserAnimeCollection::create([
                        'user_library_id' => $library->id,
                        'map_id' => $validated['map_id'],
                        'rating' => $validated['rating'],
                        'watch_status' => WatchStatus::WATCHING,
                    ]);

                    return back()->with([
                        'success' => true,
                        'message' => "Anime TV show added to your library with rating",
                    ]);
                }

                // Authorize updating existing collection
                if (Gate::denies('rate-anime-collection', $collection)) {
                    throw new AuthorizationException('You do not own this anime.');
                }

                $collection->update(['rating' => $validated['rating']]);

                return back()->with([
                    'success' => true,
                    'message' => 'Anime rating updated.',
                ]);
            });
        } catch (AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to rate anime: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());
            return back()->with([
                'success' => false,
                'message' => 'An error occurred while rating anime.',
            ]);
        }
    }

    /**
     * Update watch status for an anime TV show.
     *
     * @param Request $request
     * @return RedirectResponse
     */
    public function watch_status(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
            'watch_status' => ['required', Rule::enum(WatchStatus::class)],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request): RedirectResponse {
                // Find existing collection
                $collection = UserAnimeCollection::where('map_id', $validated['map_id'])
                    ->whereHas('userLibrary', function ($query) use ($request) {
                        $query->where('user_id', $request->user()->id);
                    })
                    ->first();

                // If no collection exists, create new one with watch status
                if (!$collection) {
                    if (Gate::denies('update-anime-collection-status', null)) {
                        throw new AuthorizationException('You are not authorized to create this anime collection.');
                    }

                    $library = UserLibrary::firstOrCreate([
                        'user_id' => $request->user()->id,
                        'type' => MediaType::ANIME,
                    ]);

                    $collection = UserAnimeCollection::create([
                        'user_library_id' => $library->id,
                        'map_id' => $validated['map_id'],
                        'watch_status' => $validated['watch_status'],
                    ]);

                    return back()->with([
                        'success' => true,
                        'message' => "Anime TV show added to your library with watch status",
                    ]);
                }

                if (Gate::denies('update-anime-collection-status', $collection)) {
                    throw new AuthorizationException('You do not own this anime.');
                }

                $collection->update(['watch_status' => $validated['watch_status']]);

                return back()->with([
                    'success' => true,
                    'message' => 'Anime watch status updated.',
                ]);
            });
        } catch (AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to update anime watch status: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());
            return back()->with([
                'success' => false,
                'message' => 'An error occurred while updating anime watch status.',
            ]);
        }
    }
}
