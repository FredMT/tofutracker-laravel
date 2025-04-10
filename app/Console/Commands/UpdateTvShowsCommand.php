<?php

namespace App\Console\Commands;

use App\Actions\Tv\TvShowActions;
use App\Models\TvShow;
use Illuminate\Console\Command;

class UpdateTvShowsCommand extends Command
{
    protected $signature = 'tvshows:update {id?} {--all}';
    protected $description = 'Force update TV show data and process watch providers';

    public function handle(TvShowActions $tvShowActions)
    {
        $tvShowId = $this->argument('id');
        $updateAll = $this->option('all');

        if (!$tvShowId && !$updateAll) {
            $this->error('Please provide a TV show ID or use the --all option');
            return 1;
        }

        if ($tvShowId) {
            $this->updateSingleTvShow($tvShowId, $tvShowActions);
        } else {
            $this->updateAllTvShows($tvShowActions);
        }

        return 0;
    }

    private function updateSingleTvShow(string $tvShowId, TvShowActions $tvShowActions): void
    {
        $this->info("Updating TV show {$tvShowId}...");
        
        $tvShow = TvShow::find($tvShowId);
        if (!$tvShow) {
            $this->warn("TV show with ID {$tvShowId} not found. Will attempt to fetch it.");
            
            try {
                $tvShow = $tvShowActions->getShowAndQueueUpdateIfNeeded($tvShowId);
                $this->info("TV show {$tvShowId} created.");
            } catch (\Exception $e) {
                $this->error("Failed to fetch TV show {$tvShowId}: {$e->getMessage()}");
                return;
            }
        }
        
        $tvShowActions->updateTvShow($tvShow, null, false);
        
        $this->info("TV show {$tvShowId} has been updated with providers");
    }

    private function updateAllTvShows(TvShowActions $tvShowActions): void
    {
        $totalTvShows = TvShow::count();
        $this->info("Updating providers for {$totalTvShows} TV shows...");
        
        $progressBar = $this->output->createProgressBar($totalTvShows);
        $progressBar->start();
        
        TvShow::select('id')->chunkById(100, function($tvShows) use ($progressBar, $tvShowActions) {
            foreach ($tvShows as $tvShow) {
                try {
                    $tvShowActions->updateTvShow($tvShow, null, false);
                } catch (\Exception $e) {
                    $this->error("Failed to update TV show {$tvShow->id}: {$e->getMessage()}");
                }
                $progressBar->advance();
            }
        });
        
        $progressBar->finish();
        $this->newLine();
        $this->info('All TV show providers have been updated');
    }
}
