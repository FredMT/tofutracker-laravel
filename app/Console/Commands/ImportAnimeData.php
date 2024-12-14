<?php

namespace App\Console\Commands;

use App\Jobs\ImportAnimeDataJob;
use Illuminate\Console\Command;

class ImportAnimeData extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'anime:import-anime-data';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import anime data from JSON file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        ImportAnimeDataJob::dispatch();
        $this->info('Anime data import job dispatched');
    }
}
