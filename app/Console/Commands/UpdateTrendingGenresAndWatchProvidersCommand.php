<?php

namespace App\Console\Commands;

use App\Jobs\UpdateTrendingGenresAndWatchProvidersJob;
use Illuminate\Console\Command;

class UpdateTrendingGenresAndWatchProvidersCommand extends Command
{
    protected $signature = 'trending:update';

    protected $description = 'Update trending genres and watch providers data';

    public function handle(): void
    {
        $this->info('Dispatching trending update job...');
        UpdateTrendingGenresAndWatchProvidersJob::dispatch();
        $this->info('Job has been dispatched successfully.');
    }
}
