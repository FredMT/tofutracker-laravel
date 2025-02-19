<?php

namespace App\Http\Controllers\UserTv;

use App\Actions\UserController\Tv\TvSeason\DeleteUserTvSeasonAction;
use App\Actions\UserController\Tv\TvSeason\RateUserTvSeasonAction;
use App\Actions\UserController\Tv\TvSeason\StoreUserTvSeasonAction;
use App\Actions\UserController\Tv\TvSeason\UpdateWatchStatusUserTvSeasonAction;
use App\Enums\WatchStatus;
use App\Http\Controllers\Controller;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserTvSeasonController extends Controller
{
    use AuthorizesRequests;

    public function store(Request $request, StoreUserTvSeasonAction $storeSeason)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer'],
            'season_id' => ['required', 'integer'],
        ]);

        try {
            $payload = $storeSeason->execute($validated, $request->user());

            return back()->with([
                'success' => true,
                'message' => "Season '{$payload['season_title']}' added to {$payload['show_title']} in your library",
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to add season to library: ' . $e->getMessage());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while adding season to library',
            ]);
        }
    }

    public function destroy(Request $request, DeleteUserTvSeasonAction $deleteSeason)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer'],
            'season_id' => ['required', 'integer'],
        ]);

        try {
            $deleteSeason->execute($request->user()->id, $validated);

            return back()->with([
                'success' => true,
                'message' => 'Season removed from your library',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return back()->with([
                'success' => false,
                'message' => 'Season not found in your library',
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => 'You are not authorized to remove this season',
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to remove season from library: ' . $e->getMessage());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while removing season from library',
            ]);
        }
    }

    public function rate(Request $request, RateUserTvSeasonAction $rateSeason)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer', 'exists:tv_shows,id'],
            'season_id' => ['required', 'integer', 'exists:tv_seasons,id'],
            'rating' => ['required', 'numeric', 'min:1', 'max:10'],
        ]);

        try {
            $result = $rateSeason->execute($request->user()->id, $validated);

            return back()->with([
                'success' => $result['success'],
                'message' => $result['message'],
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => 'You are not authorized to update this season',
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to update season rating: ' . $e->getMessage());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while updating season rating',
            ]);
        }
    }

    public function watch_status(Request $request, UpdateWatchStatusUserTvSeasonAction $updateWatchStatus)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer', 'exists:tv_shows,id'],
            'season_id' => ['required', 'integer', 'exists:tv_seasons,id'],
            'watch_status' => ['required', Rule::enum(WatchStatus::class)],
        ]);

        try {
            $result = $updateWatchStatus->execute($request->user(), $validated);

            return back()->with([
                'success' => $result['success'],
                'message' => $result['message'],
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => 'You are not authorized to update this season',
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to update season watch status: ' . $e->getMessage());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while updating season watch status',
            ]);
        }
    }
}
