<?php

namespace App\Console\Commands;

use App\Models\Movie;
use App\Models\Tmdb\Genre;
use App\Models\Tmdb\TmdbContentGenre;
use App\Models\TvShow;
use Illuminate\Console\Command;

class SyncTmdbGenres extends Command
{
    protected $signature = 'app:sync-tmdb-genres';

    protected $description = 'Synchronize genres from existing Movie and TvShow data to the genres table';

    public function handle()
    {
        $this->info('Starting genre synchronization...');

        $this->info('Processing movies...');
        $movieCount = 0;
        $this->syncMovieGenres($movieCount);
        $this->info("Processed $movieCount movies.");

        $this->info('Processing TV shows...');
        $tvShowCount = 0;
        $this->syncTvShowGenres($tvShowCount);
        $this->info("Processed $tvShowCount TV shows.");

        $this->info('Genre synchronization completed successfully!');
    }

    private function syncMovieGenres(int &$count): void
    {
        Movie::take(1000)->chunk(100, function ($movies) use (&$count) {
            foreach ($movies as $movie) {
                $genres = $movie->genres;

                if (!empty($genres)) {
                    foreach ($genres as $genreData) {
                        $genre = Genre::firstOrCreate(
                            ['id' => $genreData['id']],
                            ['name' => $genreData['name']]
                        );

                        TmdbContentGenre::firstOrCreate([
                            'genre_id' => $genre->id,
                            'content_type' => Movie::class,
                            'content_id' => $movie->id,
                        ]);
                    }
                }

                $count++;
            }
        });
    }

    private function syncTvShowGenres(int &$count): void
    {
        TvShow::take(1000)->chunk(100, function ($tvShows) use (&$count) {
            foreach ($tvShows as $tvShow) {
                $genres = $tvShow->genres;

                if (!empty($genres)) {
                    foreach ($genres as $genreData) {
                        $genre = Genre::firstOrCreate(
                            ['id' => $genreData['id']],
                            ['name' => $genreData['name']]
                        );

                        TmdbContentGenre::firstOrCreate([
                            'genre_id' => $genre->id,
                            'content_type' => TvShow::class,
                            'content_id' => $tvShow->id,
                        ]);
                    }
                }

                $count++;
            }
        });
    }
}
