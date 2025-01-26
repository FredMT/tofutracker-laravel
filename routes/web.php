<?php

use App\Actions\Trending\GetTrendingAction;
use App\Actions\Trending\GetTrendingGenresAndWatchProvidersAction;
use App\Http\Controllers\Activity\ToggleActivityLikeController;
use App\Http\Controllers\AnimeController;
use App\Http\Controllers\Comment\CommentController;
use App\Http\Controllers\List\ListBackdropsController;
use App\Http\Controllers\List\ListBannerController;
use App\Http\Controllers\List\ListBannerRemoveController;
use App\Http\Controllers\List\ListBannerTmdbController;
use App\Http\Controllers\List\ListController;
use App\Http\Controllers\List\ListRemoveItemsController;
use App\Http\Controllers\List\ListUpdateOrderController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Search\QuickSearchController;
use App\Http\Controllers\Search\SearchController;
use App\Http\Controllers\TvController;
use App\Http\Controllers\TvSeasonController;
use App\Http\Controllers\UserAnime\UserAnimeEpisodeController;
use App\Http\Controllers\UserAnime\UserAnimeMovieController;
use App\Http\Controllers\UserAnime\UserAnimeSeasonController;
use App\Http\Controllers\UserAnime\UserAnimeTvController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\UserCustomList\UserCustomListController;
use App\Http\Controllers\UserCustomList\UserCustomListItemController;
use App\Http\Controllers\UserMovieController;
use App\Http\Controllers\UserTv\UserTvEpisodeController;
use App\Http\Controllers\UserTv\UserTvSeasonController;
use App\Http\Controllers\UserTv\UserTvShowController;
use App\Http\Middleware\CheckAnimeMapping;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'genresandwatchproviders' => app(GetTrendingGenresAndWatchProvidersAction::class)->execute(),
        'data' => app(GetTrendingAction::class)->execute(),
    ]);
})->name('welcome');

Route::get('/me', function () {
    if (! Auth::check()) {
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
Route::get('/user/{username}/lists', [UserCustomListController::class, 'index'])
    ->name('user.lists.index');
Route::get('/user/{username}/lists/{list}', [UserCustomListController::class, 'show'])
    ->name('user.lists.show');
Route::get('/user/{username}', [UserController::class, 'show'])->name('user.profile');

Route::middleware('auth')->group(function () {
    Route::get('/settings', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/settings', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/settings', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/settings/avatar', [ProfileController::class, 'updateAvatar'])->name('profile.avatar');
    Route::post('/settings/banner', [ProfileController::class, 'updateBanner'])->name('profile.banner');
    Route::patch('/settings/bio', [ProfileController::class, 'updateBio'])->name('profile.bio');

    Route::post('/list/{list}/banner', ListBannerController::class)->name('list.banner.update');
    Route::post('/list/{list}/banner/tmdb', ListBannerTmdbController::class)->name('list.banner.tmdb.update');
    Route::delete('/list/{list}/banner', ListBannerRemoveController::class)->name('list.banner.remove');
    Route::get('/list/{list}/backdrops', ListBackdropsController::class)->name('list.backdrops');
    Route::post('/list/{list}/remove-items', ListRemoveItemsController::class)->name('list.removeItems');
    Route::post('/list/{list}/order', ListUpdateOrderController::class)->name('list.updateOrder');
});

Route::post('/activity/{activity}/like', ToggleActivityLikeController::class)
    ->name('activity.like.toggle')
    ->middleware(['auth', 'verified']);

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

    Route::post('/user/lists', [UserCustomListController::class, 'store'])
        ->name('user.lists.store');
    Route::patch('/user/lists/{list}', [UserCustomListController::class, 'update'])
        ->name('user.lists.update');

    // List items management routes
    Route::post('/user/list-items', [UserCustomListItemController::class, 'store'])
        ->name('user.lists.items.store');
    Route::delete('/user/list-items/{list_id}/remove', [UserCustomListItemController::class, 'destroy'])
        ->name('user.lists.items.destroy');

    // List management routes
    Route::delete('/user/lists/{username}/{list}', [UserCustomListController::class, 'destroy'])
        ->name('user.lists.destroy');
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

Route::get('/list/{list}', [ListController::class, 'show'])->name('list.show');

Route::get('/{type}/{id}/comments', [CommentController::class, 'index'])
    ->where('type', 'movie|tv|user')
    ->name('comments.index');

require __DIR__.'/auth.php';
