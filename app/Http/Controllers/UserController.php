<?php

namespace App\Http\Controllers;

use App\Actions\UserController\Anime\GenerateAnimeMessages;
use App\Actions\UserController\Anime\ValidateAnimeFilters;
use App\Actions\UserController\Tv\GenerateShowMessages;
use App\Actions\UserController\Tv\GetUserData;
use App\Actions\UserController\Tv\GetUserTvGenres;
use App\Actions\UserController\Tv\ValidateShowFilters;
use App\Enums\WatchStatus;
use App\Models\User;
use App\Models\UserAnimeCollection;
use App\Models\UserMovie;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display the user's profile.
     *
     * @param  string  $username
     * @return \Inertia\Response
     */
    public function show(Request $request, $username)
    {
        $user = User::where('username', $username)
            ->firstOrFail();

        $activities = $user->activities()
            ->select('id', 'metadata', 'description', 'occurred_at', 'subject_type', 'activity_type')
            ->orderBy('occurred_at', 'desc')
            ->paginate(20);

        $activities->through(function ($activity) {
            $array = $activity->toArray();

            return [
                'id' => $activity->id,
                'description' => $activity->description,
                'occurred_at_diff' => $activity->occurred_at->diffForHumans(),
                'activity_type' => $activity->activity_type,
                'metadata' => $array['metadata'] ?? [],
            ];
        });

        $isOwnProfile = $request->user() && $request->user()->id === $user->id;

        $userData = [
            'id' => $user->id,
            'username' => $user->username,
            'created_at' => 'Joined ' . $user->created_at->format('F Y'),
            'avatar' => $user->avatar,
            'banner' => $user->banner,
            'bio' => $user->bio,
        ];

        if ($isOwnProfile) {
            $userData['mustVerifyEmail'] = ! $request->user()->hasVerifiedEmail();
        }

        return Inertia::render('UserProfile', [
            'userData' => $userData,
            'activities' => Inertia::merge(fn() => $activities->items()),
            'activities_pagination' => $activities->toArray(),
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
                'avatar' => $user->avatar,
                'banner' => $user->banner,
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
            if (! empty($searchTerms)) {
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
                new \DateTime($request->to_date),
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
                            json_encode([['id' => $genreId]]),
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
            'genres' => $request->genres,
        ];
    }

    public function showTv(string $username, Request $request)
    {
        $user = User::where('username', $username)->firstOrFail();

        $userData = app(GetUserData::class)->handle($user);

        if (! $userData) {
            return abort(404);
        }

        $errors = app(ValidateShowFilters::class)->handle($request);

        if (! empty($errors)) {
            return Inertia::render('UserTv', [
                'success' => false,
                'messages' => [],
                'errors' => $errors,
                'shows' => [],
                'genres' => [],
                'filters' => $this->getFilters($request),
                'userData' => $userData,
            ]);
        }

        $userGenres = app(GetUserTvGenres::class)->handle($user);

        $shows = $user->shows()
            ->with([
                'show',
                'seasons.season.episodes',
                'seasons.episodes.episode',
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

        if (! $userData) {
            return abort(404);
        }

        $errors = app(ValidateAnimeFilters::class)->handle($request);

        // If there are any validation errors, return early with empty arrays
        if (! empty($errors)) {
            return Inertia::render('UserAnime', [
                'success' => false,
                'messages' => [],
                'errors' => $errors,
                'collections' => [],
                'genres' => [],
                'filters' => $this->getFilters($request),
                'userData' => $userData,
            ]);
        }

        // Get user's anime collections with all necessary relationships
        $collections = UserAnimeCollection::query()
            ->with([
                'anime.anime',
                'anime.episodes.episode',
                'animeMap',
                'animeMap.chains.entries.anime',
                'animeMap.relatedEntries.anime',
                'userLibrary',
                'animeMap.chains' => function ($query) {
                    $query->withCount('entries');
                },
            ])
            ->whereHas('userLibrary', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        // Cache TMDB data and collect genres
        $userGenres = collect();
        $tmdbCache = collect();

        $collections->each(function ($collection) use (&$userGenres, &$tmdbCache) {
            if ($collection->animeMap && $collection->animeMap->most_common_tmdb_id && $collection->animeMap->tmdb_type) {
                $cacheKey = "tmdb_data_{$collection->animeMap->tmdb_type}_{$collection->animeMap->most_common_tmdb_id}";

                $tmdbData = Cache::remember($cacheKey, now()->addDays(1), function () use ($collection) {
                    $tmdbService = app(\App\Services\TmdbService::class);
                    try {
                        return $collection->animeMap->tmdb_type === 'movie'
                            ? $tmdbService->getMovieBasic($collection->animeMap->most_common_tmdb_id)
                            : $tmdbService->getTvBasic($collection->animeMap->most_common_tmdb_id);
                    } catch (\Exception $e) {
                        logger()->error('Failed to fetch TMDB data: ' . $e->getMessage());

                        return null;
                    }
                });

                if ($tmdbData && isset($tmdbData['genres'])) {
                    $userGenres = $userGenres->concat($tmdbData['genres']);
                }

                $tmdbCache->put($cacheKey, $tmdbData);
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
}
