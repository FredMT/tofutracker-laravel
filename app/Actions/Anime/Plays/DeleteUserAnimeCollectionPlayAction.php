<?php

namespace App\Actions\Anime\Plays;

use App\Models\UserAnime\UserAnimeCollection;
use App\Repositories\UserActivityRepository;

class DeleteUserAnimeCollectionPlayAction
{
    private UserActivityRepository $activityRepository;

    public function __construct()
    {
        $this->activityRepository = new UserActivityRepository;
    }

    public function execute(UserAnimeCollection $collection): void
    {
        $this->activityRepository->deleteAnimeCollectionActivity($collection);
    }
}
