<?php

namespace App\Http\Controllers\UserTv;

use App\Actions\Tv\Plays\DeleteUserTvPlayAction;
use App\Http\Controllers\Controller;
use App\Models\UserTv\UserTvEpisode;
use App\Pipeline\Shared\UpdateShowStatus;
use App\Pipeline\TV\EnsureUserTvLibrary;
use App\Pipeline\TV\EnsureUserTvShow;
use App\Pipeline\UserTvEpisode\CreateUserTvEpisode;
use App\Pipeline\UserTvEpisode\CreateUserTvEpisodePlay;
use App\Pipeline\UserTvEpisode\EnsureTvShowExists;
use App\Pipeline\UserTvEpisode\EnsureUserTvSeason;
use App\Pipeline\UserTvEpisode\UpdateSeasonStatus;
use App\Pipeline\UserTvEpisode\ValidateEpisodeRelations;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Pipeline;

class UserTvEpisodeController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private readonly DeleteUserTvPlayAction $deleteTvPlay
    ) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer'],
            'season_id' => ['required', 'integer'],
            'episode_id' => ['required', 'integer'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                return Pipeline::send([
                    'user' => $request->user(),
                    'validated' => $validated,
                ])
                    ->through([
                        ValidateEpisodeRelations::class,
                        EnsureTvShowExists::class,
                        EnsureUserTvLibrary::class,
                        EnsureUserTvShow::class,
                        EnsureUserTvSeason::class,
                        CreateUserTvEpisode::class,
                        CreateUserTvEpisodePlay::class,
                        UpdateSeasonStatus::class,
                        UpdateShowStatus::class,
                    ])
                    ->then(function ($payload) {
                        return back()->with([
                            'success' => true,
                            'message' => "Episode '{$payload['episode_title']}' added to {$payload['show_title']} in your library",
                        ]);
                    });
            });
        } catch (\Exception $e) {
            logger()->error('Failed to add episode to library: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while adding episode to library',
            ]);
        }
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer'],
            'season_id' => ['required', 'integer'],
            'episode_id' => ['required', 'integer'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                $episode = UserTvEpisode::where([
                    'user_id' => $request->user()->id,
                    'episode_id' => $validated['episode_id'],
                    'show_id' => $validated['show_id'],
                    'season_id' => $validated['season_id'],
                ])->firstOrFail();

                $this->authorize('delete', $episode);

                // Delete plays and activities first
                $this->deleteTvPlay->execute($episode);

                // Then delete the episode
                $episode->delete();

                return back()->with([
                    'success' => true,
                    'message' => 'Episode removed from your library',
                ]);
            });
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->with([
                'success' => false,
                'message' => 'Episode not found in your library',
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => 'You are not authorized to remove this episode',
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to remove episode from library: ' . $e->getMessage());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while removing episode from library',
            ]);
        }
    }
}
