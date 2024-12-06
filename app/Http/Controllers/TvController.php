<?php

namespace App\Http\Controllers;

use App\Services\TmdbService;

class TvController extends Controller
{
    public function __construct(
        private readonly TmdbService $tmdbService
    ) {}

    public function show(string $id)
    {
        return cache()->remember(
            "tv.{$id}",
            now()->addMinutes(30),
            fn() => $this->tmdbService->getTv($id)->json()
        );
    }
}
