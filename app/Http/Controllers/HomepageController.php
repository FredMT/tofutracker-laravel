<?php

namespace App\Http\Controllers;

use App\Actions\Trending\GetTrendingAction;
use App\Actions\Trending\GetTrendingGenresAndWatchProvidersAction;
use Inertia\Inertia;

class HomepageController extends Controller
{
    public function __construct(
        private readonly GetTrendingGenresAndWatchProvidersAction $getTrendingGenresAndWatchProvidersAction,
        private readonly GetTrendingAction $getTrendingAction,
    ) {}

    public function __invoke()
    {

        $data = $this->getTrendingAction->execute();
        $types = ['movies', 'tv_shows', 'anime'];
        $selectedType = $types[array_rand($types)];
        $selectedIndex = rand(0, 9);

        return Inertia::render('Welcome', [
            'genresandwatchproviders' => $this->getTrendingGenresAndWatchProvidersAction->execute(),
            'data' => $data,
        ]);
    }
}
