<?php

namespace App\Console\Commands;

use App\Jobs\ProcessAnimeXmlJob;
use Illuminate\Console\Command;

class ProcessSpecificAnidbId extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'anime:process-anidb {id : The AniDB ID of the anime to process}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Process a specific anime by its AniDB ID';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $animeId = $this->argument('id');

        $this->info("Processing anime with AniDB ID: {$animeId}");

        try {
            ProcessAnimeXmlJob::dispatch((int) $animeId);
            $this->info("Job dispatched successfully for anime ID: {$animeId}");
        } catch (\Exception $e) {
            $this->error("Failed to dispatch job: {$e->getMessage()}");
            return Command::FAILURE;
        }

        return Command::SUCCESS;
    }
}
