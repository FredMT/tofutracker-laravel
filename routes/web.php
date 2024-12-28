<?php

use App\Http\Controllers\AnimeController;
use App\Http\Controllers\AnimeMappingController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\TvController;
use App\Http\Controllers\TvSeasonController;
use App\Http\Controllers\UserAnimeEpisodeController;
use App\Http\Controllers\UserAnimeMovieController;
use App\Http\Controllers\UserAnimeSeasonController;
use App\Http\Controllers\UserAnimeTvController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserMovieController;
use App\Http\Controllers\UserTvEpisodeController;
use App\Http\Controllers\UserTvSeasonController;
use App\Http\Controllers\UserTvShowController;
use App\Http\Middleware\CheckAnimeMapping;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Http\Controllers\SearchController;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\JsonSearchController;
use App\Http\Controllers\QuickSearchController;

Route::get('/', function () {
    return Inertia::render('Welcome', []);
});

Route::get('/me', function () {
    if (!Auth::check()) {
        return redirect()->route('login');
    }
    return redirect()->route('user.profile', ['username' => Auth::user()->username]);
})->name('me');

Route::get('/user/{username}/movies', [UserController::class, 'showMovies'])
    ->name('user.movies');
Route::get('/user/{username}/tv', [UserController::class, 'showTv'])
    ->name('user.tv');
Route::get('/user/{username}/anime', [UserController::class, 'showAnime'])
    ->name('user.anime');
Route::get('/user/{username}', [UserController::class, 'show'])->name('user.profile');

Route::middleware('auth')->group(function () {
    Route::get('/settings', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/settings', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/settings', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/settings/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
    Route::post('/settings/banner', [ProfileController::class, 'updateBanner'])->name('profile.banner');
    Route::patch('/settings/bio', [ProfileController::class, 'updateBio'])->name('profile.bio');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/movies/library/{movie_id}', [UserMovieController::class, 'store'])
        ->name('movie.library.store');
    Route::delete('/movies/library/{movie_id}', [UserMovieController::class, 'destroy'])
        ->name('movie.library.destroy');
    Route::patch('/movie/library/status/{movie_id}', [UserMovieController::class, 'update'])
        ->name('movie.library.update-status');
    Route::post('/movie/library/rating/{movie_id}', [UserMovieController::class, 'rate'])
        ->name('movie.library.rate');

    Route::post('/tv/episode/{episode_id}', [UserTvEpisodeController::class, 'store'])
        ->name('tv.episode.store');
    Route::delete('/tv/episode/{episode_id}', [UserTvEpisodeController::class, 'destroy'])
        ->name('tv.episode.destroy');


    Route::post('/tv/season/library', [UserTvSeasonController::class, 'store'])->name('tv.season.library.store');
    Route::delete('/tv/season/library', [UserTvSeasonController::class, 'destroy'])->name('tv.season.library.destroy');
    Route::post('/tv/season/library/rate', [UserTvSeasonController::class, 'update'])->name('tvseason.library.rate');
    Route::patch('/tv/season/library/status', [UserTvSeasonController::class, 'watch_status'])->name('tvseason.library.update-status');

    Route::post('/tv/show/library', [UserTvShowController::class, 'store'])->name('tv.show.library.store');
    Route::delete('/tv/show/library', [UserTvShowController::class, 'destroy'])->name('tv.show.library.destroy');
    Route::post('/tv/show/library/rate', [UserTvShowController::class, 'rate'])->name('tv.library.rate');
    Route::patch('/tv/show/library/status', [UserTvShowController::class, 'watch_status'])->name('tv.library.update-status');

    Route::post('/anime/movie/library', [UserAnimeMovieController::class, 'store'])->name('anime.movie.library.store');
    Route::delete('/anime/movie/library', [UserAnimeMovieController::class, 'destroy'])->name('anime.movie.library.destroy');
    Route::post('/anime/movie/library/rate', [UserAnimeMovieController::class, 'rate'])
        ->name('animemovie.library.rate');
    Route::patch('/anime/movie/library/status', [UserAnimeMovieController::class, 'watch_status'])->name('animemovie.library.update-status');

    Route::post('/anime/tv/library', [UserAnimeTvController::class, 'store'])->name('anime.tv.library.store');
    Route::delete('/anime/tv/library', [UserAnimeTvController::class, 'destroy'])->name('anime.tv.library.destroy');
    Route::post('/anime/tv/library/rate', [UserAnimeTvController::class, 'rate'])
        ->name('animetv.library.rate');
    Route::patch('/anime/tv/library/status', [UserAnimeTvController::class, 'watch_status'])->name('animetv.library.update-status');

    Route::post('/anime/season/library', [UserAnimeSeasonController::class, 'store'])->name('anime.season.library.store');
    Route::delete('/anime/season/library', [UserAnimeSeasonController::class, 'destroy'])->name('anime.season.library.destroy');
    Route::post('/anime/season/library/rate', [UserAnimeSeasonController::class, 'rate'])
        ->name('anime.season.library.rate');
    Route::patch('/anime/season/library/status', [UserAnimeSeasonController::class, 'watch_status'])->name('anime.season.library.update-status');

    Route::post('/anime/episode/library', [UserAnimeEpisodeController::class, 'store'])->name('anime.episode.store');
    Route::delete('/anime/episode/library', [UserAnimeEpisodeController::class, 'destroy'])
        ->name('anime.episode.destroy');
});

Route::get('/movie/{id}', [MovieController::class, 'show'])
    ->where('id', '[0-9]+')
    ->middleware(CheckAnimeMapping::class)
    ->name('movie.show');


Route::get('/tv/{id}', [TvController::class, 'show'])
    ->where('id', '[0-9]+')
    ->middleware(CheckAnimeMapping::class)
    ->name('tv.show');

Route::get('/tv/{id}/season/{seasonNumber}', [TvSeasonController::class, 'show'])
    ->middleware(CheckAnimeMapping::class)
    ->name('tv.season.show');

Route::get('/anime/{id}', [AnimeController::class, 'show'])->name('anime.show');
Route::get('/anime/{id}/season/{seasonId}', [AnimeController::class, 'showSeason'])->name('anime.season.show');

Route::get('/search', [SearchController::class, 'search'])->name('search');
Route::get('/quicksearch', QuickSearchController::class)->name('quicksearch');



require __DIR__ . '/auth.php';
