<?php

namespace App\Http\Controllers\UserCustomList;

use App\Actions\Activity\CreateUserActivityAction;
use App\Http\Controllers\Controller;
use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeEpisodeMapping;
use App\Models\Anime\AnimeMap;
use App\Models\Movie;
use App\Models\TvEpisode;
use App\Models\TvSeason;
use App\Models\TvShow;
use App\Models\UserCustomList\UserCustomList;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class UserCustomListItemController extends Controller
{
    public function __construct(
        private readonly CreateUserActivityAction $createActivity
    ) {}

    private function getListableModel(string $type, int $id)
    {
        return match ($type) {
            'movie' => Movie::findOrFail($id),
            'tv' => TvShow::findOrFail($id),
            'tvseason' => TvSeason::findOrFail($id),
            'tvepisode' => TvEpisode::findOrFail($id),
            'animemovie', 'animetv' => AnimeMap::findOrFail($id),
            'animeseason' => AnidbAnime::findOrFail($id),
            'animeepisode' => AnimeEpisodeMapping::findOrFail($id),
            default => throw new \InvalidArgumentException('Invalid item type'),
        };
    }

    private function getListableType(string $type)
    {
        return match ($type) {
            'movie' => Movie::class,
            'tv' => TvShow::class,
            'tvseason' => TvSeason::class,
            'tvepisode' => TvEpisode::class,
            'animemovie', 'animetv' => AnimeMap::class,
            'animeseason' => AnidbAnime::class,
            'animeepisode' => AnimeEpisodeMapping::class,
            default => throw new \InvalidArgumentException('Invalid item type'),
        };
    }

    public function store(Request $request)
    {
        try {
            $list = UserCustomList::findOrFail($request->list_id);

            if (! $list) {
                return back()->with('error', 'List not found');
            }

            Gate::authorize('manage-custom-list-item', $list);

            $validated = $request->validate([
                'item_id' => 'required|integer',
                'item_type' => 'required|string|in:movie,tv,tvseason,tvepisode,animemovie,animetv,animeseason,animeepisode',
            ]);

            $model = $this->getListableModel($validated['item_type'], $validated['item_id']);

            if (! $model) {
                return back()->with('error', 'Item not found');
            }

            $listableType = $this->getListableType($validated['item_type']);

            $exists = $list->items()
                ->where('listable_type', $listableType)
                ->where('listable_id', $validated['item_id'])
                ->exists();

            if ($exists) {
                return back()->with('error', 'Item already exists in list');
            }

            $maxSortOrder = $list->items()->max('sort_order') ?? 0;

            $listItem = $list->items()->create([
                'custom_list_id' => $request->list_id,
                'listable_type' => $listableType,
                'listable_id' => $validated['item_id'],
                'sort_order' => $maxSortOrder + 1,
            ]);

            $this->createActivity->execute(
                userId: $request->user()->id,
                activityType: 'list_item_add',
                subject: $listItem
            );

            $list->touch();

            return back()->with(['success' => true, 'message' => 'Item added to list successfully']);
        } catch (\Exception $e) {
            logger()->error($e->getMessage());
            \Sentry\captureException($e);

            return back()->with(['success' => false, 'message' => 'Failed to add item to list']);
        }
    }

    public function destroy(Request $request, int $list_id)
    {
        $validated = $request->validate([
            'item_id' => 'required|integer',
            'item_type' => 'required|string|in:movie,tv,tvseason,tvepisode,animemovie,animetv,animeseason,animeepisode',
        ]);

        $list = UserCustomList::findOrFail($list_id);

        Gate::authorize('manage-custom-list-item', $list);

        try {
            $listableType = $this->getListableType($validated['item_type']);

            $item = $list->items()
                ->where('listable_type', $listableType)
                ->where('listable_id', $validated['item_id'])
                ->first();

            if (! $item) {
                return back()->with(['success' => false, 'message' => 'Item not found in list']);
            }

            // Delete activity for the removed item
            $this->createActivity->deleteForSubject($item);

            $item->delete();

            return back()->with(['success' => true, 'message' => 'Item removed from list successfully']);
        } catch (\Exception $e) {
            logger()->error($e->getMessage());
            \Sentry\captureException($e);

            return back()->with(['success' => false, 'message' => 'Failed to remove item from list']);
        }
    }
}
