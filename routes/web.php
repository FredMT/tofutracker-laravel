<?php

use App\Http\Controllers\AnidbController;
use App\Http\Controllers\AnimeController;
use App\Http\Controllers\MovieController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TrendingController;
use App\Http\Controllers\TvController;
use App\Http\Controllers\UserController;
use App\Services\AnimeService;
use App\Services\TmdbService;
use App\Services\TvdbService;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    return Inertia::render('Welcome', []);
});

Route::get('/dashboard', function (Request $request) {
    $page = $request->input('page', 1);
    $perPage = 12;

    $query = $request->user()
        ->library()
        ->with(['user', 'movie' => function ($query) {
            $query->select('id', 'data');
        }])
        ->latest();

    $paginator = $query->paginate($perPage, ['*'], 'page', $page);

    $items = collect($paginator->items())->map(function ($item) {
        return [
            'id' => $item->id,
            'media_id' => $item->media_id,
            'media_type' => $item->media_type,
            'status' => $item->status,
            'rating' => $item->rating,
            'is_private' => $item->is_private,
            'created_at' => $item->created_at,
            'movie_data' => $item->movie ? [
                'poster_path' => $item->movie->data['poster_path'] ?? null,
                'title' => $item->movie->data['title'] ?? null,
            ] : null,
        ];
    });

    $response = [
        'data' => $items,
        'next_page' => $paginator->hasMorePages() ? $page + 1 : null,
        'total' => $paginator->total(),
        'per_page' => $perPage,
    ];

    if ($request->wantsJson()) {
        return response()->json($response);
    }

    return Inertia::render('UserProfile', [
        'library' => $response,
    ]);
})->middleware(['auth', 'verified'])->name('dashboard');


Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::post('/movie/library/add/{movie_id}', [MovieController::class, 'addToLibrary'])
        ->name('movie.library.add');
    Route::delete('/movie/library/remove/{movie_id}', [MovieController::class, 'removeFromLibrary'])
        ->name('movie.library.remove');
    Route::patch('/movie/library/status/{movie_id}', [MovieController::class, 'updateStatus'])
        ->name('movie.library.update-status');
    Route::post('/movie/library/rating/{movie_id}', [MovieController::class, 'updateRating'])
        ->name('movie.library.update-rating');
});

Route::get('/movie/{id}/details', [MovieController::class, 'details'])
    ->where('id', '[0-9]+')
    ->name('movie.show');
Route::get('/movie/{id}', [MovieController::class, 'show'])
    ->where('id', '[0-9]+')
    ->name('movie.show');

Route::get('/tv/{id}/details', [TvController::class, 'details'])
    ->where('id', '[0-9]+')
    ->name('tv.details');
Route::get('/tv/{id}', [TvController::class, 'show'])
    ->where('id', '[0-9]+')
    ->name('tv.show');

Route::get('/anime/{id}/related', [AnimeController::class, 'getRelatedAnime']);
// Route::get('tv/episodes/{tvdbId}', [AnimeService::class, 'getOrganizedSeasons']);
// Route::get('/anidb/anime/import', [AnidbController::class, 'importAnimeData']);

require __DIR__ . '/auth.php';
