<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\UserMovie;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Enums\WatchStatus;

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
                'name' => $user->name,
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

        return Inertia::render('UserTv', [
            'userData' => [
                'id' => $user->id,
                'username' => $user->username,
                'name' => $user->name,
                'created_at' => 'Joined ' . $user->created_at->format('F Y'),
                'avatar_url' => $user->avatar_url,
            ],
            'movies' => $movies->toArray(),
            'genres' => $userGenres,
            'filters' => $this->getFilters($request),
        ]);
    }
}
