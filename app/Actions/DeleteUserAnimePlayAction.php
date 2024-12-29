<?php

namespace App\Actions;

use App\Models\UserAnime;
use App\Models\UserAnimeCollection;
use App\Models\UserAnimeEpisode;
use App\Models\UserAnimePlay;
use Illuminate\Database\Eloquent\Model;

class DeleteUserAnimePlayAction
{
    /**
     * Delete play records for a single model
     */
    public function execute(Model $playable): void
    {
        UserAnimePlay::query()
            ->where('playable_type', $playable::class)
            ->where('playable_id', $playable->id)
            ->delete();
    }

    /**
     * Delete play records for multiple models
     */
    public function executeMultiple(array $playables): void
    {
        foreach ($playables as $playable) {
            $this->execute($playable);
        }
    }

    /**
     * Delete play records for an anime season and its episodes
     */
    public function executeForSeason(UserAnime $season, UserAnimeCollection $collection): void
    {
        // Delete season and collection plays
        $this->executeMultiple([$season, $collection]);

        // Delete episode plays if any exist
        $episodeIds = $season->episodes()->pluck('id');
        if ($episodeIds->isNotEmpty()) {
            UserAnimePlay::query()
                ->where('playable_type', UserAnimeEpisode::class)
                ->whereIn('playable_id', $episodeIds)
                ->delete();
        }
    }
}
