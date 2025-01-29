<?php

namespace App\Jobs;

use App\Models\Movie;
use App\Services\TmdbService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;

class UpdateOrCreateMovieData implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        public string $movieId,
        public bool $checkETag = true
    ) {}

    public function handle(): void
    {
        try {
            $response = app(TmdbService::class)->getMovie($this->movieId);

            if (isset($response['data']['success']) && $response['data']['success'] === false) {
                logger()->error("Failed to update movie {$this->movieId}: {$response['data']['status_message']}");
                return;
            }

            $movieData = $response['data'];
            $etag = $response['etag'];

            $movie = Movie::find($this->movieId);

            if (!$this->checkETag || !$movie || $movie->etag !== $etag) {
                Movie::updateOrCreate(
                    ['id' => $this->movieId],
                    [
                        'data' => $movieData,
                        'etag' => $etag,
                    ]
                );

                $filteredData = $movie?->filteredData;
                if ($filteredData) {
                    Cache::put("movie.{$this->movieId}", $filteredData, now()->addHours(6));
                }
            }
        } catch (\Exception $e) {
            logger()->error("Error updating movie {$this->movieId}: " . $e->getMessage());
            throw $e;
        }
    }
}
