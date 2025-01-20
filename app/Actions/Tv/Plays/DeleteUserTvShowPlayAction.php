<?php

namespace App\Actions\Tv\Plays;

use App\Actions\Activity\CreateUserActivityAction;
use App\Models\UserActivity;
use App\Models\UserTvPlay;
use App\Models\UserTvShow;

class DeleteUserTvShowPlayAction
{
    public function __construct(
        private readonly CreateUserActivityAction $createActivity
    ) {}

    public function execute(UserTvShow $show): void
    {
        // Delete all plays
        UserTvPlay::where('user_tv_show_id', $show->id)->delete();

        // Delete all activities related to this show
        UserActivity::where('activity_type', 'tv_watch')
            ->where('user_id', $show->user_id)
            ->where(function ($query) use ($show) {
                $query->whereJsonContains('metadata->user_tv_show_id', $show->id)
                    ->orWhere(function ($q) use ($show) {
                        $q->where('subject_type', UserTvShow::class)
                            ->where('subject_id', $show->id);
                    });
            })
            ->delete();

        // Delete show activities
        $this->createActivity->deleteForSubject($show);
    }
}
