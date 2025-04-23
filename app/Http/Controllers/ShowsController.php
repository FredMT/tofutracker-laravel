<?php

namespace App\Http\Controllers;

use App\Actions\ShowsPage\FetchAndGroupShowsAction;
use App\Actions\ShowsPage\FetchGenreShowData;
use App\Models\Anime\AnimeMap;
use App\Models\Tmdb\TmdbContentVideo;
use App\Models\Tmdb\TmdbVideo;
use App\Models\TmdbScheduleEpisode;
use App\Models\TvShow;
use App\Services\TmdbService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Stevebauman\Location\Facades\Location;

class ShowsController extends Controller
{
    protected TmdbService $tmdbService;

    protected FetchAndGroupShowsAction $fetchAndGroupShowsAction;

    protected FetchGenreShowData $fetchGenreShowData;

    public function __construct(TmdbService $tmdbService, FetchAndGroupShowsAction $fetchAndGroupShowsAction, FetchGenreShowData $fetchGenreShowData)
    {
        $this->tmdbService = $tmdbService;
        $this->fetchAndGroupShowsAction = $fetchAndGroupShowsAction;
        $this->fetchGenreShowData = $fetchGenreShowData;
    }

    public function index(Request $request)
    {
        $validCountryCodes = array_keys(Config::get('countries.countries', []));

        $validated = $request->validate([
            'providerCountry' => [
                'nullable',
                'string',
                'size:2',
                'uppercase',
                Rule::in($validCountryCodes),
            ],
        ]);

        $countryCode = $validated['providerCountry'] ?? null;

        if ($countryCode && ! array_key_exists(strtoupper($countryCode), config('countries.countries'))) {
            $countryCode = null;
        }

        try {
            $showsData = $this->getTrendingShowsData();
        } catch (\Exception $e) {
            Log::error('Failed to get trending shows for index page: '.$e->getMessage(), ['exception' => $e]);
            $showsData = [];
        }

        return Inertia::render('Shows', [
            'shows' => $showsData,
            'trailers' => $this->getDeferredTrailerData(),
            'genres' => $this->fetchGenreShowData->execute(),
            'airingShows' => $this->getDeferredScheduleData(),
            'providers' => $this->getDeferredStreamingData($countryCode),
            'user_region' => Location::get()?->countryCode ?? 'US',
        ]);
    }

    private function getTrendingShowsData(): array
    {
        $validShows = collect();
        $targetShowCount = 20;
        $processedShowIds = [];
        $page = 1;

        $ignoredIds = config('trending.ignored_ids', []);
        $genreMap = config('genres', []);

        while ($validShows->count() < $targetShowCount) {
            $response = $this->tmdbService->getTrendingTvPaginated($page);
            $showsFromApi = $response['results'] ?? [];

            if (empty($showsFromApi)) {
                Log::warning("No more shows from API on page {$page} while fetching for index. Found {$validShows->count()} valid shows.");
                break;
            }

            $apiShowIds = collect($showsFromApi)->pluck('id')->filter()->all();

            if (empty($apiShowIds)) {
                $page++;

                continue;
            }

            $animeShowIds = AnimeMap::where('tmdb_type', 'tv')
                ->whereNotNull('most_common_tmdb_id')
                ->whereIn('most_common_tmdb_id', $apiShowIds)
                ->pluck('most_common_tmdb_id')
                ->all();

            $filteredBatch = collect($showsFromApi)->filter(function ($show) use ($processedShowIds, $ignoredIds, $animeShowIds) {
                return isset($show['id'])
                    && ! in_array($show['id'], $processedShowIds)
                    && ! in_array($show['id'], $ignoredIds)
                    && ! in_array($show['id'], $animeShowIds);
            });

            $batchIds = $filteredBatch->pluck('id')->all();

            if (empty($batchIds)) {
                $page++;

                continue;
            }

            $tvShowDataMap = TvShow::whereIn('id', $batchIds)
                ->get(['id', 'data'])
                ->keyBy('id')
                ->map(function ($tvShow) {
                    return [
                        'logo_path' => $tvShow->highestVotedLogoPath ?? null,
                    ];
                });

            foreach ($filteredBatch as $show) {
                if ($validShows->count() >= $targetShowCount) {
                    break 2;
                }

                $processedShowIds[] = $show['id'];

                $supplementalData = $tvShowDataMap->get($show['id']);
                $logoPath = $supplementalData['logo_path'] ?? null;
                $year = isset($show['first_air_date']) && ! empty($show['first_air_date']) ? substr($show['first_air_date'], 0, 4) : null;
                $genres = collect($show['genre_ids'] ?? [])
                    ->map(fn ($id) => $genreMap[$id] ?? null)
                    ->filter()
                    ->values();
                $rating = isset($show['vote_average']) && $show['vote_average'] > 0 ? round($show['vote_average'], 1) : null;
                $title = $show['name'] ?? null;
                $backdrop = $show['backdrop_path'] ?? null;
                $poster = $show['poster_path'] ?? null;
                $overview = $show['overview'] ?? null;

                if (
                    ! empty($title) &&
                    ! empty($logoPath) &&
                    ! empty($backdrop) &&
                    ! empty($poster) &&
                    ! empty($overview) &&
                    ! empty($year) &&
                    $genres->isNotEmpty() &&
                    ! is_null($rating)
                ) {
                    $validShows->push([
                        'id' => $show['id'],
                        'title' => $title,
                        'logo' => $logoPath,
                        'backdrop' => $backdrop,
                        'poster' => $poster,
                        'overview' => $overview,
                        'year' => $year,
                        'genres' => $genres->all(),
                        'rating' => $rating,
                    ]);
                }
            }

            $page++;
        }

        if ($validShows->count() < $targetShowCount) {
            Log::warning("Could only find {$validShows->count()} valid trending shows out of {$targetShowCount} requested for index page.");
        }

        return $validShows->all();
    }

    private function getDeferredTrailerData(): callable
    {
        return Inertia::defer(function () {
            $potentialVideos = TmdbVideo::where('site', 'YouTube')
                ->where('type', 'Trailer')
                ->where('official', true)
                ->orderBy('published_at', 'desc')
                ->take(100)
                ->get(['id', 'key', 'name', 'published_at']);

            if ($potentialVideos->isEmpty()) {
                return [];
            }

            $potentialVideoIds = $potentialVideos->pluck('id')->all();

            $validVideoIds = TmdbContentVideo::whereIn('video_id', $potentialVideoIds)
                ->where('content_type', TvShow::class)
                ->distinct()
                ->pluck('video_id')
                ->all();

            if (empty($validVideoIds)) {
                return [];
            }

            $finalVideoIds = $potentialVideos
                ->whereIn('id', $validVideoIds)
                ->take(10)
                ->pluck('id')
                ->all();

            if (empty($finalVideoIds)) {
                return [];
            }

            $finalVideos = TmdbVideo::whereIn('id', $finalVideoIds)->get();

            $contentVideoPivot = TmdbContentVideo::whereIn('video_id', $finalVideoIds)
                ->where('content_type', TvShow::class)
                ->get(['video_id', 'content_id']);

            $videoToShowIdMap = $contentVideoPivot->pluck('content_id', 'video_id');

            $relatedShowIds = $videoToShowIdMap->values()->unique()->filter()->all();
            $tvShowsDataMap = collect();
            if (! empty($relatedShowIds)) {
                $tvShowsDataMap = TvShow::whereIn('id', $relatedShowIds)
                    ->get(['id', 'data'])
                    ->keyBy('id');
            }

            $videosById = $finalVideos->keyBy('id');
            $orderedVideos = collect($finalVideoIds)->map(function ($id) use ($videosById) {
                return $videosById->get($id);
            })->filter();

            return $orderedVideos->map(function (TmdbVideo $video) use ($videoToShowIdMap, $tvShowsDataMap) {
                $showId = $videoToShowIdMap->get($video->id);
                $show = $showId ? $tvShowsDataMap->get($showId) : null;

                return [
                    'id' => $video->id,
                    'videoId' => $video->key,
                    'showName' => $show ? $show->title : 'Unknown Show',
                    'videoTitle' => $video->name,
                    'showId' => $show ? $show->id : null,
                    'publishedAt' => $video->published_at->timestamp,
                ];
            })->all();
        });
    }

    private function getDeferredScheduleData(): callable
    {
        return Inertia::defer(function () {
            $upcomingEpisodes = TmdbScheduleEpisode::where('episode_date', '>', now())
                ->orderBy('episode_date', 'asc')
                ->with(['tvShow:id,data'])
                ->take(10)
                ->get();

            if ($upcomingEpisodes->isEmpty()) {
                return [];
            }

            return $upcomingEpisodes->map(function (TmdbScheduleEpisode $episode) {
                $show = $episode->tvShow;

                $backdropPath = $show?->backdrop ?? null;
                $logoPath = $show?->highestVotedLogoPath ?? null;
                $showId = $show?->id ?? $episode->show_id;
                $seasonNumber = $episode->season_number ?? 0;

                return [
                    'id' => $episode->id,
                    'title' => $episode->episode_name ?? ($show?->title ?? 'Episode '.$episode->episode_number),
                    'episode_date' => $episode->episode_date->timestamp,
                    'episode_number' => $episode->episode_number,
                    'episode_name' => $episode->episode_name,
                    'season_number' => $seasonNumber,
                    'backdrop' => $backdropPath,
                    'logo' => $logoPath,
                    'link' => $showId ? "/tv/{$showId}/season/{$seasonNumber}" : null,
                    'type' => 'tv',
                ];
            })->all();
        });
    }

    private function getDeferredStreamingData(?string $countryCode = null): callable
    {
        $countryCode = $countryCode ?? Location::get()?->countryCode ?? 'US';
        $countryCode = strtoupper($countryCode);

        return Inertia::defer(function () use ($countryCode) {
            return Cache::remember("shows_page_providers_{$countryCode}", now()->addWeek(), function () use ($countryCode) {
                return $this->fetchAndGroupShowsAction->execute($countryCode);
            });
        });
    }
}
