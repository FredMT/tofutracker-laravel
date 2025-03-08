<?php

namespace App\Actions\Tv;

use App\Jobs\UpdateTvSeason;
use App\Jobs\UpdateTvShow;
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
        return Cache::remember("tv.{$id}", now()->addMinutes(15), function () use ($id) {

            $tvShow = $this->getShowAndQueueUpdateIfNeeded($id);

            return $tvShow->filteredData;
        });
    }

    /**
     * Get show and queue update if needed
     */
    public function getShowAndQueueUpdateIfNeeded(string $tvId): TvShow
    {
        $tvShow = TvShow::find($tvId);

        $showData = $this->tmdbService->getTv($tvId);

        if (! $tvShow) {
            return $this->createTvShow($showData);
        }

        if ($tvShow->etag !== $showData['etag']) {
            UpdateTvShow::dispatch($tvShow, $showData)
                ->afterCommit();
        }

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

        // Check if season needs update
        $latestSeasonData = $this->tmdbService->getSeason($tvShow->id, $seasonNumber);
        if ($season->etag !== $latestSeasonData['etag']) {
            UpdateTvSeason::dispatch($season, $latestSeasonData)
                ->afterCommit();
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

    /**
     * Update TV show details
     */
    public function updateTvShow(TvShow $tvShow, ?array $data = null, bool $checkETag = true): TvShow
    {
        try {
            if (! $data) {
                $tmdbService = app(TmdbService::class);
                $response = $tmdbService->getTv($tvShow->id);

                if ($checkETag && $tvShow->etag === $response['etag']) {
                    return $tvShow;
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
            ]);

            // Update or create seasons
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

    /**
     * Update TV season details
     */
    public function updateTvSeason(TvSeason $tvSeason, ?array $data = null, bool $checkETag = true): TvSeason
    {
        try {
            if (! $data) {
                $tmdbService = app(TmdbService::class);
                $response = $tmdbService->getSeason($tvSeason->show_id, $tvSeason->season_number);

                if ($checkETag && $tvSeason->etag === $response['etag']) {
                    return $tvSeason;
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
