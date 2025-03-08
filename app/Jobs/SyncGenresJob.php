<?php

namespace App\Jobs;

use App\Models\Tmdb\Genre;
use App\Models\Tmdb\TmdbContentGenre;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Collection as SupportCollection;

class SyncGenresJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Collection $items;
    protected string $contentType;

    public function __construct(Collection $items, string $contentType)
    {
        $this->items = $items;
        $this->contentType = $contentType;
    }

    public function handle(): void
    {
        $allGenres = collect();
        $contentGenreRelations = collect();

        foreach ($this->items as $item) {
            $genres = $item->genres;

            if (!empty($genres)) {
                foreach ($genres as $genreData) {
                    $allGenres->put($genreData['id'], [
                        'id' => $genreData['id'],
                        'name' => $genreData['name']
                    ]);

                    $contentGenreRelations->push([
                        'genre_id' => $genreData['id'],
                        'content_type' => $this->contentType,
                        'content_id' => $item->id,
                    ]);
                }
            }
        }

        $this->batchUpsertGenres($allGenres);
        $this->batchUpsertContentGenreRelations($contentGenreRelations);
    }

    private function batchUpsertGenres(SupportCollection $genres): void
    {
        if ($genres->isEmpty()) {
            return;
        }

        Genre::upsert(
            $genres->values()->toArray(),
            ['id'],
            ['name']
        );
    }

    private function batchUpsertContentGenreRelations(SupportCollection $relations): void
    {
        if ($relations->isEmpty()) {
            return;
        }

        foreach ($relations as $relation) {
            TmdbContentGenre::updateOrCreate(
                [
                    'genre_id' => $relation['genre_id'],
                    'content_type' => $relation['content_type'],
                    'content_id' => $relation['content_id'],
                ],
                []
            );
        }
    }
}
