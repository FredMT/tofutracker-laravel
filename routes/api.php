<?php

use App\Http\Controllers\UserLibraryMovieController;
use Illuminate\Support\Facades\Route;


Route::middleware(['auth', 'verified'])->group(function () {
    Route::prefix('library')->name('library.')->group(function () {
        Route::apiResource('movies', UserLibraryMovieController::class);
    });
});
