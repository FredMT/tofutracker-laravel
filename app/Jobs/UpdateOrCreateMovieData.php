<?php

namespace App\Jobs;

use App\Models\Movie;
use App\Models\Tmdb\Genre;
use App\Models\TmdbProvider;
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

            if (! $this->checkETag || ! $movie || $movie->etag !== $etag) {
                $movie = Movie::updateOrCreate(
                    ['id' => $this->movieId],
                    [
                        'data' => $movieData,
                        'etag' => $etag,
                    ]
                );

                $this->processWatchProviders($movie);
                $this->processGenres($movie);

                $filteredData = $movie->filteredData;
                if ($filteredData) {
                    Cache::put("movie.{$this->movieId}", $filteredData, now()->addHours(6));
                }
            }
        } catch (\Exception $e) {
            logger()->error("Error updating movie {$this->movieId}: ".$e->getMessage());
            throw $e;
        }
    }

    /**
     * Process watch providers for the movie and store them in the database
     */
    private function processWatchProviders(Movie $movie): void
    {
        $watchProviders = $movie->data['watch/providers']['results'] ?? [];
        
        if (empty($watchProviders)) {
            return;
        }

        // Loop through each country's providers
        foreach ($watchProviders as $countryCode => $countryData) {
            // Process each provider type (flatrate, buy, rent, ads, free)
            foreach (['flatrate', 'buy', 'rent', 'ads', 'free'] as $providerType) {
                if (!isset($countryData[$providerType])) {
                    continue;
                }

                // Process providers of this type
                foreach ($countryData[$providerType] as $providerData) {
                    $providerId = $providerData['provider_id'];
                    
                    // Ensure the provider exists in our database
                    $provider = TmdbProvider::updateOrCreate(
                        ['id' => $providerId],
                        [
                            'name' => $providerData['provider_name'],
                            'logo_path' => $providerData['logo_path']
                        ]
                    );
                    
                    // Attach provider to the movie
                    $movie->attachProvider($provider, $providerType, $countryCode);
                }
            }
        }
    }

    /**
     * Process genres for the movie and store them in the database
     */
    private function processGenres(Movie $movie): void
    {
        $genres = $movie->data['genres'] ?? [];
        
        if (empty($genres)) {
            return;
        }

        // Remove existing genre associations to prevent duplicates
        $movie->genreRelations()->delete();
        
        foreach ($genres as $genreData) {
            if (!isset($genreData['id']) || !isset($genreData['name'])) {
                continue;
            }
            
            // Ensure the genre exists in our database
            $genre = Genre::updateOrCreate(
                ['id' => $genreData['id']],
                ['name' => $genreData['name']]
            );
            
            // Attach genre to the movie
            $movie->attachGenre($genre);
        }
    }
}
