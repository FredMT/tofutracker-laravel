<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserMovie;
use App\Models\UserTvShow;
use App\Models\UserAnimeCollection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Enums\WatchStatus;
use DateTime;
use App\Actions\UserController\Tv\ValidateShowFilters;
use App\Actions\UserController\Tv\GetUserTvGenres;
use App\Actions\UserController\Tv\GenerateShowMessages;
use App\Actions\UserController\Tv\GetUserData;
use App\Actions\UserController\Anime\ValidateAnimeFilters;
use App\Actions\UserController\Anime\GenerateAnimeMessages;

class UserController extends Controller
{
    /**
     * Display the user's profile.
     *
     * @param string $username
     * @return \Inertia\Response
     */
    public function show($username)
    {
        $user = User::where('username', $username)
            ->firstOrFail();

        return Inertia::render('UserProfile', [
            'userData' => [
                'id' => $user->id,
                'username' => $user->username,
                'name' => $user->name,
                'created_at' => 'Joined ' . $user->created_at->format('F Y'),
            ]
        ]);
    }

    public function showMovies(string $username, Request $request)
    {
        $user = User::where('username', $username)->firstOrFail();

        $query = $user->movies()
            ->with(['movie' => function ($query) {
                $query->select('id', 'data');
            }])
            ->select(['id', 'user_id', 'movie_id', 'rating', 'watch_status', 'created_at']);

        $userGenres = UserMovie::query()
            ->with(['movie'])
            ->whereHas('userLibrary', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->get()
            ->flatMap(function ($userMovie) {
                return $userMovie->movie->genres;
            })
            ->unique('id')
            ->values()
            ->toArray();

        // Apply filters
        $this->applyFilters($query, $request);

        $movies = $query->orderBy('created_at', 'desc')
            ->paginate(24)
            ->through(function ($userMovie) {
                return [
                    'id' => $userMovie->movie->id,
                    'title' => $userMovie->movie->data['title'] ?? null,
                    'poster_path' => $userMovie->movie->data['poster_path'] ?? null,
                    'release_date' => $userMovie->movie->data['release_date'] ?? null,
                    'rating' => $userMovie->rating,
                    'watch_status' => $userMovie->watch_status->value,
                    'added_at' => $userMovie->created_at->format('j F, Y'),
                ];
            });

        return Inertia::render('UserMovies', [
            'userData' => [
                'id' => $user->id,
                'username' => $user->username,
                'created_at' => 'Joined ' . $user->created_at->format('F Y'),
                'avatar_url' => $user->avatar_url,
            ],
            'movies' => $movies->toArray(),
            'genres' => $userGenres,
            'filters' => $this->getFilters($request),
        ]);
    }

    private function applyFilters($query, Request $request): void
    {
        if ($request->filled('status') && WatchStatus::tryFrom($request->status)) {
            $query->where('watch_status', $request->status);
        }

        if ($request->filled('title')) {
            $searchTerms = array_filter(explode(' ', trim($request->title)));
            if (!empty($searchTerms)) {
                $query->whereHas('movie', function ($query) use ($searchTerms) {
                    foreach ($searchTerms as $term) {
                        $query->where('data->title', 'ilike', '%' . $term . '%');
                    }
                });
            }
        }

        if ($request->filled(['from_date', 'to_date'])) {
            $query->whereBetween('created_at', [
                new \DateTime($request->from_date),
                new \DateTime($request->to_date)
            ]);
        }

        if ($request->filled('genres')) {
            $genreIds = collect(explode(',', $request->genres))
                ->map(fn($genreId) => (int) $genreId)
                ->toArray();

            $query->whereHas('movie', function ($query) use ($genreIds) {
                $query->where(function ($query) use ($genreIds) {
                    foreach ($genreIds as $genreId) {
                        // For PostgreSQL JSONB, we need to search within the array of genres
                        $query->whereRaw('data->\'genres\' @> ?', [
                            json_encode([['id' => $genreId]])
                        ]);
                    }
                });
            });
        }
    }

    private function getFilters(Request $request): array
    {
        return [
            'status' => $request->status,
            'title' => $request->title,
            'from_date' => $request->from_date,
            'to_date' => $request->to_date,
            'genres' => $request->genres
        ];
    }


    public function showTv(string $username, Request $request)
    {
        $user = User::where('username', $username)->firstOrFail();

        $userData = app(GetUserData::class)->handle($user);

        if (!$userData) return abort(404);

        $errors = app(ValidateShowFilters::class)->handle($request);

        // If there are any validation errors, return early with empty arrays
        if (!empty($errors)) {
            return Inertia::render('UserTv', [
                'success' => false,
                'messages' => [],
                'errors' => $errors,
                'shows' => [],
                'genres' => [],
                'filters' => $this->getFilters($request),
                'userData' => $userData
            ]);
        }

        $userGenres = app(GetUserTvGenres::class)->handle($user);

        $shows = $user->shows()
            ->with([
                'show',
                'seasons.season.episodes',
                'seasons.episodes.episode'
            ])
            ->orderBy('created_at', 'desc')
            ->get()
            ->applyFilters($this->getFilters($request))
            ->toPresentation();

        $messages = app(GenerateShowMessages::class)->handle($request, $shows);

        return Inertia::render('UserTv', [
            'success' => true,
            'messages' => $messages,
            'errors' => $errors,
            'userData' => $userData,
            'filters' => $this->getFilters($request),
            'genres' => $userGenres,
            'shows' => $shows,
        ]);
    }

    public function showAnime(string $username, Request $request)
    {
        $user = User::where('username', $username)->firstOrFail();

        $userData = app(GetUserData::class)->handle($user);

        if (!$userData) return abort(404);

        $errors = app(ValidateAnimeFilters::class)->handle($request);

        // If there are any validation errors, return early with empty arrays
        if (!empty($errors)) {
            return Inertia::render('UserAnime', [
                'success' => false,
                'messages' => [],
                'errors' => $errors,
                'collections' => [],
                'genres' => [],
                'filters' => $this->getFilters($request),
                'userData' => $userData
            ]);
        }

        // Get user's anime collections with necessary relationships
        $collections = UserAnimeCollection::query()
            ->with([
                'anime.anime',
                'anime.episodes',
                'animeMap.chains.entries.anime',
                'animeMap.relatedEntries.anime',
                'userLibrary'
            ])
            ->whereHas('userLibrary', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // Get unique genres from TMDB data (will be populated by the collection)
        $userGenres = collect();
        $collections->each(function ($collection) use (&$userGenres) {
            if ($collection->animeMap->most_common_tmdb_id && $collection->animeMap->tmdb_type) {
                $tmdbData = app(\App\Services\TmdbService::class);
                try {
                    $data = $collection->animeMap->tmdb_type === 'movie'
                        ? $tmdbData->getMovieBasic($collection->animeMap->most_common_tmdb_id)
                        : $tmdbData->getTvBasic($collection->animeMap->most_common_tmdb_id);

                    if ($data && isset($data['genres'])) {
                        $userGenres = $userGenres->concat($data['genres']);
                    }
                } catch (\Exception $e) {
                    logger()->error("Failed to fetch TMDB data: " . $e->getMessage());
                }
            }
        });

        $userGenres = $userGenres->unique('id')->values();

        // Apply filters and transform data
        $filteredCollections = $collections->applyFilters($this->getFilters($request));
        $presentedCollections = $filteredCollections->toPresentation();

        $messages = app(GenerateAnimeMessages::class)->handle($request, $presentedCollections);

        return Inertia::render('UserAnime', [
            'success' => true,
            'messages' => $messages,
            'errors' => $errors,
            'userData' => $userData,
            'collections' => $presentedCollections,
            'genres' => $userGenres,
            'filters' => $this->getFilters($request),
        ]);
    }

    public function showAnimeApi(string $username, Request $request)
    {
        $user = User::where('username', $username)->firstOrFail();

        $userData = app(GetUserData::class)->handle($user);

        if (!$userData) return abort(404);

        $errors = app(ValidateAnimeFilters::class)->handle($request);

        // If there are any validation errors, return early with empty arrays
        if (!empty($errors)) {
            return Inertia::render('UserAnime', [
                'success' => false,
                'messages' => [],
                'errors' => $errors,
                'collections' => [],
                'genres' => [],
                'filters' => $this->getFilters($request),
                'userData' => $userData
            ]);
        }

        // Get user's anime collections with necessary relationships
        $collections = UserAnimeCollection::query()
            ->with([
                'anime.anime',
                'anime.episodes',
                'animeMap.chains.entries.anime',
                'animeMap.relatedEntries.anime',
                'userLibrary'
            ])
            ->whereHas('userLibrary', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // Get unique genres from TMDB data (will be populated by the collection)
        $userGenres = collect();
        $collections->each(function ($collection) use (&$userGenres) {
            if ($collection->animeMap->most_common_tmdb_id && $collection->animeMap->tmdb_type) {
                $tmdbData = app(\App\Services\TmdbService::class);
                try {
                    $data = $collection->animeMap->tmdb_type === 'movie'
                        ? $tmdbData->getMovieBasic($collection->animeMap->most_common_tmdb_id)
                        : $tmdbData->getTvBasic($collection->animeMap->most_common_tmdb_id);

                    if ($data && isset($data['genres'])) {
                        $userGenres = $userGenres->concat($data['genres']);
                    }
                } catch (\Exception $e) {
                    logger()->error("Failed to fetch TMDB data: " . $e->getMessage());
                }
            }
        });

        $userGenres = $userGenres->unique('id')->values();

        // Apply filters and transform data
        $filteredCollections = $collections->applyFilters($this->getFilters($request));
        $presentedCollections = $filteredCollections->toPresentation();

        $messages = app(GenerateAnimeMessages::class)->handle($request, $presentedCollections);

        return response()->json([
            'success' => true,
            'messages' => $messages,
            'errors' => $errors,
            'userData' => $userData,
            'collections' => $presentedCollections,
            'genres' => $userGenres,
            'filters' => $this->getFilters($request),
        ]);
    }
}
