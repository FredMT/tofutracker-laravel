<?php

namespace App\Console\Commands;

use App\Jobs\PopulateAnimeRelationshipTables;
use Illuminate\Console\Command;

class PopulateAnimeRelationshipTablesCommand extends Command
{
    protected $signature = 'anime:populate-relationships';

    protected $description = 'Populate the normalized relationship tables from existing anime maps';

    public function handle(): void
    {
        $this->info('Dispatching PopulateAnimeRelationshipTables job...');
        PopulateAnimeRelationshipTables::dispatch();
        $this->info('Job dispatched successfully!');
    }
}
