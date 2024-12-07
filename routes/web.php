<?php

use App\Http\Controllers\MovieController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TrendingController;
use App\Http\Controllers\TvController;
use App\Http\Controllers\UserController;
use App\Services\TmdbService;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', []);
});

Route::get('/dashboard', function () {
    return Inertia::render('UserProfile');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::get('/movie/{id}', [MovieController::class, 'show'])
    ->where('id', '[0-9]+')
    ->name('api.movies.show');
Route::get('/tv/{id}', [TvController::class, 'show'])->name('api.tv.show');
// For checking json responses
Route::get('/trending/details', [TmdbService::class, 'getRandomTrendingBackdropImage'])->name('api.trending.details');


Route::get('/trending', [TrendingController::class, 'index']);

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::get('/movies/genres/all', [MovieController::class, 'allGenres'])
    ->name('api.movies.genres.all');

Route::prefix('movies/{id}')->group(function () {
    Route::get('/logos', [MovieController::class, 'logos'])->name('api.movies.logos');
    Route::get('/backdrops', [MovieController::class, 'backdrops'])->name('api.movies.backdrops');
    Route::get('/posters', [MovieController::class, 'posters'])->name('api.movies.posters');
    Route::get('/genres', [MovieController::class, 'genres'])->name('api.movies.genres');
    Route::get('/credits', [MovieController::class, 'credits'])->name('api.movies.credits');
});



require __DIR__ . '/auth.php';
