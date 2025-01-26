<?php

namespace App\Jobs;

use App\Models\Anime\AnimeMappingExternalId;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessAnimeMapping implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        protected array $animeRecords
    ) {}

    public function handle(): void
    {
        foreach ($this->animeRecords as $anime) {
            AnimeMappingExternalId::create([
                'anime_planet_id' => $anime['anime-planet_id'] ?? null,
                'anisearch_id' => $anime['anisearch_id'] ?? null,
                'anidb_id' => $anime['anidb_id'] ?? null,
                'kitsu_id' => $anime['kitsu_id'] ?? null,
                'mal_id' => $anime['mal_id'] ?? null,
                'type' => $anime['type'] ?? null,
                'notify_moe_id' => $anime['notify.moe_id'] ?? null,
                'anilist_id' => $anime['anilist_id'] ?? null,
                'livechart_id' => $anime['livechart_id'] ?? null,
                'thetvdb_id' => $anime['thetvdb_id'] ?? null,
                'imdb_id' => $anime['imdb_id'] ?? null,
                'themoviedb_id' => $anime['themoviedb_id'] ?? null,
            ]);
        }
    }
}
