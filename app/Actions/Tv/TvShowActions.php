<?php

namespace App\Actions\Tv;

use App\Jobs\UpdateTvSeason;
use App\Jobs\UpdateTvShow;
use App\Models\Tmdb\Genre;
use App\Models\Tmdb\TmdbKeyword;
use App\Models\Tmdb\TmdbVideo;
use App\Models\TmdbProvider;
use App\Models\TvEpisode;
use App\Models\TvSeason;
use App\Models\TvShow;
use App\Services\TmdbService;
use Illuminate\Support\Facades\Cache;

class TvShowActions
{
    public function __construct(
        private readonly TmdbService $tmdbService,
    ) {}

    public function fetchTvShow(string $id): array
    {
        $cacheTTL = seconds_until('tomorrow at 8 am');
        return Cache::remember("tv.{$id}", $cacheTTL, function () use ($id) {

            $tvShow = TvShow::find($id);

            if (! $tvShow) {
                $showData = $this->tmdbService->getTv($id);
                $tvShow = $this->createTvShow($showData);
            }

            return $tvShow->filteredData;
        });
    }

    /**
     * Get show and queue update if needed
     */
    public function getShowAndQueueUpdateIfNeeded(string $tvId): TvShow
    {
        $tvShow = TvShow::find($tvId);

        if (! $tvShow) {
            $showData = $this->tmdbService->getTv($tvId);

            return $this->createTvShow($showData);
        }

        $showData = $this->tmdbService->getTv($tvId, $tvShow->etag);

        return $tvShow;
    }

    /**
     * Get season and queue update if needed
     */
    public function getSeasonAndQueueUpdateIfNeeded(TvShow $tvShow, string $seasonNumber): TvSeason
    {
        $season = $tvShow->seasons
            ->where('season_number', $seasonNumber)
            ->first();

        if (! $season) {
            return $this->createTvSeason($tvShow, (int) $seasonNumber);
        }

        $latestSeasonData = $this->tmdbService->getSeason($tvShow->id, $seasonNumber, $season->etag);

        if ($latestSeasonData !== null) {
            UpdateTvSeason::dispatch($season, $latestSeasonData);
        }

        return $season;
    }

    public function errorResponse(\Exception $e)
    {
        abort(500, 'Failed to retrieve TV season');
    }

    /**
     * Create a new TV show
     */
    public function createTvShow(array $data): TvShow
    {
        $showData = $data['data'];
        $seasons = $showData['seasons'] ?? [];
        unset($showData['seasons']);

        $tvShow = TvShow::create([
            'id' => $data['data']['id'],
            'data' => $showData,
            'etag' => $data['etag'],
            'popularity' => $showData['popularity'] ?? null,
            'vote_average' => $showData['vote_average'] ?? null,
            'vote_count' => $showData['vote_count'] ?? null,
        ]);

        foreach ($seasons as $seasonData) {
            $this->createTvSeason($tvShow, $seasonData['season_number']);
        }

        return $tvShow;
    }

    /**
     * Create a new TV season
     *
     * @param  array  $data
     */
    public function createTvSeason(TvShow $tvShow, int $seasonNumber): TvSeason
    {
        $seasonData = $this->tmdbService->getSeason($tvShow->id, $seasonNumber);

        $seasonDetails = $seasonData['data'];
        $episodes = $seasonDetails['episodes'] ?? [];
        unset($seasonDetails['episodes']);

        $tvSeason = TvSeason::create([
            'id' => $seasonData['data']['id'],
            'show_id' => $tvShow->id,
            'season_number' => $seasonNumber,
            'data' => $seasonDetails,
            'etag' => $seasonData['etag'],
        ]);

        if (! empty($episodes)) {
            TvEpisode::insert(
                collect($episodes)->map(fn ($episode) => [
                    'id' => $episode['id'],
                    'show_id' => $tvShow->id,
                    'season_id' => $tvSeason->id,
                    'data' => json_encode($episode),
                    'created_at' => now(),
                    'updated_at' => now(),
                ])->all()
            );
        }

        return $tvSeason;
    }

    public function updateTvShow(TvShow $tvShow, ?array $data = null, bool $checkETag = true): TvShow
    {
        try {
            if (! $data) {
                $tmdbService = app(TmdbService::class);

                if ($checkETag) {
                    // Use the existing ETag for conditional request
                    $response = $tmdbService->getTv($tvShow->id, $tvShow->etag);

                    // If null is returned, it means the resource has not changed (304 Not Modified)
                    if ($response === null) {
                        return $tvShow;
                    }
                } else {
                    // Standard request without ETag check
                    $response = $tmdbService->getTv($tvShow->id);
                }

                $data = $response;
            }

            $showData = $data['data'];
            $seasons = $showData['seasons'] ?? [];
            unset($showData['seasons']);

            $tvShow->update([
                'data' => $showData,
                'tvdb_id' => $showData['external_ids']['tvdb_id'] ?? null,
                'etag' => $data['etag'],
                'popularity' => $showData['popularity'] ?? null,
                'vote_average' => $showData['vote_average'] ?? null,
                'vote_count' => $showData['vote_count'] ?? null,
            ]);

            $this->processWatchProviders($tvShow);

            $this->processGenres($tvShow);

            $this->processKeywords($tvShow);

            $this->processVideos($tvShow);

            foreach ($seasons as $seasonData) {
                $season = $tvShow->seasons()->firstWhere('season_number', $seasonData['season_number']);

                if ($season) {
                    $this->updateTvSeason($season, null, $checkETag);
                } else {
                    $this->createTvSeason($tvShow, $seasonData['season_number']);
                }
            }

            return $tvShow->refresh();
        } catch (\Exception $e) {
            logger()->error('Error updating TV show: '.$e->getMessage());
            throw $e;
        }
    }

    private function processWatchProviders(TvShow $tvShow): void
    {
        $watchProviders = $tvShow->data['watch/providers']['results'] ?? [];

        if (empty($watchProviders)) {
            return;
        }

        foreach ($watchProviders as $countryCode => $countryData) {
            foreach (['flatrate', 'buy', 'rent', 'ads', 'free'] as $providerType) {
                if (! isset($countryData[$providerType])) {
                    continue;
                }

                foreach ($countryData[$providerType] as $providerData) {
                    $providerId = $providerData['provider_id'];

                    $provider = TmdbProvider::updateOrCreate(
                        ['id' => $providerId],
                        [
                            'name' => $providerData['provider_name'],
                            'logo_path' => $providerData['logo_path'],
                        ]
                    );

                    $tvShow->attachProvider($provider, $providerType, $countryCode);
                }
            }
        }
    }

    private function processGenres(TvShow $tvShow): void
    {
        $genres = $tvShow->data['genres'] ?? [];

        if (empty($genres)) {
            return;
        }

        $tvShow->genreRelations()->delete();

        foreach ($genres as $genreData) {
            if (! isset($genreData['id']) || ! isset($genreData['name'])) {
                continue;
            }

            $genre = Genre::updateOrCreate(
                ['id' => $genreData['id']],
                [
                    'name' => $genreData['name'],
                ]
            );

            $tvShow->attachGenre($genre);
        }
    }

    private function processKeywords(TvShow $tvShow): void
    {
        // TV show keywords are nested in 'keywords.results'
        $keywords = $tvShow->data['keywords']['results'] ?? [];

        if (empty($keywords)) {
            return;
        }

        $tvShow->keywordRelations()->delete();

        foreach ($keywords as $keywordData) {
            if (! isset($keywordData['id']) || ! isset($keywordData['name'])) {
                continue;
            }

            $keyword = TmdbKeyword::updateOrCreate(
                ['id' => $keywordData['id']],
                [
                    'name' => $keywordData['name'],
                ]
            );

            $tvShow->attachKeyword($keyword);
        }
    }

    private function processVideos(TvShow $tvShow): void
    {
        // TV show videos are nested in 'videos.results'
        $videos = $tvShow->data['videos']['results'] ?? [];

        if (empty($videos)) {
            return;
        }

        $tvShow->videoRelations()->delete();

        foreach ($videos as $videoData) {
            if (! isset($videoData['id']) || ! isset($videoData['name'])) {
                continue;
            }

            $video = TmdbVideo::updateOrCreate(
                ['id' => $videoData['id']],
                [
                    'key' => $videoData['key'] ?? null,
                    'name' => $videoData['name'] ?? null,
                    'site' => $videoData['site'] ?? null,
                    'size' => $videoData['size'] ?? null,
                    'type' => $videoData['type'] ?? null,
                    'official' => $videoData['official'] ?? false,
                    'iso_639_1' => $videoData['iso_639_1'] ?? null,
                    'iso_3166_1' => $videoData['iso_3166_1'] ?? null,
                    'published_at' => isset($videoData['published_at']) ? \Carbon\Carbon::parse($videoData['published_at']) : null,
                ]
            );

            $tvShow->attachVideo($video);
        }
    }

    public function updateTvSeason(TvSeason $tvSeason, ?array $data = null, bool $checkETag = true): TvSeason
    {
        try {
            if (! $data) {
                $tmdbService = app(TmdbService::class);

                if ($checkETag) {
                    $response = $tmdbService->getSeason($tvSeason->show_id, $tvSeason->season_number, $tvSeason->etag);

                    if ($response === null) {
                        return $tvSeason;
                    }
                } else {
                    $response = $tmdbService->getSeason($tvSeason->show_id, $tvSeason->season_number);
                }

                $data = $response;
            }

            $seasonData = $data['data'];
            $episodes = $seasonData['episodes'] ?? [];
            unset($seasonData['episodes']);

            $tvSeason->update([
                'data' => $seasonData,
                'etag' => $data['etag'],
            ]);

            if (! empty($episodes)) {
                $episodesData = collect($episodes)->map(fn ($episode) => [
                    'id' => $episode['id'],
                    'show_id' => $tvSeason->show_id,
                    'season_id' => $tvSeason->id,
                    'data' => json_encode($episode),
                    'created_at' => now(),
                    'updated_at' => now(),
                ])->all();

                TvEpisode::upsert(
                    $episodesData,
                    ['id'],
                    ['data', 'updated_at']
                );
            }

            return $tvSeason->refresh();
        } catch (\Exception $e) {
            logger()->error('Error updating TV season: '.$e->getMessage());
            throw $e;
        }
    }
}
