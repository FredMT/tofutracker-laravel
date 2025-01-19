<?php

namespace App\Http\Controllers\List;

use App\Http\Controllers\Controller;
use App\Models\AnidbAnime;
use App\Models\AnimeMap;
use App\Models\Movie;
use App\Models\TvSeason;
use App\Models\TvShow;
use App\Models\UserCustomList;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;

class ListBackdropsController extends Controller
{
    public function __invoke(UserCustomList $list): JsonResponse
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
                        $tmdbId = null;
                        $tmdbType = null;
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
} 