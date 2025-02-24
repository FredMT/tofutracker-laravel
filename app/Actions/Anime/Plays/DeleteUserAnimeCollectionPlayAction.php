<?php

namespace App\Actions\Anime\Plays;

use App\Models\UserActivity;
use App\Models\UserAnime\UserAnimeCollection;

class DeleteUserAnimeCollectionPlayAction
{
    public function execute(UserAnimeCollection $collection): void
    {
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
    }
}
