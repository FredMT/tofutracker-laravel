<?php

namespace App\Console\Commands;

use App\Jobs\UpdateOrCreateMovieData;
use App\Models\Movie;
use Illuminate\Console\Command;

class UpdateMoviesCommand extends Command
{
    protected $signature = 'movies:update {id? : The ID of the movie to update}';

    protected $description = 'Force update movie data and process watch providers';

    public function handle()
    {
        $movieId = $this->argument('id');

        if (! $movieId) {
            $this->error('Please provide a movie ID');

            return 1;
        }

        $this->updateSingleMovie($movieId);

        return 0;
    }

    private function updateSingleMovie(string $movieId): void
    {
        $this->info("Updating movie {$movieId}...");

        $movie = Movie::find($movieId);
        if (! $movie) {
            $this->warn("Movie with ID {$movieId} not found. Will attempt to fetch it.");
        }

        UpdateOrCreateMovieData::dispatch($movieId, false);

        $this->info("Update job dispatched for movie {$movieId}");
    }
}
