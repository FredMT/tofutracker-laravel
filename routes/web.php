<?php

use App\Http\Controllers\MovieController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\TrendingController;
use App\Http\Controllers\TvController;
use App\Http\Controllers\UserController;
use App\Services\TmdbService;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

Route::get('/', function () {
    return Inertia::render('Welcome', []);
});

Route::get('/dashboard', function (Request $request) {
    $page = $request->input('page', 1);
    $perPage = 10;

    $query = $request->user()
        ->library()
        ->with('user')
        ->latest();

    $paginator = $query->paginate($perPage, ['*'], 'page', $page);

    $items = collect($paginator->items())->map(function ($item) {
        $movieData = DB::table('movies')
            ->where('id', $item->media_id)
            ->select([
                DB::raw("data->>'title' as title"),
                DB::raw("data->>'poster_path' as poster_path")
            ])
            ->first();

        return [
            'id' => $item->id,
            'media_id' => $item->media_id,
            'media_type' => $item->media_type,
            'status' => $item->status,
            'rating' => $item->rating,
            'is_private' => $item->is_private,
            'created_at' => $item->created_at,
            'movie_data' => $movieData ? [
                'poster_path' => $movieData->poster_path,
                'title' => $movieData->title,
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
