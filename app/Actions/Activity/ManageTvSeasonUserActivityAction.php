<?php

namespace App\Actions\Activity;

use App\Models\TvSeason;
use App\Models\TvShow;
use App\Models\UserActivity;
use App\Models\UserTv\UserTvSeason;
use App\Repositories\UserActivityRepository;

class ManageTvSeasonUserActivityAction
{
    private UserActivityRepository $activityRepository;

    public function __construct()
    {
        $this->activityRepository = new UserActivityRepository();
    }

    public function execute(UserTvSeason $userSeason, ?array $additionalMetadata = null): UserActivity
    {
        $show = TvShow::find($userSeason->show_id);
        $season = TvSeason::find($userSeason->season_id);

        if (! $show || ! $season) {
            throw new \Exception('Show or season not found');
        }

        return $this->activityRepository->createTvSeasonWatchActivity($userSeason, $show, $season, $additionalMetadata);
    }

    public function delete(UserTvSeason $userSeason): void
    {
        $this->activityRepository->deleteByMetadataContains([
            'activity_type' => 'tv_watch',
        ], 'user_tv_season_id', $userSeason->id);
    }
}
