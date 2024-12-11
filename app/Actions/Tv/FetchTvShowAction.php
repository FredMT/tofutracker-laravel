<?php

namespace App\Actions\Tv;

use App\Jobs\ProcessTvSeasons;
use App\Jobs\UpdateTvData;
use App\Models\TvShow;
use App\Services\TmdbService;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class FetchTvShowAction
{
    public function __construct(
        private TmdbService $tmdbService,
    ) {}

    public function execute(string $id): array
    {
        return Cache::remember("tv.{$id}", now()->addMinutes(15), function () use ($id) {
            $tvShow = $this->getOrCreateTvShow($id);
            $this->checkForUpdates($tvShow);
            return $tvShow->filteredData;
        });
    }


    private function getOrCreateTvShow(string $id): TvShow
    {
        $tvShow = TvShow::find($id);
        if ($tvShow) {
            return $tvShow;
        }

        Log::info("Fetching new TV show: {$id}");
        $response = $this->fetchTvShowFromApi($id);

        $tvShow = TvShow::create([
            'id' => $id,
            'data' => $response['data'],
            'etag' => $response['etag'] ?? null
        ]);

        // Dispatch jobs for each season
        foreach ($response['data']['seasons'] ?? [] as $season) {
            ProcessTvSeasons::dispatch(
                (int) $tvShow->id,
                (int) $season['season_number']
            );
        }

        return $tvShow;
    }

    private function checkForUpdates(TvShow $tvShow): void
    {
        if ($tvShow->updated_at->lt(now()->subMinutes(15))) {
            try {
                $response = $this->fetchTvShowFromApi($tvShow->id);

                if (!$tvShow->etag || $tvShow->etag !== ($response['etag'] ?? null)) {
                    UpdateTvData::dispatch($tvShow->id, $response['data'], $response['etag'] ?? null);
                }

                foreach ($response['data']['seasons'] ?? [] as $season) {
                    ProcessTvSeasons::dispatch(
                        (int) $tvShow->id,
                        (int) $season['season_number']
                    );
                }
            } catch (\Exception $e) {
                Log::error("Failed to check for TV show updates: {$tvShow->id}", [
                    'error' => $e->getMessage()
                ]);
                // Continue with existing data
            }
        }
    }

    private function fetchTvShowFromApi(string $id): array
    {
        try {
            $response = $this->tmdbService->getTv($id);

            if (isset($response['data']['success']) && $response['data']['success'] === false) {
                Log::error("TMDB API error for TV show: {$id}", [
                    'message' => $response['data']['status_message'] ?? 'Unknown error'
                ]);
                abort(404, $response['data']['status_message'] ?? 'TV show not found');
            }

            return $response;
        } catch (\Exception $e) {
            Log::error("Failed to fetch TV show from TMDB: {$id}", [
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }
}
