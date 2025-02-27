<?php

use App\Actions\Trending\GetTrendingAction;
use App\Actions\Trending\GetTrendingGenresAndWatchProvidersAction;
use App\Http\Controllers\Activity\ToggleActivityLikeController;
use App\Http\Controllers\AnimeController;
use App\Http\Controllers\AnimeSeasonController;
use App\Http\Controllers\Comment\CommentController;
use App\Http\Controllers\Comment\VoteController;
use App\Http\Controllers\List\ListBackdropsController;
use App\Http\Controllers\List\ListBannerController;
use App\Http\Controllers\List\ListBannerRemoveController;
use App\Http\Controllers\List\ListBannerTmdbController;
use App\Http\Controllers\List\ListController;
use App\Http\Controllers\List\ListRemoveItemsController;
use App\Http\Controllers\List\ListUpdateOrderController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\NotificationController;
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
use App\Http\Controllers\AnimeCollectionController;
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

Route::prefix('user/{username}')->name('user.')->group(function () {
    Route::get('/', [UserController::class, 'show'])->name('profile');
    Route::get('/movies', [UserController::class, 'showMovies'])->name('movies');
    Route::get('/tv', [UserController::class, 'showTv'])->name('tv');
    Route::get('/anime', [UserController::class, 'showAnime'])->name('anime');

    Route::prefix('lists')->name('lists.')->group(function () {
        Route::get('/', [UserCustomListController::class, 'index'])->name('index');
        Route::get('/{list}', [UserCustomListController::class, 'show'])->name('show');
    });
});

Route::middleware('auth')->prefix('settings')->name('profile.')->group(function () {
    Route::get('/', [ProfileController::class, 'edit'])->name('edit');
    Route::patch('/', [ProfileController::class, 'update'])->name('update');
    Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    Route::post('/avatar', [ProfileController::class, 'updateAvatar'])->name('avatar');
    Route::post('/banner', [ProfileController::class, 'updateBanner'])->name('banner');
    Route::patch('/bio', [ProfileController::class, 'updateBio'])->name('bio');
});

Route::middleware('auth')->prefix('list/{list}')->name('list.')->group(function () {
    Route::post('/banner', ListBannerController::class)->name('banner.update');
    Route::post('/banner/tmdb', ListBannerTmdbController::class)->name('banner.tmdb.update');
    Route::delete('/banner', ListBannerRemoveController::class)->name('banner.remove');
    Route::get('/backdrops', ListBackdropsController::class)->name('backdrops');
    Route::post('/remove-items', ListRemoveItemsController::class)->name('removeItems');
    Route::post('/order', ListUpdateOrderController::class)->name('updateOrder');
});

Route::post('/activity/{activity}/like', ToggleActivityLikeController::class)
    ->name('activity.like.toggle')
    ->middleware(['auth', 'verified']);

Route::middleware(['auth', 'verified'])->group(function () {
    // Movie Library Routes
    Route::prefix('movies/library')->name('movie.library.')->group(function () {
        Route::post('/store', [UserMovieController::class, 'store'])->name('store');
        Route::delete('/delete', [UserMovieController::class, 'destroy'])->name('destroy');
        Route::post('/rate', [UserMovieController::class, 'rate'])->name('rate');
        Route::patch('/status', [UserMovieController::class, 'watch_status'])->name('update-status');
    });

    // TV Episode Routes
    Route::prefix('tv/episode')->name('tv.episode.')->group(function () {
        Route::post('/{episode_id}', [UserTvEpisodeController::class, 'store'])->name('store');
        Route::delete('/{episode_id}', [UserTvEpisodeController::class, 'destroy'])->name('destroy');
    });

    // TV Season Library Routes
    Route::prefix('tv/season/library')->name('tv.season.library.')->group(function () {
        Route::post('/store', [UserTvSeasonController::class, 'store'])->name('store');
        Route::delete('/delete', [UserTvSeasonController::class, 'destroy'])->name('destroy');
        Route::post('/rate', [UserTvSeasonController::class, 'rate'])->name('rate');
        Route::patch('/status', [UserTvSeasonController::class, 'watch_status'])->name('update-status');
    });

    // TV Show Library Routes
    Route::prefix('tv/show/library')->name('tv.library.')->group(function () {
        Route::post('/store', [UserTvShowController::class, 'store'])->name('store');
        Route::delete('/delete', [UserTvShowController::class, 'destroy'])->name('destroy');
        Route::post('/rate', [UserTvShowController::class, 'rate'])->name('rate');
        Route::patch('/status', [UserTvShowController::class, 'watch_status'])->name('update-status');
    });

    // Anime Movie Library Routes
    Route::prefix('anime/movie/library')->name('anime.movie.library.')->group(function () {
        Route::post('/store', [UserAnimeMovieController::class, 'store'])->name('store');
        Route::delete('/delete', [UserAnimeMovieController::class, 'destroy'])->name('destroy');
        Route::post('/rate', [UserAnimeMovieController::class, 'rate'])->name('rate');
        Route::patch('/status', [UserAnimeMovieController::class, 'watch_status'])->name('update-status');
    });

    // Anime TV Library Routes
    Route::prefix('anime/tv/library')->name('anime.tv.library.')->group(function () {
        Route::post('/store', [UserAnimeTvController::class, 'store'])->name('store');
        Route::delete('/delete', [UserAnimeTvController::class, 'destroy'])->name('destroy');
        Route::post('/rate', [UserAnimeTvController::class, 'rate'])->name('rate');
        Route::patch('/status', [UserAnimeTvController::class, 'watch_status'])->name('update-status');
    });

    // Anime Season Library Routes
    Route::prefix('anime/season/library')->name('anime.season.library.')->group(function () {
        Route::post('/store', [UserAnimeSeasonController::class, 'store'])->name('store');
        Route::delete('/delete', [UserAnimeSeasonController::class, 'destroy'])->name('destroy');
        Route::post('/rate', [UserAnimeSeasonController::class, 'rate'])->name('rate');
        Route::patch('/status', [UserAnimeSeasonController::class, 'watch_status'])->name('update-status');
    });

    // Anime Episode Library Routes
    Route::prefix('anime/episode/library')->name('anime.episode.')->group(function () {
        Route::post('/store', [UserAnimeEpisodeController::class, 'store'])->name('store');
        Route::delete('/delete', [UserAnimeEpisodeController::class, 'destroy'])->name('destroy');
    });
});

// User List Routes
Route::prefix('user/lists')->name('user.lists.')->group(function () {
    Route::post('/store', [UserCustomListController::class, 'store'])->name('store');
    Route::patch('/{list}', [UserCustomListController::class, 'update'])->name('update');
    Route::delete('/{username}/{list}', [UserCustomListController::class, 'destroy'])->name('destroy');

    // List Items Management
    Route::prefix('items')->name('items.')->group(function () {
        Route::post('/store', [UserCustomListItemController::class, 'store'])->name('store');
        Route::delete('/{list_id}/remove', [UserCustomListItemController::class, 'destroy'])->name('destroy');
    });
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
Route::get('/anime/{id}/season/{seasonId}', [AnimeSeasonController::class, 'show'])->name('anime.season.show');

Route::get('/search', [SearchController::class, 'search'])->name('search');
Route::get('/quicksearch', QuickSearchController::class)->name('quicksearch');

Route::get('/list/{list}', [ListController::class, 'show'])->name('list.show');

Route::get('/{type}/{id}/comments', [CommentController::class, 'index'])
    ->where('type', 'movie|tv|user')
    ->name('comments.index');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/{type}/{id}/comments', [CommentController::class, 'store'])
        ->where('type', 'movie|tv|tvseason|animemovie|animetv|animeseason|user')
        ->name('comments.store');
    Route::patch('/comments/{comment}', [CommentController::class, 'update'])
        ->name('comments.update');
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy'])
        ->name('comments.destroy');
    Route::post('/votes', [VoteController::class, 'store']);
});

Route::middleware(['auth', 'verified'])->prefix('notifications')->name('notifications.')->group(function () {
    Route::get('/', [NotificationController::class, 'show'])->name('show');
    Route::post('/{id}/read', [NotificationController::class, 'markNotificationAsRead'])->name('read');
    Route::post('/read-all', [NotificationController::class, 'markAllNotificationsAsRead'])->name('readAll');
});

// Anime Collections API Routes
Route::prefix('anime-collections')->name('anime-collections.')->group(function () {
    Route::get('/', [AnimeCollectionController::class, 'index'])->name('index');
});

require __DIR__ . '/auth.php';
