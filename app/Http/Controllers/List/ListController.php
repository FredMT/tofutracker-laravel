<?php

namespace App\Http\Controllers\List;

use App\Http\Controllers\Controller;
use App\Models\AnidbAnime;
use App\Models\AnimeMap;
use App\Models\Movie;
use App\Models\TvSeason;
use App\Models\TvShow;
use App\Models\UserCustomList;
use App\Actions\List\FilterListItems;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ListController extends Controller
{
    private array $processedAnimeIds = [];
    private FilterListItems $filterListItems;

    public function __construct(FilterListItems $filterListItems)
    {
        $this->filterListItems = $filterListItems;
    }

    public function show(Request $request, UserCustomList $list): Response
    {
        if (! $list->is_public && (! Auth::check() || Auth::id() !== $list->user_id)) {
            abort(404);
        }

        $list->load(['user', 'items.listable']);

        if ($list->items->isEmpty()) {
            return Inertia::render('List', [
                'list' => [
                    ...$list->only('id', 'title', 'user', 'banner_image', 'banner_type', 'description', 'is_public'),
                    'items' => [],
                    'stats' => [
                        'total' => 0,
                        'movies' => 0,
                        'tv' => 0,
                        'anime' => 0,
                        'average_rating' => null,
                        'total_runtime' => '0m',
                    ],
                    'list_genres' => [],
                    'is_empty' => true,
                ],
            ]);
        }

        $mappedItems = $this->mapListItems($list->items)->all();
        
        // Apply filters
        $filters = $this->getFiltersFromRequest($request);
        $filteredItems = $this->filterListItems->execute($mappedItems, $filters);
        
        $stats = $this->calculateStats($list->items);
        $listGenres = $this->collectDistinctGenres($list->items);

        $list = $list->toArray();
        $list['items'] = array_values($filteredItems);
        $list['stats'] = $stats;
        $list['list_genres'] = $listGenres;
        $list['is_empty'] = false;

        return Inertia::render('List', [
            'list' => $list,
        ]);
    }

    private function getFiltersFromRequest(Request $request): array
    {
        return [
            'search' => $request->query('search'),
            'genre' => $request->query('genre'),
            'rating' => $request->query('rating'),
            'released' => $request->query('released', 'any'),
        ];
    }

    private function mapListItems($items)
    {
        return $items->map(function ($item) {
            $mediaData = $this->getMediaData($item->listable, $item->listable_type);

            return [
                'id' => $item->id,
                'item_id' => $item->listable_id,
                'sort_order' => $item->sort_order,
                'created_at' => $item->created_at,
                'updated_at' => $item->updated_at,
                'poster_path' => $mediaData['poster'],
                'poster_type' => $mediaData['posterType'],
                'title' => $mediaData['title'],
                'year' => (string) $mediaData['year'],
                'vote_average' => $mediaData['voteAverage'],
                'link' => $mediaData['link'],
                'genres' => $mediaData['genres'],
            ];
        });
    }

    private function getMediaData($listable, $type)
    {
        $baseUrl = config('app.env') === 'local' ? 'http://localhost:8000' : 'https://tofutracker.com';
        $data = [
            'poster' => null,
            'posterType' => 'tmdb',
            'title' => null,
            'year' => null,
            'voteAverage' => null,
            'link' => null,
            'genres' => collect(),
        ];

        if (!$listable) {
            return $data;
        }

        switch ($type) {
            case Movie::class:
                return $this->getMovieData($listable, $baseUrl);
            case TvShow::class:
                return $this->getTvShowData($listable, $baseUrl);
            case TvSeason::class:
                return $this->getTvSeasonData($listable, $baseUrl);
            case AnimeMap::class:
                return $this->getAnimeMapData($listable, $baseUrl);
            case AnidbAnime::class:
                return $this->getAnidbAnimeData($listable, $baseUrl);
            default:
                return $data;
        }
    }

    private function getMovieData($movie, $baseUrl)
    {
        return [
            'poster' => $movie->poster,
            'posterType' => 'tmdb',
            'title' => $movie->title,
            'year' => $movie->yearRange,
            'voteAverage' => $movie->voteAverage,
            'link' => "{$baseUrl}/movie/{$movie->id}",
            'genres' => $movie->genres,
        ];
    }

    private function getTvShowData($show, $baseUrl)
    {
        return [
            'poster' => $show->poster,
            'posterType' => 'tmdb',
            'title' => $show->title,
            'year' => $show->yearRange,
            'voteAverage' => $show->voteAverage,
            'link' => "{$baseUrl}/tv/{$show->id}",
            'genres' => $show->genres,
        ];
    }

    private function getTvSeasonData($season, $baseUrl)
    {
        $data = [
            'poster' => $season->poster,
            'posterType' => 'tmdb',
            'title' => $season->title . " - " . $season->show->title,
            'year' => $season->year,
            'voteAverage' => $season->voteAverage,
            'link' => null,
            'genres' => $season->genres,
        ];

        if ($season->show) {
            $data['link'] = "{$baseUrl}/tv/{$season->show->id}/season/{$season->season_number}";
        }

        return $data;
    }

    private function getAnimeMapData($animeMap, $baseUrl)
    {
        $data = [
            'poster' => null,
            'posterType' => 'tmdb',
            'title' => null,
            'year' => null,
            'voteAverage' => null,
            'link' => "{$baseUrl}/anime/{$animeMap->id}",
            'genres' => $animeMap->genres,
        ];

        $tmdbModel = $animeMap->getTmdbModel();
        if ($tmdbModel) {
            $data['poster'] = $tmdbModel->poster;
            $data['title'] = $tmdbModel->title;
            $data['year'] = $tmdbModel->yearRange;
            $data['voteAverage'] = $tmdbModel->voteAverage;
        }

        return $data;
    }

    private function getAnidbAnimeData($anime, $baseUrl)
    {
        $data = [
            'poster' => $anime->poster,
            'posterType' => 'anidb',
            'title' => $anime->title,
            'year' => $anime->year,
            'voteAverage' => $anime->rating,
            'link' => null,
            'genres' => $anime->genres,
        ];

        try {
            $mapId = $anime->map();
            if ($mapId) {
                $data['link'] = "{$baseUrl}/anime/{$mapId}/season/{$anime->id}";
            }
        } catch (\Exception $e) {
            // If map not found, link will remain null
        }

        return $data;
    }

    private function calculateStats($items)
    {
        $stats = [
            'total' => $items->count(),
            'movies' => $items->where('listable_type', Movie::class)->count(),
            'tv' => $items->whereIn('listable_type', [TvShow::class, TvSeason::class])->count(),
            'anime' => $items->whereIn('listable_type', [AnimeMap::class, AnidbAnime::class])->count(),
            'average_rating' => 0,
            'total_runtime' => '0m',
        ];

        $this->calculateRatingStats($items, $stats);
        $this->calculateRuntimeStats($items, $stats);

        return $stats;
    }

    private function calculateRatingStats($items, &$stats)
    {
        $totalRating = 0;
        $ratedItemCount = 0;

        foreach ($items as $item) {
            if ($item->listable && isset($item->listable->voteAverage)) {
                $totalRating += $item->listable->voteAverage;
                $ratedItemCount++;
            }
        }

        $stats['average_rating'] = $ratedItemCount > 0 ? round($totalRating / $ratedItemCount, 2) : null;
    }

    private function calculateRuntimeStats($items, &$stats)
    {
        $totalRuntime = 0;

        foreach ($items as $item) {
            if (!$item->listable) continue;

            $runtime = $this->getItemRuntime($item->listable, $item->listable_type);
            $totalRuntime += $runtime;
        }

        $stats['total_runtime'] = $this->formatRuntime($totalRuntime);
    }

    private function getItemRuntime($listable, $type)
    {
        switch ($type) {
            case Movie::class:
            case TvShow::class:
            case TvSeason::class:
                return $listable->runtime ?? 0;
            
            case AnimeMap::class:
                if (in_array($listable->id, $this->processedAnimeIds)) {
                    return 0;
                }
                $this->processedAnimeIds[] = $listable->id;
                return $listable->runtime ?? 0;
            
            case AnidbAnime::class:
                try {
                    $mapId = $listable->map();
                    if (!$mapId || !in_array($mapId, $this->processedAnimeIds)) {
                        return $listable->runtime ?? 0;
                    }
                } catch (\Exception $e) {
                    // If map not found, return 0
                }
                return 0;
            
            default:
                return 0;
        }
    }

    private function formatRuntime($minutes)
    {
        $hours = floor($minutes / 60);
        $remainingMinutes = $minutes % 60;

        if ($hours > 0) {
            return "{$hours}h {$remainingMinutes}m";
        }

        return "{$remainingMinutes}m";
    }

    private function collectDistinctGenres($items)
    {
        $genres = collect();

        foreach ($items as $item) {
            if ($item->listable && isset($item->listable->genres)) {
                $genres = $genres->concat($item->listable->genres);
            }
        }

        return $genres->unique('id')->values()->all();
    }
} 