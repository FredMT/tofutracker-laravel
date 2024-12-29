<?php

namespace App\Http\Controllers;

use App\Pipeline\TV\EnsureUserTvLibrary;
use App\Pipeline\TV\EnsureUserTvShow;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Pipeline;
use App\Pipeline\UserTvSeason\ValidateSeasonRelations;
use App\Pipeline\UserTvSeason\CreateUserTvSeason;
use App\Pipeline\UserTvSeason\CreateUserTvSeasonPlay;
use App\Pipeline\UserTvSeason\CreateUserTvEpisodes;
use App\Pipeline\UserTvSeason\UpdateWatchStatus;
use App\Pipeline\Shared\UpdateShowStatus;
use App\Models\UserTvSeason;
use App\Models\UserTvShow;
use App\Models\UserLibrary;
use App\Enums\MediaType;
use App\Enums\WatchStatus;
use App\Actions\Tv\Plays\DeleteUserTvSeasonPlayAction;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Gate;
use App\Pipeline\UserTvSeason\InitializeShowStatus;

class UserTvSeasonController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly DeleteUserTvSeasonPlayAction $deleteTvSeasonPlay
    ) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer'],
            'season_id' => ['required', 'integer'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                return Pipeline::send([
                    'user' => $request->user(),
                    'validated' => $validated,
                ])
                    ->through([
                        ValidateSeasonRelations::class,
                        EnsureUserTvLibrary::class,
                        InitializeShowStatus::class,
                        CreateUserTvSeason::class,
                    ])
                    ->then(function ($payload) {
                        return back()->with([
                            'success' => true,
                            'message' => "Season '{$payload['season_title']}' added to {$payload['show_title']} in your library",
                        ]);
                    });
            });
        } catch (\Exception $e) {
            logger()->error('Failed to add season to library: ' . $e->getMessage());
            return back()->with([
                'success' => false,
                'message' => "An error occurred while adding season to library",
            ]);
        }
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer'],
            'season_id' => ['required', 'integer'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                $season = UserTvSeason::where([
                    'user_id' => $request->user()->id,
                    'season_id' => $validated['season_id'],
                    'show_id' => $validated['show_id'],
                ])->firstOrFail();

                $this->authorize('delete', $season);

                // Delete all plays and activities first
                $this->deleteTvSeasonPlay->execute($season);

                // Then delete the season
                $season->delete();

                return back()->with([
                    'success' => true,
                    'message' => "Season removed from your library",
                ]);
            });
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->with([
                'success' => false,
                'message' => "Season not found in your library",
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => "You are not authorized to remove this season",
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to remove season from library: ' . $e->getMessage());
            return back()->with([
                'success' => false,
                'message' => "An error occurred while removing season from library",
            ]);
        }
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer'],
            'season_id' => ['required', 'integer'],
            'rating' => ['required', 'numeric', 'min:1', 'max:10'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                // Try to find existing user season entry
                $userSeason = UserTvSeason::where([
                    'user_id' => $request->user()->id,
                    'season_id' => $validated['season_id'],
                    'show_id' => $validated['show_id'],
                ])->first();

                // If season exists, check authorization and update
                if ($userSeason) {
                    $this->authorize('update', $userSeason);

                    // Check if trying to update to the same rating
                    if ((float) $validated['rating'] === (float) $userSeason->rating) {
                        return back()->with([
                            'success' => false,
                            'message' => "Season already has a rating of {$userSeason->rating}",
                        ]);
                    }

                    $userSeason->update(['rating' => $validated['rating']]);

                    return back()->with([
                        'success' => true,
                        'message' => "Season rating updated successfully",
                    ]);
                }

                // If season doesn't exist, create new entries
                // First, ensure user has a TV library
                $userLibrary = UserLibrary::firstOrCreate([
                    'user_id' => $request->user()->id,
                    'type' => MediaType::TV,
                ]);

                // Then, ensure user has a TV show entry
                $userShow = UserTvShow::firstOrCreate(
                    [
                        'user_id' => $request->user()->id,
                        'show_id' => $validated['show_id'],
                    ],
                    [
                        'user_library_id' => $userLibrary->id,
                    ]
                );

                // Finally, create the season entry with the rating
                UserTvSeason::create([
                    'user_id' => $request->user()->id,
                    'user_tv_show_id' => $userShow->id,
                    'show_id' => $validated['show_id'],
                    'season_id' => $validated['season_id'],
                    'rating' => $validated['rating'],
                ]);

                return back()->with([
                    'success' => true,
                    'message' => "Season added to library with rating",
                ]);
            });
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => "You are not authorized to update this season",
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to update season rating: ' . $e->getMessage());
            return back()->with([
                'success' => false,
                'message' => "An error occurred while updating season rating",
            ]);
        }
    }

    public function watch_status(Request $request)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer'],
            'season_id' => ['required', 'integer'],
            'watch_status' => ['required', Rule::enum(WatchStatus::class)],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                // Try to find existing user season entry
                $userSeason = UserTvSeason::where([
                    'user_id' => $request->user()->id,
                    'season_id' => $validated['season_id'],
                    'show_id' => $validated['show_id'],
                ])->first();

                // Check gate authorization
                if (!Gate::allows('update-season-watch-status', $userSeason)) {
                    throw new \Illuminate\Auth\Access\AuthorizationException();
                }

                // Check if trying to update to the same status
                if ($userSeason && $userSeason->watch_status === WatchStatus::from($validated['watch_status'])) {
                    return back()->with([
                        'success' => false,
                        'message' => "Season is already marked as {$validated['watch_status']}",
                    ]);
                }

                return Pipeline::send([
                    'user' => $request->user(),
                    'validated' => $validated,
                    'user_season' => $userSeason,
                ])
                    ->through([
                        ValidateSeasonRelations::class,
                        EnsureUserTvLibrary::class,
                        EnsureUserTvShow::class,
                        CreateUserTvSeason::class,
                        UpdateWatchStatus::class,
                        UpdateShowStatus::class,
                    ])
                    ->then(function ($payload) {
                        $status = $payload['validated']['watch_status'];
                        return back()->with([
                            'success' => true,
                            'message' => "Season marked as $status",
                        ]);
                    });
            });
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => "You are not authorized to update this season",
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to update season watch status: ' . $e->getMessage());
            return back()->with([
                'success' => false,
                'message' => "An error occurred while updating season watch status",
            ]);
        }
    }
}
