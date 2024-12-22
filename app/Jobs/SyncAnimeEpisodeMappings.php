<?php

namespace App\Jobs;

use App\Exceptions\Tvdb\TvdbSyncException;
use App\Models\AnimeEpisodeMapping;
use App\Models\TvdbAnimeSeason;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SyncAnimeEpisodeMappings implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private readonly int $anidbId,
        private readonly int $tvdbId,
        private readonly array $mappingData
    ) {}

    /**
     * Execute the job.
     */
    public function handle(): void
    {

        $season = TvdbAnimeSeason::where('id', $this->tvdbId)
            ->where('status_keep_updated', true)
            ->first();
        if (!$season) {
            logger()->info(`Skipping episode mapping sync - status_keep_updated of {$this->tvdbId} is false or season not found`);
            $this->fail(new TvdbSyncException('Season not found', 0, null));
        }

        logger()->info(`Starting sync of anime episode mappings for {$this->anidbId} and {$this->tvdbId}`);

        $records = $this->prepareRecords();


        if (empty($records)) {
            $this->fail();
        }

        // Perform upsert with a single query
        AnimeEpisodeMapping::upsert(
            $records,
            ['anidb_id', 'tvdb_series_id', 'anidb_episode_number', 'is_special'],
            ['tvdb_episode_id', 'tvdb_season_number', 'tvdb_episode_number', 'updated_at']
        );
    }

    /**
     * Prepare records for batch upsert
     */
    private function prepareRecords(): array
    {
        $records = [];
        $now = now();
        // Process main episodes
        foreach ($this->mappingData['mainEpisodes'] as $anidbEpisodeNumber => $episode) {
            if ($episode['season'] === 0 && $episode['episode'] === 0) {
                continue;
            }
            $records[] = [
                'anidb_id' => $this->anidbId,
                'tvdb_series_id' => $this->tvdbId,
                'tvdb_episode_id' => $episode['tvdb_id'] ?? null,
                'anidb_episode_number' => $anidbEpisodeNumber,
                'is_special' => false,
                'tvdb_season_number' => $episode['season'],
                'tvdb_episode_number' => $episode['episode'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        // Process special episodes
        foreach ($this->mappingData['specialEpisodes'] as $anidbEpisodeNumber => $episode) {
            if ($episode['season'] === 0 && $episode['episode'] === 0) {
                continue;
            }
            $records[] = [
                'anidb_id' => $this->anidbId,
                'tvdb_series_id' => $this->tvdbId,
                'tvdb_episode_id' => $episode['tvdb_id'] ?? null,
                'anidb_episode_number' => $anidbEpisodeNumber,
                'is_special' => true,
                'tvdb_season_number' => $episode['season'],
                'tvdb_episode_number' => $episode['episode'],
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }
        return $records;
    }
}
