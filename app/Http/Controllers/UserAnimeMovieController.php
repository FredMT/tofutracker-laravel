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

class UserAnimeMovieController extends Controller
{
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

                // Authorize the action
                if (Gate::denies('delete-anime', $userAnime)) {
                    throw new \Illuminate\Auth\Access\AuthorizationException('You do not own this anime.');
                }

                // Get the collection
                $collection = $userAnime->collection;

                // Delete all play records first
                $playRecords = UserAnimePlay::where(function ($query) use ($userAnime) {
                    $query->where('playable_type', UserAnime::class)
                        ->where('playable_id', $userAnime->id);
                })->orWhere(function ($query) use ($collection) {
                    $query->where('playable_type', UserAnimeCollection::class)
                        ->where('playable_id', $collection->id);
                })->get();

                // Delete play records (activity logs will be deleted by model events)
                $playRecords->each->delete();

                // Delete the collection
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
        // 1. Validate request
        $validated = $request->validate([
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
            'watch_status' => ['required', Rule::enum(WatchStatus::class)],
        ]);

        // 2. Verify anime and map relationship
        $anime = AnidbAnime::findOrFail($validated['anidb_id']);
        $mapId = $anime->map();

        if ($mapId !== $validated['map_id']) {
            return back()->with([
                'success' => false,
                'message' => 'Invalid map ID for this anime.',
            ]);
        }

        try {
            // 3. Process watch status update within transaction
            return DB::transaction(function () use ($validated, $request) {
                // Setup initial payload
                $payload = [
                    'user' => $request->user(),
                    'validated' => $validated,
                ];

                // Use simplified pipeline with clear steps
                return Pipeline::send($payload)
                    ->through([
                        function ($payload, $next) {
                            // Step 1: Get or create user's anime library
                            $payload['library'] = UserLibrary::firstOrCreate([
                                'user_id' => $payload['user']->id,
                                'type' => MediaType::ANIME,
                            ]);
                            return $next($payload);
                        },
                        function ($payload, $next) {
                            // Step 2: Try to update existing anime entry
                            $collection = UserAnimeCollection::where('map_id', $payload['validated']['map_id'])
                                ->whereHas('userLibrary', fn($q) => $q->where('user_id', $payload['user']->id))
                                ->first();

                            if ($collection) {
                                $userAnime = UserAnime::where('user_anime_collection_id', $collection->id)
                                    ->where('anidb_id', $payload['validated']['anidb_id'])
                                    ->first();

                                if ($userAnime) {
                                    // Verify ownership
                                    if (Gate::denies('update-anime', $userAnime)) {
                                        throw new AuthorizationException('You do not own this anime.');
                                    }

                                    // Update existing records
                                    $collection->update(['watch_status' => $payload['validated']['watch_status']]);
                                    $userAnime->update(['watch_status' => $payload['validated']['watch_status']]);

                                    // Create play record if status is COMPLETED
                                    if ($payload['validated']['watch_status'] === WatchStatus::COMPLETED->value) {
                                        UserAnimePlay::create([
                                            'playable_id' => $collection->id,
                                            'playable_type' => UserAnimeCollection::class,
                                            'watched_at' => now()
                                        ]);
                                        UserAnimePlay::create([
                                            'playable_id' => $userAnime->id,
                                            'playable_type' => UserAnime::class,
                                            'watched_at' => now()
                                        ]);
                                    }

                                    $payload['collection'] = $collection;
                                    $payload['user_anime'] = $userAnime;
                                    $payload['updated'] = true;
                                }
                            }
                            return $next($payload);
                        },
                        function ($payload, $next) {
                            // Step 3: Create new anime entry if not updated
                            if (!isset($payload['updated'])) {
                                // Create new collection and anime entry
                                $collection = UserAnimeCollection::create([
                                    'user_library_id' => $payload['library']->id,
                                    'map_id' => $payload['validated']['map_id'],
                                    'watch_status' => $payload['validated']['watch_status']
                                ]);

                                $userAnime = UserAnime::create([
                                    'user_anime_collection_id' => $collection->id,
                                    'anidb_id' => $payload['validated']['anidb_id'],
                                    'is_movie' => true,
                                    'watch_status' => $payload['validated']['watch_status']
                                ]);

                                // Create play record only if status is COMPLETED
                                if ($payload['validated']['watch_status'] === WatchStatus::COMPLETED->value) {
                                    UserAnimePlay::create([
                                        'playable_id' => $userAnime->id,
                                        'playable_type' => UserAnime::class,
                                        'watched_at' => now()
                                    ]);
                                    UserAnimePlay::create([
                                        'playable_id' => $collection->id,
                                        'playable_type' => UserAnimeCollection::class,
                                        'watched_at' => now()
                                    ]);
                                }

                                $payload['collection'] = $collection;
                                $payload['user_anime'] = $userAnime;
                            }
                            return $next($payload);
                        },
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
