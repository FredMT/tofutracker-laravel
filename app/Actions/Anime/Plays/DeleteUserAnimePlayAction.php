<?php

namespace App\Actions\Anime\Plays;

use App\Actions\Activity\ManageAnimePlayActivityAction;
use App\Models\UserAnime\UserAnime;
use App\Models\UserAnime\UserAnimeCollection;
use App\Models\UserAnime\UserAnimeEpisode;
use App\Models\UserAnime\UserAnimePlay;
use Illuminate\Database\Eloquent\Model;

class DeleteUserAnimePlayAction
{
    public function __construct(
        private readonly ManageAnimePlayActivityAction $manageActivity
    ) {}

    /**
     * Delete play records for a single model
     */
    public function execute(Model $playable): void
    {
        // Delete play records
        UserAnimePlay::query()
            ->where('playable_type', $playable::class)
            ->where('playable_id', $playable->id)
            ->delete();

        // Delete associated activity only for UserAnime and UserAnimeEpisode models
        if ($playable instanceof UserAnime || $playable instanceof UserAnimeEpisode) {
            $this->manageActivity->deleteActivity($playable);
        }
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
        // Delete season plays
        $this->execute($season);

        // Delete collection plays (only play records, not activity)
        UserAnimePlay::query()
            ->where('playable_type', UserAnimeCollection::class)
            ->where('playable_id', $collection->id)
            ->delete();

        // Delete episode plays if any exist
        $episodeIds = $season->episodes()->pluck('id');
        if ($episodeIds->isNotEmpty()) {
            // Delete play records for episodes
            UserAnimePlay::query()
                ->where('playable_type', UserAnimeEpisode::class)
                ->whereIn('playable_id', $episodeIds)
                ->delete();

            // Delete activities for all episodes
            $season->episodes->each(function ($episode) {
                $this->manageActivity->deleteActivity($episode);
            });
        }
    }
}
