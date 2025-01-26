<?php

namespace App\Actions\Trending;

use App\Actions\Tv\TvShowActions;
use App\Jobs\UpdateOrCreateMovieData;
use App\Models\Anime\AnimeMap;
use App\Models\Movie;
use App\Models\TvShow;
use App\Services\TmdbService;
use Carbon\Carbon;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;

class GetTrendingAction
{
    private array $movies = [];

    private array $tvShows = [];

    private array $anime = [];

    private array $genreMap;

    private array $ignoredIds;

    public function __construct(
        private TmdbService $tmdbService,
        private TvShowActions $tvShowActions
    ) {
        $this->genreMap = config('genres');
        $this->ignoredIds = config('trending.ignored_ids', []);
        set_time_limit(120); // Set 2 minutes timeout
    }

    public function execute(): array
    {
        return Cache::remember('trending_all_categorized', now()->addMinutes(config('trending.cache_duration')), function () {
            $page = 1;
            $animeMapIds = AnimeMap::whereNotNull('most_common_tmdb_id')
                ->pluck('id', 'most_common_tmdb_id')
                ->toArray();

            while (
                ($this->needMoreResults()) &&
                ($trendingData = $this->tmdbService->getTrendingAllPaginated($page++))
            ) {
                foreach ($trendingData['results'] as $item) {
                    if (count($this->movies) >= 10 && count($this->tvShows) >= 10 && count($this->anime) >= 10) {
                        break 2;
                    }

                    // Skip if ID is in ignored list
                    if (in_array($item['id'], $this->ignoredIds)) {
                        continue;
                    }

                    $this->processItem($item, $animeMapIds);
                }

                if (! isset($trendingData['results']) || empty($trendingData['results'])) {
                    break;
                }
            }

            return [
                'movies' => array_slice($this->movies, 0, 10),
                'tv_shows' => array_slice($this->tvShows, 0, 10),
                'anime' => array_slice($this->anime, 0, 10),
            ];
        });
    }

    private function needMoreResults(): bool
    {
        return count($this->movies) < 10 ||
            count($this->tvShows) < 10 ||
            count($this->anime) < 10;
    }

    private function processItem(array $item, array $animeMapIds): void
    {
        $tmdbId = (string) $item['id'];

        // Check if this is an anime
        if (isset($animeMapIds[$tmdbId])) {
            if (count($this->anime) < 10) {
                $this->anime[] = $this->formatAnimeItem($item, $animeMapIds[$tmdbId]);
            }

            return;
        }

        // Process as movie or TV show
        if ($item['media_type'] === 'movie' && count($this->movies) < 10) {
            $this->movies[] = $this->formatMovieItem($item);
        } elseif ($item['media_type'] === 'tv' && count($this->tvShows) < 10) {
            $this->tvShows[] = $this->formatTvItem($item);
        }
    }

    private function formatMovieItem(array $item): array
    {
        $logoPath = $this->getMovieLogoPath($item['id']);

        return [
            'title' => $item['title'],
            'release_date' => Carbon::parse($item['release_date'])->format('jS F, Y'),
            'genres' => $this->getGenreNames($item['genre_ids']),
            'overview' => $item['overview'],
            'backdrop_path' => $item['backdrop_path'],
            'poster_path' => $item['poster_path'],
            'logo_path' => $logoPath,
            'vote_average' => $item['vote_average'],
            'popularity' => $item['popularity'],
            'link' => $item['id'],
            'type' => 'movie',
        ];
    }

    private function formatTvItem(array $item): array
    {
        $logoPath = $this->getTvLogoPath($item['id']);

        return [
            'title' => $item['name'],
            'release_date' => Carbon::parse($item['first_air_date'])->format('jS F, Y'),
            'genres' => $this->getGenreNames($item['genre_ids']),
            'overview' => $item['overview'],
            'backdrop_path' => $item['backdrop_path'],
            'poster_path' => $item['poster_path'],
            'logo_path' => $logoPath,
            'popularity' => $item['popularity'],
            'vote_average' => $item['vote_average'],
            'link' => $item['id'],
            'type' => 'tv',
        ];
    }

    private function formatAnimeItem(array $item, string $animeMapId): array
    {
        $logoPath = $item['media_type'] === 'movie'
            ? $this->getMovieLogoPath($item['id'])
            : $this->getTvLogoPath($item['id']);

        $releaseDate = $item['media_type'] === 'movie'
            ? $item['release_date']
            : $item['first_air_date'];

        return [
            'title' => $item['media_type'] === 'movie' ? $item['title'] : $item['name'],
            'release_date' => Carbon::parse($releaseDate)->format('jS F, Y'),
            'genres' => $this->getGenreNames($item['genre_ids']),
            'overview' => $item['overview'],
            'backdrop_path' => $item['backdrop_path'],
            'poster_path' => $item['poster_path'],
            'logo_path' => $logoPath,
            'popularity' => $item['popularity'],
            'vote_average' => $item['vote_average'],
            'link' => $animeMapId,
            'type' => 'anime',
        ];
    }

    private function getGenreNames(array $genreIds): array
    {
        return array_map(
            fn ($id) => $this->genreMap[$id] ?? null,
            $genreIds
        );
    }

    private function getMovieLogoPath(string $movieId): ?string
    {
        $movie = Movie::find($movieId);

        if (! $movie) {
            Bus::dispatchSync(new UpdateOrCreateMovieData($movieId));
            $movie = Movie::find($movieId);
        }

        return $movie?->highestVotedLogoPath;
    }

    private function getTvLogoPath(string $tvId): ?string
    {
        $show = TvShow::find($tvId);

        if (! $show) {
            $show = $this->tvShowActions->getShowAndQueueUpdateIfNeeded($tvId);
        }

        return $show?->highestVotedLogoPath;
    }
}
