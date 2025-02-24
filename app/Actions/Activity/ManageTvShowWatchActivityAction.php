<?php

namespace App\Actions\Activity;

use App\Models\TvShow;
use App\Models\UserActivity;
use App\Models\UserTv\UserTvShow;
use App\Repositories\UserActivityRepository;

class ManageTvShowWatchActivityAction
{
    private UserActivityRepository $activityRepository;

    public function __construct()
    {
        $this->activityRepository = new UserActivityRepository();
    }

    public function execute(UserTvShow $userShow, ?array $additionalMetadata = null): UserActivity
    {
        $show = TvShow::find($userShow->show_id);

        if (!$show) {
            throw new \Exception('Show not found');
        }

        return $this->activityRepository->createTvShowWatchActivity($userShow, $show, $additionalMetadata);
    }

    public function delete(UserTvShow $userShow): void
    {
        // Delete all activities where:
        // 1. Activity is for this user
        // 2. Activity type is tv_watch 
        // 3. Either:
        //    a. Subject is the show itself
        //    b. Subject is a season of the show (metadata->show_id matches)
        //    c. Subject is an episode of the show (metadata->show_id matches)
        $this->activityRepository->deleteByMetadataContains([
            'user_id' => $userShow->user_id,
            'activity_type' => 'tv_watch',
        ], 'show_id', $userShow->show_id);
    }
}
