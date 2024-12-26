<?php

use App\Services\TmdbService;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| TMDB API Routes
|--------------------------------------------------------------------------
*/

Route::prefix('tmdb')->group(function () {
    // Movie routes
    Route::get('/movie/{id}', function (string $id) {
        return app(TmdbService::class)->getMovie($id);
    });

    // TV routes
    Route::get('/movie/basic/{id}', function (string $id) {
        return app(TmdbService::class)->getMovieBasic($id);
    });

    // TV routes
    Route::get('/tv/basic/{id}', function (string $id) {
        return app(TmdbService::class)->getTvBasic($id);
    });
    // TV routes
    Route::get('/tv/{id}', function (string $id) {
        return app(TmdbService::class)->getTv($id);
    });

    // TV Season routes
    Route::get('/tv/{id}/season/{number}', function (string $id, int $number) {
        return app(TmdbService::class)->getSeason($id, $number);
    });

    // Trending routes
    Route::prefix('trending')->group(function () {
        Route::get('/movies', function () {
            return app(TmdbService::class)->getTrendingMovies();
        });

        Route::get('/tv', function () {
            return app(TmdbService::class)->getTrendingTv();
        });

        Route::get('/all', function () {
            return app(TmdbService::class)->getTrendingAll();
        });
    });

    // Random backdrop
    Route::get('/random-backdrop', function () {
        return [
            'backdrop_path' => app(TmdbService::class)->getRandomTrendingBackdropImage()
        ];
    });
});
