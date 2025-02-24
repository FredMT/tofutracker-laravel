<?php

namespace App\Jobs;

use App\Models\Tvdb\TvdbAnimeEpisode;
use App\Models\Tvdb\TvdbAnimeSeason;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection;

class CreateTvdbAnimeSeasonJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public int $maxExceptions = 3;

    public int $timeout = 300;

    private array $seasonData;

    private Collection $episodes;

    public function __construct(object $TVDBSeasonAndEpisodeData)
    {
        $this->seasonData = $this->extractSeasonData($TVDBSeasonAndEpisodeData);
        $this->episodes = collect($TVDBSeasonAndEpisodeData->data->episodes)->map(fn ($episode) => $this->extractEpisodeData($episode));
    }

    public function handle(): void
    {
        try {

            $season = $this->createSeason();
            $this->insertEpisodes($season->id);
        } catch (\Throwable $exception) {
            $this->failed($exception);
        }
    }

    private function extractSeasonData(object $data): array
    {
        return [
            'id' => $data->data->id,
            'slug' => $data->data->slug,
            'status_name' => $data->data->status->name,
            'status_record_type' => $data->data->status->recordType,
            'status_keep_updated' => $data->data->status->keepUpdated,
            'last_updated' => $data->data->lastUpdated,
            'average_runtime' => $data->data->averageRuntime,
        ];
    }

    private function extractEpisodeData(object $episode): array
    {
        return [
            'id' => $episode->id,
            'is_movie' => $episode->isMovie,
            'name' => $episode->name,
            'aired' => $episode->aired,
            'runtime' => $episode->runtime,
            'overview' => $episode->overview,
            'image' => $episode->image,
            'number' => $episode->number,
            'absolute_number' => $episode->absoluteNumber,
            'season_number' => $episode->seasonNumber,
            'last_updated' => $episode->lastUpdated,
            'finale_type' => $episode->finaleType,
            'year' => $episode->year ?? null,
        ];
    }

    private function createSeason(): TvdbAnimeSeason
    {
        return TvdbAnimeSeason::create(array_merge($this->seasonData, ['last_fetched_at' => now()]));
    }

    private function insertEpisodes(int $seasonId): void
    {
        $this->episodes->chunk(100)->each(function ($chunk, $index) use ($seasonId) {
            try {

                $episodesData = $chunk->map(fn ($episode) => array_merge($episode, ['series_id' => $seasonId]))->toArray();
                TvdbAnimeEpisode::insert($episodesData);
            } catch (\Exception $e) {
                logger()->error('Error inserting episodes', [
                    'season_id' => $seasonId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                throw $e;
            }
        });
    }

    public function failed(\Throwable $exception): void
    {
        logger()->error('Failed to create TVDB anime season', [
            'slug' => $this->seasonData['slug'] ?? 'Unknown',
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString(),
        ]);
    }
}
