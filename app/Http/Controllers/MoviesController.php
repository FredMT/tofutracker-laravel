<?php

namespace App\Http\Controllers;

use App\Models\Movie;
use App\Services\TmdbService;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Kiritokatklian\LaravelColorPalette\Facades\ColorPalette;

class MoviesController extends Controller
{
    protected TmdbService $tmdbService;

    public function __construct(TmdbService $tmdbService)
    {
        $this->tmdbService = $tmdbService;
    }

    public function index(Request $request)
    {
        $region = $request->query('region', 'US');
        $cache_key = "movies_data_{$region}";
        $cache_ttl = seconds_until('tomorrow 8 am');

        $data = Cache::remember($cache_key, $cache_ttl, function () use ($region) {
            $popular_movies = $this->processPopularMovies($this->tmdbService->getPopularMovies($region));
            $now_playing = $this->processMoviesList($this->tmdbService->getNowPlayingMovies($region));
            $upcoming = $this->processMoviesList($this->tmdbService->getUpcomingMovies($region));
            $top_rated = $this->processMoviesList($this->tmdbService->getTopRatedMovies($region));
            $navbar_color = $this->getNavbarColor($popular_movies);
            
            return [
                'popular' => $popular_movies,
                'now_playing' => $now_playing,
                'upcoming' => $upcoming,
                'top_rated' => $top_rated,
                'navbar_color' => $navbar_color,
            ];
        });

        $genres_data = $this->getGenresWithMovies();
        $data['genres'] = $genres_data;

        return Inertia::render('Movies', $data);
    }

    private function processPopularMovies(array $movies_data): array
    {
        $genre_map = config('genres');

        return collect($movies_data['results'] ?? [])
            ->map(function ($movie) use ($genre_map) {
                $year = isset($movie['release_date']) && ! empty($movie['release_date'])
                    ? substr($movie['release_date'], 0, 4)
                    : null;

                $genres = collect($movie['genre_ids'] ?? [])
                    ->map(function ($genre_id) use ($genre_map) {
                        return $genre_map[$genre_id] ?? 'Unknown';
                    })
                    ->values()
                    ->all();

                $logo_path = null;

                if (isset($movie['id'])) {
                    try {
                        $movie_model = Movie::find($movie['id']);
                        if ($movie_model) {
                            $logo_path = $movie_model->highestVotedLogoPath;
                        }
                    } catch (Exception $e) {
                    }
                }

                return [
                    'id' => $movie['id'],
                    'title' => $movie['title'],
                    'overview' => $movie['overview'],
                    'year' => $year,
                    'genres' => $genres,
                    'backdrop' => $movie['backdrop_path'],
                    'logo' => $logo_path,
                    'poster' => $movie['poster_path'],
                    'rating' => round($movie['vote_average'] * 10) / 10,
                ];
            })
            ->values()
            ->all();
    }

    private function processMoviesList(array $movies_data, bool $with_backdrop = false): array
    {
        return collect($movies_data['results'] ?? [])
            ->map(function ($movie) use ($with_backdrop) {
                $year = isset($movie['release_date']) && ! empty($movie['release_date'])
                    ? substr($movie['release_date'], 0, 4)
                    : null;

                return [
                    'id' => $movie['id'],
                    'title' => $movie['title'],
                    'poster' => $movie['poster_path'],
                    'rating' => round($movie['vote_average'] * 10) / 10,
                    'year' => $year,
                    ...($with_backdrop ? ['backdrop' => $movie['backdrop_path']] : []),
                ];
            })
            ->values()
            ->all();
    }

    private function getGenresWithMovies(): array
    {
        $cache_key = "movie_genres";
        $cache_ttl = seconds_until('next sunday at 8 am');

        return Cache::remember($cache_key, $cache_ttl, function () {
            $genre_map = config('genres');
            $excluded_genre_ids = [10759, 10762, 10763, 10764, 10765, 10766, 10767, 10768, 10770];
            $genres_with_movies = [];

            foreach ($genre_map as $genre_id => $genre_name) {
                // Skip excluded genre IDs
                if (in_array($genre_id, $excluded_genre_ids)) {
                    continue;
                }

                try {
                    $movies_data = $this->tmdbService->getMoviesByGenre($genre_id);
                    $movies = $this->processMoviesList($movies_data, true);
                    $movies = array_slice($movies, 0, 20);

                    $genres_with_movies[] = [
                        'id' => $genre_id,
                        'name' => $genre_name,
                        'movies' => $movies,
                    ];
                } catch (\Exception $e) {
                    logger()->error("Error fetching movies for genre {$genre_name} (ID: {$genre_id}): " . $e->getMessage());
                }
            }

            return $genres_with_movies;
        });
    }

    private function getNavbarColor(array $popular_movies): ?array
    {
        if (empty($popular_movies)) {
            return null;
        }

        $first_movie = $popular_movies[0] ?? null;

        if (! $first_movie || empty($first_movie['backdrop'])) {
            return null;
        }

        $movie_id = $first_movie['id'];
        $cache_key = "movie_{$movie_id}_navbar_color";
        $cache_ttl = seconds_until('next sunday 8 am');

        return Cache::remember($cache_key, $cache_ttl, function () use ($first_movie) {
            try {
                if (! $first_movie['backdrop']) {
                    return null;
                }

                return ColorPalette::getPalette("https://image.tmdb.org/t/p/w500{$first_movie['backdrop']}");
            } catch (Exception $e) {
                logger()->error("Failed to get color palette for movie ID {$first_movie['id']}: ".$e->getMessage());

                return null;
            }
        });
    }
}
