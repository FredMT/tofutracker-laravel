<?php

namespace App\Http\Controllers;

use App\Actions\Tv\TvShowActions;
use App\Http\Controllers\Comment\CommentController;
use App\Models\TvShow;
use App\Models\UserTv\UserTvShow;
use App\Services\TmdbService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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

        $userLibrary = null;
        $userLists = null;

        if ($request->user()) {
            $userLibrary = UserTvShow::where([
                'user_id' => $request->user()->id,
                'show_id' => $id,
            ])->first();

            $userLists = $request->user()
                ->customLists()
                ->select('id', 'title')
                ->orderBy('title', 'ASC')
                ->withExists(['items as has_item' => function ($query) use ($id) {
                    $query->where('listable_type', TvShow::class)
                        ->where('listable_id', $id);
                }])
                ->get();

            if ($userLists->isEmpty()) {
                $userLists = null;
            }
        }

        return Inertia::render('TV', [
            'data' => $tvShowData,
            'user_library' => $userLibrary,
            'user_lists' => $userLists,
            'type' => 'tv',
            'comments' => $comments,
        ]);
    }
}
