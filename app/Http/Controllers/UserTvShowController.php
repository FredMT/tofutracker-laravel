<?php

namespace App\Http\Controllers;

use App\Actions\Tv\Plays\CreateUserTvShowPlayAction;
use App\Actions\Tv\Plays\DeleteUserTvShowPlayAction;
use App\Enums\WatchStatus;
use App\Models\UserTvShow;
use App\Pipeline\TV\EnsureUserTvLibrary;
use App\Pipeline\UserMovie\EnsureUserLibrary;
use App\Pipeline\UserTvEpisode\EnsureTvShowExists;
use App\Pipeline\UserTvShow\CompleteShow;
use App\Pipeline\UserTvShow\CreateUserTvShow;
use App\Pipeline\UserTvShow\CreateUserTvShowForRating;
use App\Pipeline\UserTvShow\CreateUserTvShowWithStatus;
use App\Pipeline\UserTvShow\EnsureShowExists;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Pipeline;
use Illuminate\Validation\Rule;

class UserTvShowController extends Controller
{
    public function __construct(
        private readonly DeleteUserTvShowPlayAction $deleteTvShowPlay,
        private readonly CreateUserTvShowPlayAction $createTvShowPlay
    ) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                return Pipeline::send([
                    'user' => $request->user(),
                    'validated' => $validated,
                ])
                    ->through([
                        EnsureTvShowExists::class,
                        EnsureUserTvLibrary::class,
                        CreateUserTvShow::class,
                    ])
                    ->then(function ($payload) {
                        return back()->with([
                            'success' => true,
                            'message' => "Show '{$payload['show_title']}' added to your library",
                        ]);
                    });
            });
        } catch (\Exception $e) {
            logger()->error('Failed to add show to library: '.$e->getMessage());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while adding show to library',
            ]);
        }
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                $userShow = UserTvShow::where([
                    'user_id' => $request->user()->id,
                    'show_id' => $validated['show_id'],
                ])->firstOrFail();

                if (Gate::denies('delete-tv-show', $userShow)) {
                    throw new \Illuminate\Auth\Access\AuthorizationException('You do not own this TV show.');
                }

                // Delete all plays and activities first
                $this->deleteTvShowPlay->execute($userShow);

                // Then delete the show
                $userShow->delete();

                return back()->with([
                    'success' => true,
                    'message' => 'Show removed from your library',
                ]);
            });
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->with([
                'success' => false,
                'message' => 'Show not found in your library',
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to remove show from library: '.$e->getMessage());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while removing show from library',
            ]);
        }
    }

    public function rate(Request $request)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer'],
            'rating' => ['required', 'numeric', 'min:1', 'max:10'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                // Try to find existing user show entry
                $userShow = UserTvShow::where([
                    'user_id' => $request->user()->id,
                    'show_id' => $validated['show_id'],
                ])->first();

                if (Gate::denies('rate-tv-show', $userShow)) {
                    throw new \Illuminate\Auth\Access\AuthorizationException('You do not own this TV show.');
                }

                // If show exists, check if trying to update to the same rating
                if ($userShow && (float) $validated['rating'] === (float) $userShow->rating) {
                    return back()->with([
                        'success' => false,
                        'message' => "Show already has a rating of {$userShow->rating}",
                    ]);
                }

                if (! $userShow) {
                    // If show doesn't exist, create new entries
                    return Pipeline::send([
                        'user' => $request->user(),
                        'validated' => $validated,
                    ])
                        ->through([
                            EnsureTvShowExists::class,
                            EnsureUserTvLibrary::class,
                            CreateUserTvShowForRating::class,
                        ])
                        ->then(function ($payload) {
                            return back()->with([
                                'success' => true,
                                'message' => "Show '{$payload['show_title']}' rated successfully",
                            ]);
                        });
                }

                // Update the rating
                $userShow->update(['rating' => $validated['rating']]);

                return back()->with([
                    'success' => true,
                    'message' => 'Show rating updated successfully',
                ]);
            });
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to rate show: '.$e->getMessage());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while rating show',
            ]);
        }
    }

    public function watch_status(Request $request)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer'],
            'watch_status' => ['required', Rule::enum(WatchStatus::class)],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                $userShow = UserTvShow::where([
                    'user_id' => $request->user()->id,
                    'show_id' => $validated['show_id'],
                ])->first();

                if (Gate::denies('update-tv-show-status', $userShow)) {
                    throw new \Illuminate\Auth\Access\AuthorizationException('You do not own this TV show.');
                }

                // If show exists
                if ($userShow) {
                    $watchStatus = WatchStatus::from($validated['watch_status']);

                    // Prevent updating to same status
                    if ($userShow->watch_status === $watchStatus) {
                        return back()->with([
                            'success' => false,
                            'message' => "Show already has watch status of {$watchStatus->value}",
                        ]);
                    }

                    // If marking as completed
                    if ($watchStatus === WatchStatus::COMPLETED) {
                        // Update status first
                        $userShow->update(['watch_status' => $watchStatus]);

                        // Create play record and activity
                        $this->createTvShowPlay->execute($userShow);

                        return back()->with([
                            'success' => true,
                            'message' => 'Show marked as completed',
                        ]);
                    }

                    // For other statuses
                    $userShow->update(['watch_status' => $watchStatus]);

                    return back()->with([
                        'success' => true,
                        'message' => 'Show watch status updated',
                    ]);
                }

                // If show doesn't exist
                $watchStatus = WatchStatus::from($validated['watch_status']);

                if ($watchStatus === WatchStatus::COMPLETED) {
                    // Create show and complete everything
                    $result = Pipeline::send([
                        'user' => $request->user(),
                        'library' => $request->user()->library,
                        'validated' => $validated,
                    ])
                        ->through([
                            EnsureShowExists::class,
                            CreateUserTvShowWithStatus::class,
                            CompleteShow::class,
                        ])
                        ->thenReturn();

                    // Create play record and activity for the new show
                    if (isset($result['user_show'])) {
                        $this->createTvShowPlay->execute($result['user_show']);
                    }

                    return back()->with([
                        'success' => true,
                        'message' => "Show '{$result['show_title']}' added and marked as completed",
                    ]);
                }

                // For other statuses, just create the show
                return Pipeline::send([
                    'user' => $request->user(),
                    'validated' => $validated,
                ])
                    ->through([
                        EnsureUserLibrary::class,
                        EnsureShowExists::class,
                        CreateUserTvShowWithStatus::class,
                    ])
                    ->then(function ($payload) {
                        return back()->with([
                            'success' => true,
                            'message' => "Show '{$payload['show_title']}' added with status {$payload['watch_status']->value}",
                        ]);
                    });
            });
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to update show watch status: '.$e->getTraceAsString());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while updating show watch status',
            ]);
        }
    }
}
