<?php

namespace App\Http\Controllers\UserTv;

use App\Actions\UserController\Tv\TvShow\CreateUserTvShowAction;
use App\Actions\UserController\Tv\TvShow\DeleteUserTvShowAction;
use App\Actions\UserController\Tv\TvShow\RateUserTvShowAction;
use App\Actions\UserController\Tv\TvShow\UpdateStatusUserTvShowAction;
use App\Enums\WatchStatus;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserTvShowController extends Controller
{
    public function store(Request $request, CreateUserTvShowAction $createUserTvShow)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer', 'exists:tv_shows,id'],
        ]);

        try {
            $payload = $createUserTvShow->execute($validated, $request->user());

            return back()->with([
                'success' => true,
                'message' => "Show '{$payload['show_title']}' added to your library",
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to add show to library: '.$e->getMessage());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while adding show to library',
            ]);
        }
    }

    public function destroy(Request $request, DeleteUserTvShowAction $deleteShow)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer', 'exists:tv_shows,id'],
        ]);

        try {
            $deleteShow->execute($request->user()->id, $validated);

            return back()->with([
                'success' => true,
                'message' => 'Show removed from your library',
            ]);
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

    public function rate(Request $request, RateUserTvShowAction $rateShow)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer'],
            'rating' => ['required', 'numeric', 'min:1', 'max:10'],
        ]);

        try {
            $rateShow->execute($request->user(), $validated);

            return back()->with([
                'success' => true,
                'message' => 'Successfully rated show',
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            logger()->error($e);

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while updating show rating',
            ]);
        }
    }

    public function watch_status(Request $request, UpdateStatusUserTvShowAction $updateStatus)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer', 'exists:tv_shows,id'],
            'watch_status' => ['required', Rule::enum(WatchStatus::class)],
        ]);

        try {
            $result = $updateStatus->execute($request->user(), $validated);

            return back()->with([
                'success' => $result['success'],
                'message' => $result['message'],
            ]);
        } catch (\Illuminate\Auth\Access\AuthorizationException $e) {
            logger()->error($e);

            return back()->with([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            logger()->error($e);
            logger()->error('Failed to update show watch status: '.$e->getTraceAsString());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while updating show watch status',
            ]);
        }
    }
}
