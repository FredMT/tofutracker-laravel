<?php

namespace App\Http\Controllers;

use App\Enums\MediaType;
use App\Enums\WatchStatus;
use App\Pipeline\UserAnime\CreateUserAnimeCollection;
use App\Pipeline\UserAnime\CreateUserAnimeMovie;
use App\Pipeline\UserAnime\CreateUserAnimeMoviePlay;
use App\Pipeline\UserAnime\EnsureUserAnimeLibrary;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Pipeline;
use App\Models\AnidbAnime;
use App\Models\UserAnime;
use App\Pipeline\UserAnime\CreateUserAnimeMovieWithWatchStatus;
use App\Pipeline\UserAnime\UpdateUserAnimeMovieWithWatchStatus;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use App\Models\UserLibrary;
use App\Models\UserAnimeCollection;
use App\Models\UserAnimePlay;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Media;
use App\Actions\CreateUserAnimePlayAction;
use App\Actions\DeleteUserAnimePlayAction;
use App\Pipeline\UserAnimeMovie\EnsureUserAnimeMovieLibrary;
use App\Pipeline\UserAnimeMovie\UpdateExistingUserAnimeMovie;
use App\Pipeline\UserAnimeMovie\CreateNewUserAnimeMovie;

class UserAnimeMovieController extends Controller
{
    protected CreateUserAnimePlayAction $createPlayAction;
    protected DeleteUserAnimePlayAction $deletePlayAction;

    public function __construct(
        CreateUserAnimePlayAction $createPlayAction,
        DeleteUserAnimePlayAction $deletePlayAction
    ) {
        $this->createPlayAction = $createPlayAction;
        $this->deletePlayAction = $deletePlayAction;
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
        ]);


        $anime = AnidbAnime::findOrFail($validated['anidb_id']);
        $mapId = $anime->map();


        if ($mapId !== $validated['map_id']) {
            return back()->with([
                'success' => false,
                'message' => 'Invalid map ID for this anime.',
            ]);
        }

        try {
            return DB::transaction(function () use ($validated, $request) {
                return Pipeline::send([
                    'user' => $request->user(),
                    'validated' => $validated,
                ])
                    ->through([
                        EnsureUserAnimeLibrary::class,
                        CreateUserAnimeCollection::class,
                        CreateUserAnimeMovie::class,
                        CreateUserAnimeMoviePlay::class,
                    ])
                    ->then(function () {
                        return back()->with([
                            'success' => true,
                            'message' => "Anime movie added to your library",
                        ]);
                    });
            });
        } catch (\Exception $e) {
            logger()->error('Failed to add anime movie to library: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());
            return back()->with([
                'success' => false,
                'message' => "An error occurred while adding anime movie to library",
            ]);
        }
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                // Verify map_id is related to anidb_id
                $anime = AnidbAnime::findOrFail($validated['anidb_id']);
                $mapId = $anime->map();

                if ($mapId !== $validated['map_id']) {
                    return back()->with([
                        'success' => false,
                        'message' => 'Invalid map ID for this anime.',
                    ]);
                }

                // Find the user's anime entry, scoped to the authenticated user
                $userAnime = UserAnime::whereHas('collection', function ($query) use ($validated, $request) {
                    $query->where('map_id', $validated['map_id'])
                        ->whereHas('userLibrary', function ($query) use ($request) {
                            $query->where('user_id', $request->user()->id);
                        });
                })
                    ->where('anidb_id', $validated['anidb_id'])
                    ->first();

                if (!$userAnime) {
                    return back()->with([
                        'success' => false,
                        'message' => 'Anime not found in your library.',
                    ]);
                }

                if (Gate::denies('delete-anime', $userAnime)) {
                    throw new \Illuminate\Auth\Access\AuthorizationException('You do not own this anime.');
                }

                $collection = $userAnime->collection;

                $this->deletePlayAction->executeMultiple([$userAnime, $collection]);

                $collection->delete();

                return back()->with([
                    'success' => true,
                    'message' => 'Anime removed from your library.',
                ]);
            });
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
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

    public function rate(Request $request)
    {
        $validated = $request->validate([
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
            'rating' => ['required', 'numeric', 'min:1', 'max:10'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {

                $anime = AnidbAnime::findOrFail($validated['anidb_id']);
                $mapId = $anime->map();

                if ($mapId !== (int)$validated['map_id']) {
                    return back()->with([
                        'success' => false,
                        'message' => 'Invalid map ID for this anime.',
                    ]);
                }



                // Find existing anime entry
                $userAnime = UserAnime::whereHas('collection', function ($query) use ($validated, $request) {
                    $query->where('map_id', $validated['map_id'])
                        ->whereHas('userLibrary', function ($query) use ($request) {
                            $query->where('user_id', $request->user()->id);
                        });
                })
                    ->where('anidb_id', $validated['anidb_id'])
                    ->first();

                // If no existing entry, create new one with rating
                if (!$userAnime) {
                    // Authorize creating new entry with rating
                    if (Gate::denies('rate-anime', null)) {
                        throw new \Illuminate\Auth\Access\AuthorizationException('You are not authorized to rate this anime.');
                    }

                    return Pipeline::send([
                        'user' => $request->user(),
                        'validated' => $validated,
                    ])
                        ->through([
                            EnsureUserAnimeLibrary::class,
                            CreateUserAnimeCollection::class,
                            CreateUserAnimeMovie::class,
                            CreateUserAnimeMoviePlay::class,
                        ])
                        ->then(function ($payload) {
                            return back()->with([
                                'success' => true,
                                'message' => "Anime movie added to your library with rating",
                            ]);
                        });
                }

                // Authorize updating existing entry
                if (Gate::denies('rate-anime', $userAnime)) {
                    throw new \Illuminate\Auth\Access\AuthorizationException('You do not own this anime.');
                }

                $userAnime->update(['rating' => $validated['rating']]);

                return back()->with([
                    'success' => true,
                    'message' => 'Anime rating updated.',
                ]);
            });
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
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

    public function watch_status(Request $request)
    {
        $validated = $request->validate([
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
            'watch_status' => ['required', Rule::enum(WatchStatus::class)],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                return Pipeline::send([
                    'user' => $request->user(),
                    'validated' => $validated,
                ])
                    ->through([
                        EnsureUserAnimeMovieLibrary::class,
                        UpdateExistingUserAnimeMovie::class,
                        CreateNewUserAnimeMovie::class,
                    ])
                    ->then(function ($payload) {
                        return back()->with([
                            'success' => true,
                            'message' => "Anime watch status updated successfully",
                        ]);
                    });
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
                'message' => "An error occurred while updating anime watch status",
            ]);
        }
    }
}
