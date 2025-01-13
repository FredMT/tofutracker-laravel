<?php

namespace App\Console\Commands;

use App\Jobs\ProcessAnimeMapping;
use App\Models\AnimeMappingExternalId;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\LazyCollection;

class FetchAnimeExternalIds extends Command
{
    protected $signature = 'anime:fetch-external-ids';

    protected $description = 'Fetch and store anime external IDs from GitHub';

    public function handle(): int
    {
        $this->info('Fetching anime external IDs...');

        try {
            // Fetch JSON data
            $response = Http::get('https://raw.githubusercontent.com/Fribb/anime-lists/refs/heads/master/anime-list-full.json');

            if (! $response->successful()) {
                throw new \Exception('Failed to fetch data from GitHub');
            }

            $animeList = $response->json();

            // Clear existing data
            AnimeMappingExternalId::truncate();

            // Convert to lazy collection and chunk
            LazyCollection::make($animeList)
                ->chunk(1000)
                ->each(function ($chunk) {
                    ProcessAnimeMapping::dispatch($chunk->all());
                    $this->info('Dispatched job for '.$chunk->count().' records');
                });

            $this->info('Successfully queued '.count($animeList).' anime mappings for processing.');

            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Error: '.$e->getMessage());

            return Command::FAILURE;
        }
    }
}
