<?php

namespace App\Actions\Anime\Plays;

use App\Actions\Activity\CreateUserActivityAction;
use App\Models\UserAnime\UserAnime;
use App\Models\UserAnime\UserAnimeCollection;
use App\Models\UserAnime\UserAnimeEpisode;
use App\Models\UserAnime\UserAnimePlay;
use Illuminate\Database\Eloquent\Model;

class DeleteUserAnimePlayAction
{
    public function __construct(
        private readonly CreateUserActivityAction $activityAction
    ) {}

    /**
     * Delete play records for a single model
     */
    public function execute(Model $playable): void
    {
        UserAnimePlay::query()
            ->where('playable_type', $playable::class)
            ->where('playable_id', $playable->id)
            ->delete();

        // Delete associated activity
        $this->activityAction->deleteForSubject($playable);
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

            // Delete activities for all episodes
            $season->episodes->each(function ($episode) {
                $this->activityAction->deleteForSubject($episode);
            });
        }
    }
}
