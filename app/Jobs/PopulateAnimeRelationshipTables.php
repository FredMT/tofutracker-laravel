<?php

namespace App\Jobs;

use App\Models\Anime\AnimeChainEntry;
use App\Models\Anime\AnimeMap;
use App\Models\Anime\AnimePrequelSequelChain;
use App\Models\Anime\AnimeRelatedEntry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class PopulateAnimeRelationshipTables implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $timeout = 3600; // 1 hour

    public function handle(): void
    {
        $maps = AnimeMap::all();

        foreach ($maps as $map) {
            logger()->info("Processing map ID: {$map->id}");

            try {
                // Process prequel/sequel chains
                foreach ($map->data['prequel_sequel_chains'] as $index => $chain) {
                    try {
                        $chainModel = AnimePrequelSequelChain::create([
                            'map_id' => $map->id,
                            'name' => 'Chain '.($index + 1),
                            'importance_order' => $index + 1,
                        ]);

                        // Create entries for each anime ID in the chain
                        foreach ($chain as $sequenceOrder => $animeId) {
                            try {
                                AnimeChainEntry::create([
                                    'chain_id' => $chainModel->id,
                                    'anime_id' => $animeId,
                                    'sequence_order' => $sequenceOrder + 1,
                                ]);
                            } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
                                logger()->info("Skipping duplicate chain entry for anime_id: {$animeId} in chain: {$chainModel->id}");
                                logger()->info($e->getMessage());

                                continue;
                            }
                        }
                    } catch (\Exception $e) {
                        logger()->error("Error processing chain for map {$map->id}: ".$e->getMessage());

                        continue;
                    }
                }

                // Process other related IDs
                foreach ($map->data['other_related_ids'] as $animeId) {
                    try {
                        AnimeRelatedEntry::create([
                            'map_id' => $map->id,
                            'anime_id' => $animeId,
                        ]);
                    } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
                        logger()->info("Skipping duplicate related entry for anime_id: {$animeId} in map: {$map->id}");
                        logger()->info($e->getMessage());

                        continue;
                    }
                }
            } catch (\Exception $e) {
                logger()->error("Error processing map {$map->id}: ".$e->getMessage());

                continue;
            }
        }
    }
}
