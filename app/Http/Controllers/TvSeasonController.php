<?php

namespace App\Http\Controllers;

use App\Actions\Tv\FetchTvSeasonAction;
use Illuminate\Http\Request;

class TvSeasonController extends Controller
{
    public function __construct(
        private readonly FetchTvSeasonAction $fetchTvSeasonAction
    ) {}

    public function show(Request $request, string $tvId, string $seasonNumber)
    {
        $seasonData = $this->fetchTvSeasonAction->execute($tvId, $seasonNumber);

        // return Inertia::render('Content', [
        //     'season' => $seasonData,
        //     'type' => 'season'
        // ]);

        return $seasonData;
    }
}
