<?php

namespace App\Actions\Anime\Plays;

use App\Actions\Activity\CreateUserActivityAction;
use App\Models\UserActivity;
use App\Models\UserAnime\UserAnimeCollection;

class DeleteUserAnimeCollectionPlayAction
{
    public function __construct(
        private readonly CreateUserActivityAction $createActivity
    ) {}

    public function execute(UserAnimeCollection $collection): void
    {

        // Delete all activities related to this collection
        UserActivity::where('activity_type', 'anime_watch')
            ->where('user_id', $collection->userLibrary->user_id)
            ->where(function ($query) use ($collection) {
                $query->whereJsonContains('metadata->map_id', $collection->map_id)
                    ->orWhere(function ($q) use ($collection) {
                        $q->where('subject_type', UserAnimeCollection::class)
                            ->where('subject_id', $collection->id);
                    });
            })
            ->delete();

        // Delete collection activities
        $this->createActivity->deleteForSubject($collection);
    }
}
