<?php

namespace App\Http\Controllers;

use App\Actions\Tv\TvShowActions;
use App\Models\UserTvShow;
use App\Services\TmdbService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

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
        if ($request->user()) {
            $userLibrary = UserTvShow::where([
                'user_id' => $request->user()->id,
                'show_id' => $id,
            ])->first();
        }

        return Inertia::render('TV', [
            'data' => $tvShowData,
            'user_library' => $userLibrary,
            'type' => 'tv'
        ]);
    }
}
