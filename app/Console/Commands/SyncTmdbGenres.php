<?php

namespace App\Console\Commands;

use App\Jobs\SyncGenresJob;
use App\Models\Movie;
use App\Models\Tmdb\Genre;
use App\Models\Tmdb\TmdbContentGenre;
use App\Models\TvShow;
use Illuminate\Console\Command;
use Illuminate\Support\Collection;

class SyncTmdbGenres extends Command
{
    protected $signature = 'app:sync-tmdb-genres
                            {type? : Type of content to sync (movies, tvshows, or all)}
                            {--count=1000 : Number of records to process or "all" for all records}';

    protected $description = 'Synchronize genres from existing Movie and TvShow data to the genres table';

    public function handle()
    {
        $this->info('Starting genre synchronization...');

        $type = $this->argument('type') ?: 'all';
        $count = $this->option('count');

        if ($count === 'all') {
            $count = null;
        } else {
            $count = (int) $count;
        }

        if ($type === 'all' || $type === 'movies') {
            $this->info('Queuing movie genre sync jobs...');
            $this->queueMovieGenreSync($count);
        }

        if ($type === 'all' || $type === 'tvshows') {
            $this->info('Queuing TV show genre sync jobs...');
            $this->queueTvShowGenreSync($count);
        }

        $this->info('Genre synchronization jobs have been queued successfully!');
    }

    private function queueMovieGenreSync(?int $limit): void
    {
        $query = Movie::query();

        if ($limit) {
            $query->take($limit);
        }

        $query->chunkById(100, function ($movies) {
            dispatch(new SyncGenresJob($movies, Movie::class))
                ->onQueue('syncgenres');
        });
    }

    private function queueTvShowGenreSync(?int $limit): void
    {
        $query = TvShow::query();

        if ($limit) {
            $query->take($limit);
        }

        $query->chunkById(100, function ($tvShows) {
            dispatch(new SyncGenresJob($tvShows, TvShow::class))
                ->onQueue('syncgenres');
        });
    }
}
