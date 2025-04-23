<?php

namespace App\Console\Commands;

use App\Jobs\RunTmdbMovieUpdater;
use Illuminate\Console\Command;

class UpdateTmdbMovies extends Command
{
    protected $signature = 'tmdb:update-movies';
    protected $description = 'Dispatch the TMDB Movie Updater job';

    public function handle(): void
    {
        RunTmdbMovieUpdater::dispatch();
        $this->info('TMDB Movie Updater job dispatched successfully.');
    }
} 