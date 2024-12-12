<?php

namespace App\Http\Controllers;

use App\Actions\Tv\TvShowActions;
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

        $userLibraryData = $request->user()?->library()
            ->where('media_id', $id)
            ->where('media_type', 'tv')
            ->first();


        return Inertia::render('Content', [
            'tv' => $tvShowData,
            'user_library' => $userLibraryData,
            'type' => 'tv'
        ]);
    }
}
