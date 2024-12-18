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
use App\Pipeline\Shared\UpdateShowStatus;
use App\Models\UserTvSeason;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class UserTvSeasonController extends Controller
{
    use AuthorizesRequests;

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
                        EnsureUserTvShow::class,
                        CreateUserTvSeason::class,
                        CreateUserTvEpisodes::class,
                        CreateUserTvSeasonPlay::class,
                        UpdateShowStatus::class,
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
            $season = UserTvSeason::where([
                'user_id' => $request->user()->id,
                'season_id' => $validated['season_id'],
                'show_id' => $validated['show_id'],
            ])->firstOrFail();

            $this->authorize('delete', $season);

            $season->delete();

            return back()->with([
                'success' => true,
                'message' => "Season removed from your library",
            ]);
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
}
