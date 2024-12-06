<?php

namespace App\Http\Controllers;

use App\Services\TmdbService;
use Inertia\Inertia;
use Inertia\Response;

class MovieController extends Controller
{
    public function __construct(
        private readonly TmdbService $tmdbService
    ) {}

    public function show(string $id): Response
    {
        $movie = cache()->remember(
            "movie.{$id}",
            now()->addHours(6),
            fn() => $this->tmdbService->getMovie($id)
        );

        return Inertia::render('Movie', [
            'movie' => $movie,
            'source' => cache()->has("movie.{$id}") ? 'cache' : 'api'
        ]);
    }
}
