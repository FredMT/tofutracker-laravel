<?php

namespace App\Http\Resources;

use App\Models\Anime\AnimeMap;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnimeCollectionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  Request  $request
     * @return array
     */
    public function toArray(Request $request): array
    {
        /** @var AnimeMap $this */
        return [
            'id' => $this->id,
            'collection_name' => $this->collection_name,
            'most_common_tmdb_id' => $this->most_common_tmdb_id,
            'tmdb_type' => $this->tmdb_type,
            'title' => $this->title,
            'tmdb_poster' => $this->poster,
            'chains' => $this->chains->map(function ($chain) {
                return [
                    'id' => $chain->id,
                    'name' => $chain->name,
                    'importance_order' => $chain->importance_order,
                    'entries' => $chain->entries->map(function ($entry) {
                        return [
                            'entry_id' => $entry->id,
                            'map_id' => $this->id,
                            'entry_sequence_order' => $entry->sequence_order,
                            'anime_id' => $entry->anime->id,
                            'title' => $entry->anime->title,
                            'anidb_poster' => $entry->anime->poster,
                            'year' => $entry->anime->year,
                            'rating' => $entry->anime->rating,
                            'episode_count' => $entry->anime->episode_count,
                            'runtime' => $entry->anime->runtime,
                        ];
                    }),
                ];
            }),
            'related_entries' => $this->relatedEntries->map(function ($entry) {
                return [
                    'related_entry_id' => $entry->id,
                    'anime_id' => $entry->anime->id,
                    'map_id' => $this->id,
                    'title' => $entry->anime->title,
                    'anidb_poster' => $entry->anime->poster,
                    'year' => $entry->anime->year,
                    'rating' => $entry->anime->rating,
                    'episode_count' => $entry->anime->episode_count,
                    'runtime' => $entry->anime->runtime,
                ];
            }),
        ];
    }
}
