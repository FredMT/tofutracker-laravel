<?php

namespace App\Http\Controllers;

use App\Actions\Anime\Plays\DeleteUserAnimePlayAction;
use App\Enums\WatchStatus;
use App\Models\UserAnime;
use App\Pipeline\UserAnime\EnsureUserAnimeLibrary;
use App\Pipeline\UserAnimeSeason\CreateUserAnimeSeason;
use App\Pipeline\UserAnimeSeason\CreateUserAnimeSeasonCollection;
use App\Pipeline\UserAnimeSeason\CreateUserAnimeSeasonEpisodes;
use App\Pipeline\UserAnimeSeason\CreateUserAnimeSeasonWatchStatusCollection;
use App\Pipeline\UserAnimeSeason\UpdateUserAnimeCollectionWatchStatus;
use App\Pipeline\UserAnimeSeason\UpdateUserAnimeSeasonWatchStatus;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Pipeline;
use Illuminate\Validation\Rule;

class UserAnimeSeasonController extends Controller
{
    protected DeleteUserAnimePlayAction $deletePlayAction;

    public function __construct(DeleteUserAnimePlayAction $deletePlayAction)
    {
        $this->deletePlayAction = $deletePlayAction;
    }

    /**
     * Store a new anime season in the user's library.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request): RedirectResponse {
                return Pipeline::send([
                    'user' => $request->user(),
                    'validated' => $validated,
                ])
                    ->through([
                        EnsureUserAnimeLibrary::class,
                        CreateUserAnimeSeasonCollection::class,
                        CreateUserAnimeSeason::class,
                        UpdateUserAnimeCollectionWatchStatus::class,
                    ])
                    ->then(function () {
                        return back()->with([
                            'success' => true,
                            'message' => 'Anime season added to your library',
                        ]);
                    });
            });
        } catch (\Exception $e) {
            logger()->error('Failed to add anime season to library: '.$e->getMessage());
            logger()->error($e->getTraceAsString());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while adding anime season to library',
            ]);
        }
    }

    /**
     * Remove an anime season from the user's library.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request): RedirectResponse {
                // Find the season
                $season = UserAnime::where('anidb_id', $validated['anidb_id'])
                    ->whereHas('collection.userLibrary', function ($query) use ($request) {
                        $query->where('user_id', $request->user()->id);
                    })
                    ->first();

                if (! $season) {
                    return back()->with([
                        'success' => false,
                        'message' => 'Anime season not found in your library.',
                    ]);
                }

                if (Gate::denies('delete-anime-season', $season)) {
                    throw new AuthorizationException('You do not own this season.');
                }

                // Get the collection
                $collection = $season->collection;

                // Delete all play records
                $this->deletePlayAction->executeForSeason($season, $collection);

                // Delete the season
                $season->delete();

                return back()->with([
                    'success' => true,
                    'message' => 'Anime season removed from your library.',
                ]);
            });
        } catch (AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to remove anime season from library: '.$e->getMessage());
            logger()->error($e->getTraceAsString());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while removing anime season from library.',
            ]);
        }
    }

    /**
     * Rate an anime season in the user's library.
     */
    public function rate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
            'rating' => ['required', 'numeric', 'min:1', 'max:10'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request): RedirectResponse {
                // Find existing season
                $season = UserAnime::where('anidb_id', $validated['anidb_id'])
                    ->whereHas('collection.userLibrary', function ($query) use ($request) {
                        $query->where('user_id', $request->user()->id);
                    })
                    ->first();

                // If no season exists, create new one with rating
                if (! $season) {
                    if (Gate::denies('rate-anime', null)) {
                        throw new AuthorizationException('You are not authorized to rate this anime season.');
                    }

                    return Pipeline::send([
                        'user' => $request->user(),
                        'validated' => $validated,
                    ])
                        ->through([
                            EnsureUserAnimeLibrary::class,
                            CreateUserAnimeSeasonCollection::class,
                            CreateUserAnimeSeason::class,
                        ])
                        ->then(function () {
                            return back()->with([
                                'success' => true,
                                'message' => 'Anime season added to your library with rating',
                            ]);
                        });
                }

                // Authorize updating existing season
                if (Gate::denies('rate-anime', $season)) {
                    throw new AuthorizationException('You do not own this anime season.');
                }

                $season->update(['rating' => $validated['rating']]);

                return back()->with([
                    'success' => true,
                    'message' => 'Anime season rating updated.',
                ]);
            });
        } catch (AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to rate anime season: '.$e->getMessage());
            logger()->error($e->getTraceAsString());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while rating anime season.',
            ]);
        }
    }

    /**
     * Update watch status for an anime season.
     */
    public function watch_status(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
            'watch_status' => ['required', 'string', Rule::enum(WatchStatus::class)],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request): RedirectResponse {
                // Find existing season
                $season = UserAnime::where('anidb_id', $validated['anidb_id'])
                    ->whereHas('collection.userLibrary', function ($query) use ($request) {
                        $query->where('user_id', $request->user()->id);
                    })
                    ->first();

                // Check authorization for existing or new season
                if ($season) {
                    if (Gate::denies('update-anime', $season)) {
                        throw new AuthorizationException('You do not own this anime season.');
                    }
                }

                if (Gate::denies('update-anime', null)) {
                    throw new AuthorizationException('You are not authorized to update this anime season.');
                }

                // Use pipeline to handle all operations
                return Pipeline::send([
                    'user' => $request->user(),
                    'validated' => $validated,
                    'season' => $season,
                ])
                    ->through([
                        EnsureUserAnimeLibrary::class,
                        CreateUserAnimeSeasonWatchStatusCollection::class,
                        UpdateUserAnimeSeasonWatchStatus::class,
                        CreateUserAnimeSeasonEpisodes::class,
                        UpdateUserAnimeCollectionWatchStatus::class,
                    ])
                    ->then(function () {
                        return back()->with([
                            'success' => true,
                            'message' => 'Anime season watch status updated.',
                        ]);
                    });
            });
        } catch (AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to update anime season watch status: '.$e->getMessage());
            logger()->error($e->getTraceAsString());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while updating anime season watch status.',
            ]);
        }
    }
}
