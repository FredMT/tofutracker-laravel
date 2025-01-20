<?php

namespace App\Jobs;

use App\Models\TvSeason;
use App\Services\TmdbService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;

class ProcessTvSeasons implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Create a new job instance.
     */
    public function __construct(
        private readonly int $showId,
        private readonly int $seasonNumber
    ) {}

    /**
     * Execute the job.
     */
    public function handle(TmdbService $tmdbService): void
    {
        try {
            $response = $tmdbService->getSeason($this->showId, $this->seasonNumber);
            $seasonData = $response['data'];

            // Check if season exists and compare etags
            $existingSeason = TvSeason::where('id', $seasonData['id'])->first();

            if ($existingSeason) {
                // Only update if etag is different
                if ($existingSeason->etag !== ($response['etag'] ?? null)) {
                    $existingSeason->update([
                        'data' => collect($seasonData)->except('episodes')->all(),
                        'etag' => $response['etag'],
                    ]);

                    // Prepare episode data for batch insert
                    $rows = array_map(function ($episodeData) use ($existingSeason) {
                        return [
                            'id' => $episodeData['id'],
                            'show_id' => $this->showId,
                            'season_id' => $existingSeason->id,
                            'data' => json_encode($episodeData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                        ];
                    }, $seasonData['episodes'] ?? []);

                    // Direct DB insert
                    if (! empty($rows)) {
                        DB::table('tv_episodes')->insert($rows);
                    }
                }

                logger()->info("Etag is the same, skipping update for TV show {$this->showId} and season {$seasonData['season_number']}");
            } else {
                // Create new season
                $season = TvSeason::create([
                    'id' => $seasonData['id'],
                    'show_id' => $this->showId,
                    'season_number' => $this->seasonNumber,
                    'data' => collect($seasonData)->except('episodes')->all(),
                    'etag' => $response['etag'],
                ]);

                // Prepare episode data for batch insert
                $rows = array_map(function ($episodeData) use ($season) {
                    return [
                        'id' => $episodeData['id'],
                        'show_id' => $this->showId,
                        'season_id' => $season->id,
                        'data' => json_encode($episodeData, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE),
                    ];
                }, $seasonData['episodes'] ?? []);

                // Direct DB insert
                if (! empty($rows)) {
                    DB::table('tv_episodes')->insert($rows);
                }
            }
        } catch (\Exception $e) {
            logger()->error('Error processing TV season: '.$e->getMessage(), [
                'show_id' => $this->showId,
                'season_number' => $this->seasonNumber,
            ]);

            throw $e;
        }
    }
}
