<?php

namespace App\Http\Controllers;

use App\Actions\Tv\TvShowActions;
use App\Http\Controllers\Comment\CommentController;
use App\Models\TvShow;
use App\Services\TmdbService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Kiritokatklian\LaravelColorPalette\Facades\ColorPalette;

class TvController extends Controller
{
    public function __construct(
        private readonly TmdbService $tmdbService,
        private readonly TvShowActions $tvShowActions,
        private readonly CommentController $commentController
    ) {}

    public function show(Request $request, string $id): Response
    {
        $tvShowData = $this->tvShowActions->fetchTvShow($id);
        $comments = $this->commentController->index($request, 'tv', $id);

        // Default configuration when no user is logged in
        $configuration = (object) [
            'hide_episode_description' => false,
            'hide_character_name' => false,
            'hide_anime_character_picture' => false,
        ];

        // Set default values for user-specific data
        $userData = [
            'user_library' => null,
            'user_lists' => null,
            'configuration' => $configuration,
        ];

        // Get user with relationships if authenticated
        $user = $request->user();
        if ($user) {
            // Eager load needed relationships

            $user->load([
                'configuration',
                'shows' => function ($query) use ($id) {
                    $query->where('show_id', $id);
                },
                'customLists' => function ($query) {
                    $query->select('id', 'title', 'user_id')
                        ->orderBy('title', 'ASC');
                },
            ]);

            // Get user's configuration
            $userData['configuration'] = $user->configuration ?? $configuration;

            $userData['user_library'] = $user->shows->first();

            if ($user->customLists->isNotEmpty()) {
                // Load which lists contain this TV show
                $listIds = $user->customLists->pluck('id')->toArray();

                $listsWithItem = \App\Models\UserCustomList\UserCustomListItem::where('listable_type', TvShow::class)
                    ->where('listable_id', $id)
                    ->whereIn('custom_list_id', $listIds)
                    ->pluck('custom_list_id')
                    ->toArray();

                // Add the has_item property to each list
                $userData['user_lists'] = $user->customLists->map(function ($list) use ($listsWithItem) {
                    $list->has_item = in_array($list->id, $listsWithItem);

                    return $list;
                });
            }
        }

        $navbar_color = $this->getColorPalette($id);

        return Inertia::render('TV', [
            'navbar_color' => $navbar_color,
            'data' => $tvShowData,
            'comments' => $comments,
            'type' => 'tv',
            'user_library' => $userData['user_library'],
            'user_lists' => $userData['user_lists'],
            'configuration' => $userData['configuration'],
        ]);
    }

    private function getColorPalette(string $id)
    {        
        $cacheKey = "tv.{$id}.color_palette";
        if (cache()->has($cacheKey)) {
            return cache()->get($cacheKey);
        }

        $backdropPath = TvShow::selectRaw('data->\'backdrop_path\' as backdrop_path')->where('id', $id)->value('backdrop_path');

        if (! $backdropPath) {
            return null;
        }

        $cacheTTL = seconds_until('first sunday next month at 8 am');

        $imageUrl = "https://image.tmdb.org/t/p/original" . ltrim($backdropPath, '"');
        $colorPalette = ColorPalette::getPalette($imageUrl);
        cache()->put($cacheKey, $colorPalette, $cacheTTL);

        return $colorPalette;
    }
}
