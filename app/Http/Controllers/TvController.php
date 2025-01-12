<?php

namespace App\Http\Controllers;

use App\Actions\Tv\TvShowActions;
use App\Models\TvShow;
use App\Models\UserTvShow;
use App\Services\TmdbService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\DB;

class TvController extends Controller
{
    public function __construct(
        private readonly TmdbService $tmdbService,
        private TvShowActions $tvShowActions
    ) {}

    public function show(Request $request, string $id): Response
    {
        $tvShowData = $this->tvShowActions->fetchTvShow($id);

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
            'type' => 'tv'
        ]);
    }
}
