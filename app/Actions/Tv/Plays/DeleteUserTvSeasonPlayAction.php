<?php

namespace App\Actions\Tv\Plays;

use App\Actions\Activity\CreateUserActivityAction;
use App\Models\UserActivity;
use App\Models\UserTvSeason;
use App\Models\UserTvPlay;

class DeleteUserTvSeasonPlayAction
{
    public function __construct(
        private readonly CreateUserActivityAction $createActivity
    ) {}

    public function execute(UserTvSeason $season): void
    {
        // Delete all episode plays
        UserTvPlay::where('user_tv_season_id', $season->id)->delete();

        // Delete all episode activities
        UserActivity::where('activity_type', 'tv_watch')
            ->where('user_id', $season->user_id)
            ->where(function ($query) use ($season) {
                $query->whereJsonContains('metadata->user_tv_season_id', $season->id)
                    ->orWhere(function ($q) use ($season) {
                        $q->where('subject_type', UserTvSeason::class)
                            ->where('subject_id', $season->id);
                    });
            })
            ->delete();

        // Delete season activities
        $this->createActivity->deleteForSubject($season);
    }
}
