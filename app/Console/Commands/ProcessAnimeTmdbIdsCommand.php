<?php

namespace App\Console\Commands;

use App\Jobs\ProcessAnimeTmdbId;
use App\Models\Anime\AnimeMap;
use Illuminate\Console\Command;

class ProcessAnimeTmdbIdsCommand extends Command
{
    protected $signature = 'anime:process-tmdb-ids {--chunk=100}';

    protected $description = 'Process all AnimeMap entries to find their most common TMDB IDs';

    public function handle(): void
    {
        $this->info('Starting to process anime TMDB IDs...');

        $totalMaps = AnimeMap::count();
        $this->info("Found {$totalMaps} anime maps to process");

        AnimeMap::select('id')
            ->chunkById($this->option('chunk'), function ($maps) {
                foreach ($maps as $map) {
                    ProcessAnimeTmdbId::dispatch($map->id);
                    $this->line("Queued map ID: {$map->id}");
                }
            });

        $this->info('All anime maps have been queued for processing');
    }
}
