<?php

namespace App\Http\Controllers\UserAnime;

use App\Actions\UserController\Anime\AnimeMovie\DeleteAnimeMovieAction;
use App\Actions\UserController\Anime\AnimeMovie\RateAnimeMovieAction;
use App\Actions\UserController\Anime\AnimeMovie\StoreAnimeMovieAction;
use App\Actions\UserController\Anime\AnimeMovie\UpdateWatchStatusAnimeMovieAction;
use App\Enums\WatchStatus;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserAnimeMovieController extends Controller
{
    public function store(Request $request, StoreAnimeMovieAction $storeAction)
    {
        $validated = $request->validate([
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
        ]);

        try {
            $result = $storeAction->execute($validated, $request->user());

            return back()->with($result);
        } catch (\Exception $e) {
            logger()->error($e);

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while adding anime movie to library',
            ]);
        }
    }

    public function destroy(Request $request, DeleteAnimeMovieAction $deleteAction)
    {
        $validated = $request->validate([
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
        ]);

        try {
            $result = $deleteAction->execute($validated, $request->user());

            return back()->with($result);
        } catch (AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            logger()->error($e);

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while removing anime from library.',
            ]);
        }
    }

    public function rate(Request $request, RateAnimeMovieAction $rateAction)
    {
        $validated = $request->validate([
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
            'rating' => ['required', 'numeric', 'min:1', 'max:10'],
        ]);

        try {
            $result = $rateAction->execute($validated, $request->user());

            return back()->with($result);
        } catch (AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            logger()->error($e);

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while rating anime.',
            ]);
        }
    }

    public function watch_status(Request $request, UpdateWatchStatusAnimeMovieAction $updateWatchStatusAction)
    {
        $validated = $request->validate([
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
            'watch_status' => ['required', Rule::enum(WatchStatus::class)],
        ]);

        try {
            $result = $updateWatchStatusAction->execute($validated, $request->user());

            return back()->with($result);
        } catch (AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            logger()->error($e);

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while updating anime watch status',
            ]);
        }
    }
}
