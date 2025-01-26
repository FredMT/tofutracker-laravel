<?php

namespace App\Jobs;

use App\Models\Tvdb\TvdbAnimeEpisode;
use App\Models\Tvdb\TvdbAnimeSeason;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateTvdbAnimeEpisodesJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $season;

    protected $episodes;

    protected const BATCH_SIZE = 100;

    public function __construct(TvdbAnimeSeason $season, $episodes)
    {
        $this->season = $season;
        $this->episodes = $episodes;
    }

    public function handle()
    {
        // Get existing episode IDs for this season
        $existingEpisodeIds = TvdbAnimeEpisode::where('series_id', $this->season->id)
            ->pluck('id')
            ->flip();

        $toUpdate = [];
        $toInsert = [];

        // Prepare episodes for update or insert
        foreach ($this->episodes as $episode) {
            if ($existingEpisodeIds->has($episode->id)) {
                $toUpdate[] = $episode;
            } else {
                $toInsert[] = [
                    'id' => $episode->id,
                    'series_id' => $this->season->id,
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
                    'year' => $episode->year,
                ];
            }
        }

        // Insert new episodes in batches
        collect($toInsert)->chunk(self::BATCH_SIZE)->each(function ($batch) {
            TvdbAnimeEpisode::insert($batch->toArray());
        });

        // Update existing episodes
        foreach ($toUpdate as $episode) {
            TvdbAnimeEpisode::where('id', $episode->id)
                ->where('last_updated', '<', $episode->lastUpdated)
                ->update([
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
                    'year' => $episode->year,
                ]);
        }
    }
}
