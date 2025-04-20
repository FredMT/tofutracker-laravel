<?php

namespace App\Console\Commands;

use App\Jobs\FetchAnimeGenresJob;
use Illuminate\Console\Command;

class FetchAnimeGenresCommand extends Command
{
    protected $signature = 'anime:fetch-genres';
    protected $description = 'Fetch anime genres data and store in cache';

    public function handle()
    {
        $this->info('Dispatching job to fetch anime genres...');
        FetchAnimeGenresJob::dispatch();
        $this->info('Job dispatched successfully');

        return Command::SUCCESS;
    }
} 