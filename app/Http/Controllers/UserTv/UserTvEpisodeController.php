<?php

namespace App\Http\Controllers\UserTv;

use App\Actions\UserController\Tv\TvEpisodes\DeleteUserTvEpisodeAction;
use App\Actions\UserController\Tv\TvEpisodes\StoreUserTvEpisodeAction;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class UserTvEpisodeController extends Controller
{
    public function store(Request $request, StoreUserTvEpisodeAction $storeEpisode)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer', 'exists:tv_shows,id'],
            'season_id' => ['required', 'integer', 'exists:tv_seasons,id'],
            'episode_id' => ['required', 'integer', 'exists:tv_episodes,id'],
        ]);

        try {
            $payload = $storeEpisode->execute($validated, $request->user());

            return back()->with([
                'success' => true,
                'message' => "Episode '{$payload['episode_title']}' added to {$payload['show_title']} in your library",
            ]);
        } catch (\Exception $e) {
            logger()->error($e);

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while adding episode to library',
            ]);
        }
    }

    public function destroy(Request $request, DeleteUserTvEpisodeAction $deleteEpisode)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer', 'exists:tv_shows,id'],
            'season_id' => ['required', 'integer', 'exists:tv_seasons,id'],
            'episode_id' => ['required', 'integer', 'exists:tv_episodes,id'],
        ]);

        try {
            $deleteEpisode->execute($request->user()->id, $validated);

            return back()->with([
                'success' => true,
                'message' => 'Episode removed from your library',
            ]);
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
            logger()->error($e);

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while removing episode from library',
            ]);
        }
    }
}
