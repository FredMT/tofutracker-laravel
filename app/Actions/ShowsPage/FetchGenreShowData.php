<?php

namespace App\Actions\ShowsPage;

use App\Models\Anime\AnimeMap;
use App\Models\Tmdb\Genre;
use App\Models\Tmdb\TmdbContentGenre;
use App\Models\Tmdb\TmdbContentKeyword;
use App\Models\TvShow;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class FetchGenreShowData
{
    private int $showLimit = 500;

    private int $minVoteCount = 500;

    private int $showsPerGenreLimit = 20;

    private array $preferredGenreOrder = [
        'Western', 'Horror', 'Kids', 'Drama', 'Comedy', 'Family', 'Sci-Fi & Fantasy', 'Talk', 'Action & Adventure', 'Romance',
    ];

    private array $excludedGenreIds = [16]; // Animation

    public function execute()
    {
        return Cache::remember('shows_page_genre_data', now()->addSecond(), function () {
            $topRatedShows = $this->getTopRatedShows();
            
            $topShowIds = $topRatedShows->pluck('id')->all();
            
            $topRatedShows = $this->filterOutAnimeAndIgnored($topRatedShows, $topShowIds);
            
            if ($topRatedShows->isEmpty()) {
                return [];
            }
            
            $topShowIds = $topRatedShows->pluck('id')->all();
            $pivotEntries = $this->getGenrePivotEntries($topShowIds);
            
            if ($pivotEntries->isEmpty()) {
                return [];
            }
            
            $genresMap = Genre::pluck('name', 'id');
            $genreNameToId = $genresMap->flip();
            $preferredGenreIds = $this->getPreferredGenreIds($genreNameToId);
            
            $showGenreMap = $pivotEntries->groupBy('content_id');
            $assignedShowIds = [];
            $genreData = [];
            
            $fantasyDrama = $this->getFantasyDramaShows($topRatedShows, $showGenreMap, $assignedShowIds);
            if ($fantasyDrama->isNotEmpty()) {
                $genreData[] = $this->formatGenreData('Fantasy Drama', $fantasyDrama);
            }
            
            $cyberpunk = $this->getCyberpunkShows($assignedShowIds);
            if ($cyberpunk->isNotEmpty()) {
                $genreData[] = $this->formatGenreData('Cyberpunk', $cyberpunk);
            }
            
            foreach ($preferredGenreIds as $genreName => $genreId) {
                if (in_array($genreId, $this->excludedGenreIds)) {
                    continue;
                }
                $shows = $this->getShowsForGenre($topRatedShows, $showGenreMap, $genreId, $genreName, $assignedShowIds);
                if ($shows->isNotEmpty()) {
                    $genreData[] = $this->formatGenreData($genreName, $shows);
                }
            }
            
            return $genreData;
        });
    }

    private function getTopRatedShows(): Collection
    {
        return TvShow::where('vote_count', '>', $this->minVoteCount)
            ->orderBy('vote_average', 'desc')
            ->take($this->showLimit)
            ->get(['id', 'data', 'vote_count', 'vote_average']);
    }

    private function filterOutAnimeAndIgnored(Collection $shows, array $topShowIds): Collection
    {
        $animeIds = AnimeMap::whereIn('most_common_tmdb_id', $topShowIds)
            ->where('tmdb_type', 'tv')
            ->pluck('most_common_tmdb_id')
            ->all();

        $ignoredIds = config('trending.ignored_ids', []);

        return $shows->whereNotIn('id', array_merge($animeIds, $ignoredIds));
    }

    private function getGenrePivotEntries(array $topShowIds): Collection
    {
        return TmdbContentGenre::whereIn('content_id', $topShowIds)
            ->where('content_type', TvShow::class)
            ->get(['genre_id', 'content_id']);
    }

    private function getPreferredGenreIds(Collection $genreNameToId): Collection
    {
        return collect($this->preferredGenreOrder)
            ->filter(fn ($name) => $genreNameToId->has($name))
            ->mapWithKeys(fn ($name) => [$name => $genreNameToId[$name]]);
    }

    private function getFantasyDramaShows(Collection $shows, Collection $showGenreMap, array &$assigned): Collection
    {
        $results = collect();
        $fantasyId = 14;
        $scifiId = 10765;
        $dramaId = 18;

        foreach ($shows as $show) {
            if (in_array($show->id, $assigned)) {
                continue;
            }

            $genres = $showGenreMap->get($show->id, collect())->pluck('genre_id')->all();
            if (in_array($dramaId, $genres) && (in_array($fantasyId, $genres) || in_array($scifiId, $genres))) {
                if (! array_intersect($this->excludedGenreIds, $genres)) {
                    if ($this->isShowValid($show)) {
                        $results->push($this->formatShow($show, 'Fantasy Drama'));
                        $assigned[] = $show->id;
                    }
                }
            }

            if ($results->count() >= $this->showsPerGenreLimit) {
                break;
            }
        }

        return $results;
    }

    private function getCyberpunkShows(array &$assigned): Collection
    {
        $keyword1 = 12190;

        $keywords = TmdbContentKeyword::where('content_type', TvShow::class)
            ->where('keyword_id', $keyword1)
            ->get(['content_id', 'keyword_id']);

        $grouped = $keywords->groupBy('content_id')->filter(fn ($items) => $items->pluck('keyword_id')->unique()->sort()->values()->all() === [$keyword1]
        );

        $matchingIds = $grouped->keys();

        $animeMappedIds = AnimeMap::whereIn('most_common_tmdb_id', $matchingIds)
            ->where('tmdb_type', 'tv')
            ->pluck('most_common_tmdb_id')
            ->all();

        $filteredIds = $matchingIds->diff($animeMappedIds);

        $shows = TvShow::whereIn('id', $filteredIds)
            ->orderBy('vote_average', 'desc')
            ->get();

        $results = collect();
        foreach ($shows as $show) {
            if (in_array($show->id, $assigned)) {
                continue;
            }

            if ($this->isShowValid($show)) {
                $results->push($this->formatShow($show, 'Cyberpunk'));
                $assigned[] = $show->id;
            }

            if ($results->count() >= $this->showsPerGenreLimit) {
                break;
            }
        }

        return $results;
    }

    private function getShowsForGenre(Collection $shows, Collection $genreMap, int $genreId, string $genreName, array &$assigned): Collection
    {
        $results = collect();

        foreach ($shows as $show) {
            if (in_array($show->id, $assigned)) {
                continue;
            }

            $genres = $genreMap->get($show->id, collect())->pluck('genre_id')->all();

            if (in_array($genreId, $genres) && ! array_intersect($this->excludedGenreIds, $genres)) {
                if ($this->isShowValid($show)) {
                    $results->push($this->formatShow($show, $genreName));
                    $assigned[] = $show->id;
                }
            }

            if ($results->count() >= $this->showsPerGenreLimit) {
                break;
            }
        }

        return $results;
    }

    private function formatGenreData(string $name, Collection $shows): array
    {
        return [
            'name' => $name,
            'shows' => $shows->values()->all(),
        ];
    }

    private function formatShow($show): array
    {
        return [
            'id' => $show->id,
            'title' => $show->title,
            'poster' => $show->poster,
            'rating' => number_format($show->voteAverage, 1, '.', ''),
            'year' => $show->year,
        ];
    }

    private function isShowValid($show): bool
    {
        return $show->title && $show->poster && $show->vote_average !== null && $show->year;
    }
}
