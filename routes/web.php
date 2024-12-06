<?php

use App\Http\Controllers\MovieController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TrendingController;
use App\Http\Controllers\TvController;
use App\Http\Controllers\UserController;
use App\Services\TmdbService;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', []);
});

Route::get('/movies/{id}', [MovieController::class, 'show'])->name('api.movies.show');
Route::get('/tv/{id}', [TvController::class, 'show'])->name('api.tv.show');
Route::get('/trending/details', [TrendingController::class, 'getDetails'])->name('api.trending.details');

Route::get('/trending', [TrendingController::class, 'index']);
Route::get('/user-profile/{user}', [UserController::class, 'show'])->name('user-profile');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
