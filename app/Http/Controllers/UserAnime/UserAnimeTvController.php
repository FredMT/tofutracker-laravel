<?php

namespace App\Http\Controllers\UserAnime;

use App\Actions\UserController\Anime\AnimeTv\DestroyAnimeTvAction;
use App\Actions\UserController\Anime\AnimeTv\RateAnimeTvAction;
use App\Actions\UserController\Anime\AnimeTv\StoreAnimeTvAction;
use App\Actions\UserController\Anime\AnimeTv\UpdateWatchStatusAnimeTvAction;
use App\Enums\WatchStatus;
use App\Http\Controllers\Controller;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserAnimeTvController extends Controller
{
    public function store(Request $request, StoreAnimeTvAction $storeAction)
    {
        $validated = $request->validate([
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
        ]);

        try {
            $result = $storeAction->execute($validated, $request->user());
            return back()->with($result);
        } catch (\Exception $e) {
            logger()->error('Failed to add anime TV show to library: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while adding anime TV show to library',
            ]);
        }
    }

    /**
     * Remove an anime TV show from the user's library.
     */
    public function destroy(Request $request, DestroyAnimeTvAction $destroyAction): RedirectResponse
    {
        $validated = $request->validate([
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
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
            logger()->error('Failed to remove anime from library: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while removing anime from library.',
            ]);
        }
    }

    /**
     * Rate an anime TV show in the user's library.
     */
    public function rate(Request $request, RateAnimeTvAction $rateAction): RedirectResponse
    {
        $validated = $request->validate([
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
            logger()->error('Failed to rate anime: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while rating anime.',
            ]);
        }
    }

    /**
     * Update watch status for an anime TV show.
     */
    public function watch_status(Request $request, UpdateWatchStatusAnimeTvAction $updateWatchStatusAction): RedirectResponse
    {
        $validated = $request->validate([
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
            logger()->error('Failed to update anime watch status: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());

            return back()->with([
                'success' => false,
                'message' => 'An error occurred while updating anime watch status.',
            ]);
        }
    }
}
