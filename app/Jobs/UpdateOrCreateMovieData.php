<?php

namespace App\Jobs;

use App\Models\Movie;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use App\Services\TmdbService;

class UpdateOrCreateMovieData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $movieId,
    ) {}

    public function handle(): void
    {
        try {
            $response = app(TmdbService::class)->getMovie($this->movieId);

            if (isset($response['data']['success']) && $response['data']['success'] === false) {
                Log::error("Failed to update movie {$this->movieId}: {$response['data']['status_message']}");
                return;
            }

            $movieData = $response['data'];
            $etag = $response['etag'];

            // Get existing movie
            $movie = Movie::find($this->movieId);

            // Only update if etag is different or doesn't exist
            if (!$movie || $movie->etag !== $etag) {
                if (!$movie) {
                    Log::info("Creating movie {$this->movieId}");
                }

                if ($movie->etag !== $etag) {
                    Log::info("Updating movie {$this->movieId}");
                }

                Movie::updateOrCreate(
                    ['id' => $this->movieId],
                    [
                        'data' => $movieData,
                        'etag' => $etag
                    ]
                );

                $filteredData = $movie->filterMovieData();
                Cache::put("movie.{$this->movieId}", $filteredData, now()->addHours(6));
                Log::info("Updated movie {$this->movieId} in database and cache");
            }
            Log::info("Movie {$this->movieId} does not need to be created or updated");
        } catch (\Exception $e) {
            Log::error("Error updating movie {$this->movieId}: " . $e->getMessage());
            throw $e;
        }
    }
}
