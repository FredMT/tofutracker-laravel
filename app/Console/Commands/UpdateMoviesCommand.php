<?php

namespace App\Console\Commands;

use App\Jobs\UpdateOrCreateMovieData;
use App\Models\Movie;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateMoviesCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'movies:update {id? : The ID of the movie to update} {--all : Update all movies}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Force update movie data and process watch providers';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $movieId = $this->argument('id');
        $updateAll = $this->option('all');

        if (!$movieId && !$updateAll) {
            $this->error('Please provide a movie ID or use the --all option');
            return 1;
        }

        if ($movieId) {
            $this->updateSingleMovie($movieId);
        } else {
            $this->updateAllMovies();
        }

        return 0;
    }

    /**
     * Update a single movie by ID
     */
    private function updateSingleMovie(string $movieId): void
    {
        $this->info("Updating movie {$movieId}...");
        
        $movie = Movie::find($movieId);
        if (!$movie) {
            $this->warn("Movie with ID {$movieId} not found. Will attempt to fetch it.");
        }
        
        // Force update by setting checkETag to false
        UpdateOrCreateMovieData::dispatch($movieId, false);
        
        $this->info("Update job dispatched for movie {$movieId}");
    }

    /**
     * Update all movies in the database
     */
    private function updateAllMovies(): void
    {
        $totalMovies = Movie::count();
        $this->info("Updating providers for {$totalMovies} movies...");
        
        $progressBar = $this->output->createProgressBar($totalMovies);
        $progressBar->start();
        
        Movie::select('id')->chunkById(100, function($movies) use ($progressBar) {
            foreach ($movies as $movie) {
                // Force update by setting checkETag to false
                UpdateOrCreateMovieData::dispatch($movie->id, false);
                $progressBar->advance();
            }
        });
        
        $progressBar->finish();
        $this->newLine();
        $this->info('All movie provider update jobs have been dispatched');
    }
}
