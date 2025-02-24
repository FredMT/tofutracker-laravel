<?php

namespace App\Http\Controllers\UserAnime;

use App\Actions\UserController\Anime\AnimeSeason\DestroyAnimeSeasonAction;
use App\Actions\UserController\Anime\AnimeSeason\RateAnimeSeasonAction;
use App\Actions\UserController\Anime\AnimeSeason\StoreAnimeSeasonAction;
use App\Actions\UserController\Anime\AnimeSeason\UpdateWatchStatusAnimeSeasonAction;
use App\Enums\WatchStatus;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserAnimeSeasonController extends Controller
{
    /**
     * Store a new anime season in the user's library.
     */
    public function store(Request $request, StoreAnimeSeasonAction $storeAction): RedirectResponse
    {
        $validated = $request->validate([
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
        ]);

        try {
            $result = $storeAction->execute($validated, $request->user());
            return back()->with($result);
        } catch (\Exception $e) {
            logger()->error('Failed to add anime season to library: ' . $e->getMessage());
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
    public function destroy(Request $request, DestroyAnimeSeasonAction $destroyAction): RedirectResponse
    {
        $validated = $request->validate([
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
        ]);

        try {
            $result = $destroyAction->execute($validated, $request->user());
            return back()->with($result);
        } catch (AuthorizationException $e) {
            return back()->with([
                'success' => false,
                'message' => $e->getMessage(),
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to remove anime season from library: ' . $e->getMessage());
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
    public function rate(Request $request, RateAnimeSeasonAction $rateAction): RedirectResponse
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
            logger()->error('Failed to rate anime season: ' . $e->getMessage());
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
    public function watch_status(Request $request, UpdateWatchStatusAnimeSeasonAction $updateWatchStatusAction): RedirectResponse
    {
        $validated = $request->validate([
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
            'watch_status' => ['required', 'string', Rule::enum(WatchStatus::class)],
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
            logger()->error('Failed to update anime season watch status: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while updating anime season watch status.',
            ]);
        }
    }
}
