<?php

namespace App\Console\Commands;

use App\Jobs\FetchAiringTvShowsJob;
use App\Jobs\FetchTraktEpisodesJob;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Log;

class FetchAiringTvShowsCommand extends Command
{
    protected $signature = 'tmdb:fetch-airing-shows';

    protected $description = 'Dispatch jobs to fetch TV shows airing in the next 30 days from TMDB API and episodes from Trakt API';

    public function handle()
    {
        $this->info('Dispatching jobs to fetch TMDB airing TV shows and Trakt episodes...');

        try {
            Bus::chain([
                new FetchAiringTvShowsJob(),
                new FetchTraktEpisodesJob()
            ])->dispatch();

            $this->info('Jobs dispatched successfully.');
            Log::info('TMDB airing TV shows and Trakt episodes fetch jobs dispatched successfully.');
        } catch (\Exception $e) {
            $this->error('Failed to dispatch jobs: ' . $e->getMessage());
            Log::error('Failed to dispatch TMDB airing TV shows and Trakt episodes fetch jobs', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
        }
    }
}
