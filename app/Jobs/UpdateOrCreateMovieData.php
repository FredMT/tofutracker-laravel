<?php

namespace App\Jobs;

use App\Models\Movie;
use App\Models\Tmdb\Genre;
use App\Models\Tmdb\TmdbKeyword;
use App\Models\TmdbProvider;
use App\Services\TmdbService;
use App\Models\Tmdb\TmdbVideo;
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
                        'popularity' => $movieData['popularity'] ?? null,
                        'vote_average' => $movieData['vote_average'] ?? null,
                        'vote_count' => $movieData['vote_count'] ?? null,
                    ]
                );

                $this->processWatchProviders($movie);
                $this->processGenres($movie);
                $this->processKeywords($movie);
                $this->processVideos($movie);

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

    /**
     * Process keywords for the movie and store them in the database
     */
    private function processKeywords(Movie $movie): void
    {
        // Keywords in movies are under 'keywords.keywords'
        $keywords = $movie->data['keywords']['keywords'] ?? [];
        
        if (empty($keywords)) {
            return;
        }

        // Remove existing keyword associations to prevent duplicates
        $movie->keywordRelations()->delete();
        
        foreach ($keywords as $keywordData) {
            if (!isset($keywordData['id']) || !isset($keywordData['name'])) {
                continue;
            }
            
            // Ensure the keyword exists in our database
            $keyword = TmdbKeyword::updateOrCreate(
                ['id' => $keywordData['id']],
                ['name' => $keywordData['name']]
            );
            
            // Attach keyword to the movie
            $movie->attachKeyword($keyword);
        }
    }

    /**
     * Process videos for the movie and store them in the database
     */
    private function processVideos(Movie $movie): void
    {
        // Videos in movies are under 'videos.results'
        $videos = $movie->data['videos']['results'] ?? [];
        
        if (empty($videos)) {
            return;
        }

        // Remove existing video associations to prevent duplicates
        $movie->videoRelations()->delete();
        
        foreach ($videos as $videoData) {
            if (!isset($videoData['id'])) {
                continue;
            }
            
            // Ensure the video exists in our database
            $video = TmdbVideo::updateOrCreate(
                ['id' => $videoData['id']],
                [
                    'key' => $videoData['key'] ?? null,
                    'name' => $videoData['name'] ?? null,
                    'site' => $videoData['site'] ?? null,
                    'size' => $videoData['size'] ?? null,
                    'type' => $videoData['type'] ?? null,
                    'official' => $videoData['official'] ?? false,
                    'iso_639_1' => $videoData['iso_639_1'] ?? null,
                    'iso_3166_1' => $videoData['iso_3166_1'] ?? null,
                    'published_at' => isset($videoData['published_at']) ? \Carbon\Carbon::parse($videoData['published_at']) : null,
                ]
            );
            
            // Attach video to the movie
            $movie->attachVideo($video);
        }
    }
}
