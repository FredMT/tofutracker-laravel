<?php

namespace App\Actions\Activity;

use App\Models\TvSeason;
use App\Models\TvShow;
use App\Models\UserActivity;
use App\Models\UserTv\UserTvEpisode;
use App\Repositories\UserActivityRepository;

class ManageTvEpisodeWatchActivityAction
{
    private UserActivityRepository $activityRepository;

    public function __construct()
    {
        $this->activityRepository = new UserActivityRepository();
    }

    public function execute(UserTvEpisode $userEpisode, ?array $additionalMetadata = null): UserActivity
    {
        $show = TvShow::find($userEpisode->show_id);
        $season = TvSeason::find($userEpisode->season_id);

        $recentActivity = $this->activityRepository->findRecentActivityByType(
            $userEpisode->user_id,
            'tv_watch',
            UserTvEpisode::class,
            null,
            [['metadata->user_tv_season_id', $userEpisode->user_tv_season_id]]
        );

        if ($recentActivity) {
            return $this->activityRepository->updateTvEpisodeActivity($recentActivity, $userEpisode, $show, $season);
        }

        return $this->activityRepository->createTvEpisodeWatchActivity($userEpisode, $show, $season, $additionalMetadata);
    }

    public function delete(UserTvEpisode $userEpisode): void
    {
        $this->activityRepository->deleteTvEpisodeActivity($userEpisode);
    }

    private function generateDescription(?TvShow $show, ?TvSeason $season, int $count): string
    {
        if (!$show) {
            return 'Watched TV episode';
        }

        $seasonTitle = $season?->title ? " {$season->title}" : '';
        $episodeText = $count === 1 ? '1 episode' : "{$count} episodes";

        return "Watched {$episodeText} of {$show->title}{$seasonTitle}";
    }
}
