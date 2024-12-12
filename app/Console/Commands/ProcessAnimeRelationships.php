<?php

namespace App\Console\Commands;

use App\Models\AnidbAnime;
use App\Jobs\ProcessAnimeRelationship;
use Illuminate\Console\Command;

class ProcessAnimeRelationships extends Command
{
    protected $signature = 'anime:process-relationships {--chunk=100}';
    protected $description = 'Process relationships for all anime in the database';

    public function handle(): void
    {
        $this->info('Starting to process anime relationships...');

        $totalAnime = AnidbAnime::count();
        $this->info("Found {$totalAnime} anime to process");

        // Process in chunks to avoid memory issues
        AnidbAnime::select('id')
            ->chunkById($this->option('chunk'), function ($animes) {
                foreach ($animes as $anime) {
                    ProcessAnimeRelationship::dispatch($anime->id);
                    $this->line("Queued anime ID: {$anime->id}");
                }
            });

        $this->info('All anime have been queued for processing');
    }
}
