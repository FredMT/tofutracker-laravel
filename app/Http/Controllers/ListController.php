<?php

namespace App\Http\Controllers;

use App\Models\AnidbAnime;
use App\Models\AnimeMap;
use App\Models\Movie;
use App\Models\TvSeason;
use App\Models\TvShow;
use App\Models\UserCustomList;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class ListController extends Controller
{
    public function show(UserCustomList $list): Response
    {
        if (! $list->is_public && (! Auth::check() || Auth::id() !== $list->user_id)) {
            abort(404);
        }

        $list->load(['user', 'items.listable']);

        $items = $list->items->map(function ($item) {
            $poster = null;
            $posterType = 'tmdb';
            $title = null;
            $year = null;
            $voteAverage = null;
            $link = null;
            $baseUrl = config('app.env') === 'local' ? 'http://localhost:8000' : 'https://tofutracker.com';

            switch ($item->listable_type) {
                case Movie::class:
                    $poster = $item->listable?->poster;
                    $title = $item->listable?->title;
                    $year = $item->listable?->year;
                    $voteAverage = $item->listable?->voteAverage;
                    $link = $baseUrl.'/movie/'.$item->listable?->id;
                    break;

                case TvShow::class:
                    $poster = $item->listable?->poster;
                    $title = $item->listable?->title;
                    $year = $item->listable?->year;
                    $voteAverage = $item->listable?->voteAverage;
                    $link = $baseUrl.'/tv/'.$item->listable?->id;
                    break;

                case TvSeason::class:
                    $poster = $item->listable?->poster;
                    $title = $item->listable?->title;
                    $year = $item->listable?->year;
                    $voteAverage = $item->listable?->voteAverage;
                    if ($item->listable && $item->listable->show) {
                        $link = $baseUrl.'/tv/'.$item->listable->show->id.'/season/'.$item->listable->season_number;
                    }
                    break;

                case AnimeMap::class:
                    if ($item->listable) {
                        $tmdbModel = $item->listable->getTmdbModel();
                        if ($tmdbModel) {
                            $poster = $tmdbModel->poster;
                            $title = $tmdbModel->title;
                            $year = $tmdbModel->year;
                            $voteAverage = $tmdbModel->voteAverage;
                        }
                        $link = $baseUrl.'/anime/'.$item->listable->id;
                    }
                    break;

                case AnidbAnime::class:
                    $poster = $item->listable?->poster;
                    $title = $item->listable?->title;
                    $year = $item->listable?->year;
                    $voteAverage = $item->listable?->rating;
                    $posterType = 'anidb';
                    try {
                        $mapId = $item->listable?->map();
                        if ($mapId) {
                            $link = $baseUrl.'/anime/'.$mapId.'/season/'.$item->listable?->id;
                        }
                    } catch (\Exception $e) {
                        // If map not found, link will remain null
                    }
                    break;
            }

            return [
                'id' => $item->id,
                'item_id' => $item->listable_id,
                'sort_order' => $item->sort_order,
                'poster_path' => $poster,
                'poster_type' => $posterType,
                'title' => $title,
                'year' => $year,
                'vote_average' => $voteAverage,
                'link' => $link,
            ];
        });

        $movieCount = $list->items->where('listable_type', Movie::class)->count();
        $tvCount = $list->items->whereIn('listable_type', [TvShow::class, TvSeason::class])->count();
        $animeCount = $list->items->whereIn('listable_type', [AnimeMap::class, AnidbAnime::class])->count();

        $totalRating = 0;
        $ratedItemCount = 0;
        $totalRuntime = 0;
        $processedAnimeIds = [];

        foreach ($list->items as $item) {
            if ($item->listable && isset($item->listable->voteAverage)) {
                $totalRating += $item->listable->voteAverage;
                $ratedItemCount++;
            }

            // Calculate runtime based on type
            if ($item->listable) {
                switch (get_class($item->listable)) {
                    case Movie::class:
                        $totalRuntime += $item->listable->runtime ?? 0;
                        break;

                    case TvShow::class:
                        $totalRuntime += $item->listable->runtime;
                        break;

                    case TvSeason::class:
                        $totalRuntime += $item->listable->runtime;
                        break;

                    case AnimeMap::class:
                        $totalRuntime += $item->listable->runtime ?? 0;
                        $processedAnimeIds[] = $item->listable->id;
                        break;

                    case AnidbAnime::class:
                        if (! $item->listable->map() || ! in_array($item->listable->map(), $processedAnimeIds)) {
                            $totalRuntime += $item->listable->runtime ?? 0;
                        }
                        break;
                }
            }
        }

        $hours = floor($totalRuntime / 60);
        $minutes = $totalRuntime % 60;

        if ($hours > 0) {
            $formattedRuntime = "{$hours}h {$minutes}m";
        } else {
            $formattedRuntime = "{$minutes}m";
        }

        $stats = [
            'total' => $items->count(),
            'movies' => $movieCount,
            'tv' => $tvCount,
            'anime' => $animeCount,
            'average_rating' => $ratedItemCount > 0 ? round($totalRating / $ratedItemCount, 2) : null,
            'total_runtime' => $formattedRuntime,
        ];

        $list = $list->toArray();
        $list['items'] = $items;
        $list['stats'] = $stats;

        return Inertia::render('List', [
            'list' => $list,
        ]);
    }

    public function updateBanner(Request $request, UserCustomList $list): RedirectResponse
    {
        if ($list->user_id !== Auth::id()) {
            abort(403);
        }

        try {
            $request->validate([
                'banner' => ['required', 'file', 'image', 'max:6144'], // 6MB max
            ]);

            if (! $request->hasFile('banner')) {
                return back()->withErrors(['banner' => 'No file was uploaded.']);
            }

            try {
                Storage::disk('spaces')->deleteDirectory("listBanners/{$list->id}");
            } catch (\Exception $e) {
                logger()->warning('Failed to delete old banner directory: '.$e->getMessage());
            }

            $file = $request->file('banner');
            if (! $file->isValid()) {
                return back()->withErrors(['banner' => 'File upload failed.']);
            }

            $path = $file->storeAs(
                "listBanners/{$list->id}",
                $file->hashName(),
                [
                    'disk' => 'spaces',
                    'options' => [
                        'ContentType' => $file->getMimeType(),
                    ],
                ]
            );

            if (! $path) {
                return back()->withErrors(['banner' => 'Failed to store file.']);
            }

            $list->update([
                'banner_image' => $path,
                'banner_type' => 'custom',
            ]);

            return back()->with('status', 'Banner updated successfully.');
        } catch (\Exception $e) {
            logger()->error('Banner upload failed: '.$e->getMessage());

            return back()->withErrors(['banner' => 'Failed to upload banner. Please try again.']);
        }
    }

    public function updateBannerFromTmdb(Request $request, UserCustomList $list): RedirectResponse
    {
        if ($list->user_id !== Auth::id()) {
            abort(403);
        }

        try {
            $request->validate([
                'file_path' => ['required', 'string'],
            ]);

            // Clean up any existing custom banners when switching to TMDB
            if ($list->banner_type === 'custom') {
                try {
                    Storage::disk('spaces')->deleteDirectory("listBanners/{$list->id}");
                } catch (\Exception $e) {
                    logger()->warning('Failed to delete old banner directory: '.$e->getMessage());
                }
            }

            $list->update([
                'banner_image' => $request->file_path,
                'banner_type' => 'tmdb',
            ]);

            return back()->with('status', 'Banner updated successfully.');
        } catch (\Exception $e) {
            logger()->error('TMDB banner update failed: '.$e->getMessage());

            return back()->withErrors(['banner' => 'Failed to update banner. Please try again.']);
        }
    }

    public function removeBanner(UserCustomList $list): RedirectResponse
    {
        if ($list->user_id !== Auth::id()) {
            abort(403);
        }

        try {
            if ($list->banner_type === 'custom') {
                try {
                    Storage::disk('spaces')->deleteDirectory("listBanners/{$list->id}");
                } catch (\Exception $e) {
                    logger()->warning('Failed to delete banner directory: '.$e->getMessage());
                }
            }

            $list->update([
                'banner_image' => null,
                'banner_type' => 'custom',
            ]);

            return back()->with('status', 'Banner removed successfully.');
        } catch (\Exception $e) {
            logger()->error('Banner removal failed: '.$e->getMessage());

            return back()->withErrors(['banner' => 'Failed to remove banner. Please try again.']);
        }
    }

    public function getListItemBackdrops(UserCustomList $list)
    {
        if (! $list->is_public && (! Auth::check() || Auth::id() !== $list->user_id)) {
            abort(404);
        }

        $list->load(['items.listable']);
        $processedIds = [];
        $backdrops = [];

        foreach ($list->items as $item) {
            $tmdbId = null;
            $tmdbType = null;
            $title = null;

            switch ($item->listable_type) {
                case Movie::class:
                    $tmdbId = $item->listable->id;
                    $tmdbType = 'movie';
                    $title = $item->listable->title;
                    break;

                case TvShow::class:
                    $tmdbId = $item->listable->id;
                    $tmdbType = 'tv';
                    $title = $item->listable->title;
                    break;

                case TvSeason::class:
                    $show = $item->listable->show;
                    $tmdbId = $show->id;
                    $tmdbType = 'tv';
                    $title = $show->title;
                    break;

                case AnimeMap::class:
                    if ($item->listable) {
                        $tmdbId = $item->listable->most_common_tmdb_id;
                        $tmdbType = $item->listable->tmdb_type;
                    }
                    break;

                case AnidbAnime::class:
                    try {
                        $mapId = $item->listable->map();
                        if ($mapId) {
                            $map = AnimeMap::find($mapId);
                            if ($map) {
                                $tmdbId = $map->most_common_tmdb_id;
                                $tmdbType = $map->tmdb_type;
                            }
                        }
                    } catch (\Exception $e) {
                        continue;
                    }
                    break;
            }

            // Skip if we've already processed this TMDB ID
            $uniqueKey = "{$tmdbType}_{$tmdbId}";
            if (! $tmdbId || ! $tmdbType || in_array($uniqueKey, $processedIds)) {
                continue;
            }

            $processedIds[] = $uniqueKey;

            // Fetch backdrops based on type
            $model = $tmdbType === 'movie' ? Movie::find($tmdbId) : TvShow::find($tmdbId);
            if ($model) {
                if (! $title) {
                    $title = $model->title;
                }

                $backdrops[] = [
                    'title' => $title,
                    'backdrops' => $model->backdrops,
                ];
            }
        }

        return response()->json($backdrops);
    }

    public function updateOrder(Request $request, UserCustomList $list): RedirectResponse
    {
        if ($list->user_id !== Auth::id()) {
            abort(403);
        }

        try {
            $request->validate([
                'items' => ['required', 'array'],
                'items.*.id' => ['required', 'integer', 'exists:user_custom_list_items,id'],
                'items.*.sort_order' => ['required', 'integer', 'min:0'],
            ]);

            foreach ($request->items as $item) {
                $list->items()->where('id', $item['id'])->update([
                    'sort_order' => $item['sort_order'],
                ]);
            }

            return back()->with('status', 'List order updated successfully.');
        } catch (\Exception $e) {
            logger()->error('List order update failed: '.$e->getMessage());

            return back()->withErrors(['order' => 'Failed to update list order. Please try again.']);
        }
    }

    public function removeItems(Request $request, UserCustomList $list): RedirectResponse
    {
        if ($list->user_id !== Auth::id()) {
            abort(403);
        }

        try {
            $request->validate([
                'items' => ['required', 'array'],
                'items.*.id' => ['required', 'integer', 'exists:user_custom_list_items,id'],
            ]);

            $list->items()->whereIn('id', collect($request->items)->pluck('id'))->delete();

            $remainingItems = $list->items()
                ->orderBy('sort_order')
                ->pluck('id')
                ->values()
                ->toArray();

            $cases = [];
            $ids = [];
            foreach ($remainingItems as $index => $id) {
                $cases[] = "WHEN {$id} THEN ".($index + 1);
                $ids[] = $id;
            }

            if (! empty($cases)) {

                $list->items()
                    ->whereIn('id', $ids)
                    ->update([
                        'sort_order' => DB::raw('CASE id '.implode(' ', $cases).' END'),
                    ]);
            }

            return back()->with('status', 'Items removed successfully.');
        } catch (\Exception $e) {
            logger()->error('List items removal failed: '.$e->getMessage());

            return back()->withErrors(['items' => 'Failed to remove items. Please try again.']);
        }
    }
}
