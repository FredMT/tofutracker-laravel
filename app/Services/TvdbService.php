<?php

namespace App\Services;

use App\Exceptions\Tvdb\TvdbSyncException;
use App\Jobs\CreateTvdbAnimeSeasonJob;
use App\Jobs\UpdateTvdbAnimeSeasonJob;
use App\Models\Tvdb\TvdbAnimeSeason;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

class TvdbService
{
    private PendingRequest $client;

    private string $baseUrl = 'https://api4.thetvdb.com/v4';

    public function __construct()
    {
        $this->client = Http::withHeaders([
            'Authorization' => 'Bearer '.config('services.tvdb.token'),
            'Accept' => 'application/json',
        ])->baseUrl($this->baseUrl);
    }

    public function getEpisodes(int $seriesId)
    {
        return Cache::remember("tvdb.episodes.{$seriesId}", now()->addMinutes(30), function () use ($seriesId) {
            $allEpisodes = [];
            $nextUrl = "/series/{$seriesId}/episodes/default/eng";

            while ($nextUrl) {
                $response = $this->client->get($nextUrl);
                $data = json_decode($response->body());

                $allEpisodes = array_merge($allEpisodes, $data->data->episodes);

                $nextUrl = $data->links->next;
            }

            return $allEpisodes;
        });
    }

    public function getEpisodesWithAllData(int $seriesId)
    {
        return Cache::remember("tvdb.series.{$seriesId}", now()->addMinutes(30), function () use ($seriesId) {
            $completeData = null;
            $allEpisodes = [];
            $nextUrl = "/series/{$seriesId}/episodes/default/eng";

            while ($nextUrl) {
                $response = $this->client->get($nextUrl);
                $data = json_decode($response->body());

                // Store the complete data structure on first iteration
                if (! $completeData) {
                    $completeData = $data;
                }

                // Merge episodes from each page
                $allEpisodes = array_merge($allEpisodes, $data->data->episodes);

                $nextUrl = $data->links->next;
            }

            // Update the episodes array in the complete data structure
            $completeData->data->episodes = $allEpisodes;

            return $completeData;
        });
    }

    public function syncTvdbAnimeData(int $seriesId)
    {
        logger()->info('Starting sync of TVDB anime data', ['series_id' => $seriesId]);

        $completeData = $this->getEpisodesWithAllData($seriesId);
        $season = TvdbAnimeSeason::where('slug', $completeData->data->slug)->first();

        if (! $season) {
            logger()->info('No existing season found, dispatching creation job', [
                'series_id' => $seriesId,
                'slug' => $completeData->data->slug,
            ]);

            return CreateTvdbAnimeSeasonJob::dispatch($completeData);
        }

        $shouldUpdate = $season->status_keep_updated ||
            ($season->last_fetched_at && now()->diffInMonths($season->last_fetched_at) >= 1);

        if (! $shouldUpdate) {
            $logMessage = $season->last_fetched_at
                ? 'Skipping update - monthly check not due yet'
                : 'Skipping update - status_keep_updated is false and no previous fetch';

            logger()->info($logMessage, [
                'series_id' => $seriesId,
                'season_id' => $season->id,
                'months_until_next_check' => $season->last_fetched_at ? 1 - now()->diffInMonths($season->last_fetched_at) : null,
            ]);
            throw new TvdbSyncException('Update not needed', 0, null);
        }

        // Compare lastUpdated timestamps
        $apiLastUpdated = $completeData->data->lastUpdated;
        if ($season->last_updated >= $apiLastUpdated) {
            logger()->info('Skipping update - no new updates from TVDB because api response lastUpdated is not newer than local lastUpdated', [
                'series_id' => $seriesId,
            ]);

            // Update last_fetched_at even though we're not updating content
            $season->update(['last_fetched_at' => now()]);
            throw new TvdbSyncException('No new updates available', 0, null);
        }

        logger()->info('Dispatching update job for existing season', [
            'series_id' => $seriesId,
        ]);

        UpdateTvdbAnimeSeasonJob::dispatch($season, $completeData);
    }
}
