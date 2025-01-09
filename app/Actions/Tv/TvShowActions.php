<?php

namespace App\Actions\Tv;

use App\Jobs\UpdateTvSeason;
use App\Jobs\UpdateTvShow;
use App\Models\TvEpisode;
use App\Models\TvShow;
use App\Models\TvSeason;
use App\Services\TmdbService;
use Illuminate\Http\JsonResponse;
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

        if (!$tvShow) {
            return $this->createTvShow($showData);
        }



        // Use the already fetched show data to check etag
        if ($tvShow->etag !== $showData['etag']) {
            // Queue show update with already fetched data
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

        if (!$season) {
            return $this->createTvSeason($tvShow, (int) $seasonNumber);
        }

        // Check if season needs update
        $latestSeasonData = $this->tmdbService->getSeason($tvShow->id, $seasonNumber);
        if ($season->etag !== $latestSeasonData['etag']) {
            // Queue season update
            UpdateTvSeason::dispatch($season, $latestSeasonData)
                ->afterCommit();
        }

        return $season;
    }

    public function errorResponse(\Exception $e)
    {
        abort(500, "Failed to retrieve TV season");
    }


    /**
     * Create a new TV show
     *
     * @param array $data
     * @return TvShow
     */
    public function createTvShow(array $data): TvShow
    {
        $showData = $data['data'];
        $seasons = $showData['seasons'] ?? [];
        unset($showData['seasons']);

        $tvShow = TvShow::create([
            'id' => $data['data']['id'],
            'data' => $showData,
            'etag' => $data['etag']
        ]);

        // Create seasons for the show
        foreach ($seasons as $seasonData) {
            $this->createTvSeason($tvShow, $seasonData['season_number']);
        }

        return $tvShow;
    }

    /**
     * Create a new TV season
     *
     * @param TvShow $tvShow
     * @param array $data
     * @return TvSeason
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
            'etag' => $seasonData['etag']
        ]);

        if (!empty($episodes)) {
            TvEpisode::insert(
                collect($episodes)->map(fn($episode) => [
                    'id' => $episode['id'],
                    'show_id' => $tvShow->id,
                    'season_id' => $tvSeason->id,
                    'data' => json_encode($episode),
                    'created_at' => now(),
                    'updated_at' => now()
                ])->all()
            );
        }

        return $tvSeason;
    }


    /**
     * Update TV show details
     *
     * @param TvShow $tvShow
     * @param array|null $data
     * @return TvShow
     */
    public function updateTvShow(TvShow $tvShow, ?array $data = null): TvShow
    {
        try {
            // If data is not provided, check if update is needed
            if (!$data) {
                $tmdbService = app(TmdbService::class);
                $response = $tmdbService->getTv($tvShow->id);

                // Return early if no update needed
                if ($tvShow->etag === $response['etag']) {
                    return $tvShow;
                }

                $data = $response;
            }

            // Extract and remove seasons data to prevent duplication
            $showData = $data['data'];
            $seasons = $showData['seasons'] ?? [];
            unset($showData['seasons']);

            // Update the show
            $tvShow->update([
                'data' => $showData,
                'etag' => $data['etag']
            ]);

            // Update or create seasons
            foreach ($seasons as $seasonData) {
                $season = $tvShow->seasons()->firstWhere('season_number', $seasonData['season_number']);

                if ($season) {
                    $this->updateTvSeason($season);
                } else {
                    $this->createTvSeason($tvShow, $seasonData['season_number']);
                }
            }

            return $tvShow->refresh();
        } catch (\Exception $e) {
            logger()->error("Error updating TV show: " . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update TV season details
     *
     * @param TvSeason $tvSeason
     * @param array|null $data
     * @return TvSeason
     */
    public function updateTvSeason(TvSeason $tvSeason, ?array $data = null): TvSeason
    {
        try {
            // If data is not provided, check if update is needed
            if (!$data) {
                $tmdbService = app(TmdbService::class);
                $response = $tmdbService->getSeason($tvSeason->show_id, $tvSeason->season_number);

                // Return early if no update needed
                if ($tvSeason->etag === $response['etag']) {
                    return $tvSeason;
                }

                $data = $response;
            }



            // Extract and remove episodes data to prevent duplication
            $seasonData = $data['data'];
            $episodes = $seasonData['episodes'] ?? [];
            unset($seasonData['episodes']);

            // Update the season
            $tvSeason->update([
                'data' => $seasonData,
                'etag' => $data['etag']
            ]);

            // Update or create episodes
            if (!empty($episodes)) {
                // Prepare episodes data for bulk upsert
                $episodesData = collect($episodes)->map(fn($episode) => [
                    'id' => $episode['id'],
                    'show_id' => $tvSeason->show_id,
                    'season_id' => $tvSeason->id,
                    'data' => $episode,
                    'created_at' => now(),
                    'updated_at' => now()
                ])->all();

                // Bulk upsert episodes
                TvEpisode::upsert(
                    $episodesData,
                    ['id'], // Unique key
                    ['data', 'updated_at'] // Columns to update if record exists
                );
            }

            return $tvSeason->refresh();
        } catch (\Exception $e) {
            logger()->error("Error updating TV season: " . $e->getMessage());
            throw $e;
        }
    }
}
