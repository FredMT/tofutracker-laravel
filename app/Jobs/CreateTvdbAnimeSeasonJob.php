<?php

namespace App\Jobs;

use App\Models\TvdbAnimeSeason;
use App\Models\TvdbAnimeEpisode;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CreateTvdbAnimeSeasonJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;
    public $maxExceptions = 3;
    public $timeout = 300;
    protected const BATCH_SIZE = 100;

    protected $seasonData;
    protected $episodes;

    public function __construct($completeData)
    {
        $this->seasonData = [
            'id' => $completeData->data->id,
            'slug' => $completeData->data->slug,
            'status' => [
                'name' => $completeData->data->status->name,
                'recordType' => $completeData->data->status->recordType,
                'keepUpdated' => $completeData->data->status->keepUpdated,
            ],
            'lastUpdated' => $completeData->data->lastUpdated,
            'averageRuntime' => $completeData->data->averageRuntime,
        ];

        $this->episodes = collect($completeData->data->episodes)->map(function ($episode) {
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
        })->all();
    }

    public function handle()
    {
        Log::info('Starting creation of new TVDB anime season', [
            'slug' => $this->seasonData['slug'],
            'episode_count' => count($this->episodes)
        ]);

        $season = TvdbAnimeSeason::create([
            'id' => $this->seasonData['id'],
            'slug' => $this->seasonData['slug'],
            'status_name' => $this->seasonData['status']['name'],
            'status_record_type' => $this->seasonData['status']['recordType'],
            'status_keep_updated' => $this->seasonData['status']['keepUpdated'],
            'last_updated' => $this->seasonData['lastUpdated'],
            'average_runtime' => $this->seasonData['averageRuntime'],
            'last_fetched_at' => now(),
        ]);

        foreach (array_chunk($this->episodes, self::BATCH_SIZE) as $index => $chunk) {
            try {
                Log::info('Processing episode chunk', [
                    'season_id' => $season->id,
                    'chunk_number' => $index + 1,
                    'chunk_size' => count($chunk)
                ]);

                $episodesData = array_map(function ($episode) use ($season) {
                    return array_merge($episode, ['series_id' => $season->id]);
                }, $chunk);

                TvdbAnimeEpisode::insert($episodesData);
            } catch (\Exception $e) {
                Log::error('Error processing episode chunk', [
                    'season_id' => $season->id,
                    'chunk_number' => $index + 1,
                    'error' => $e->getMessage()
                ]);
                throw $e;
            }
        }

        Log::info('Completed creation of TVDB anime season and episodes', [
            'season_id' => $season->id,
            'total_episodes' => count($this->episodes)
        ]);
    }

    public function failed(\Throwable $exception)
    {
        Log::error('Failed to create TVDB anime season', [
            'slug' => $this->seasonData['slug'],
            'error' => $exception->getMessage(),
            'trace' => $exception->getTraceAsString()
        ]);
    }
}
