<?php

namespace App\Actions\UserController\Tv\TvShow;

use App\Actions\Activity\ManageTvShowWatchActivityAction;
use App\Models\UserTv\UserTvPlay;
use App\Models\UserTv\UserTvShow;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class DeleteUserTvShowAction
{
    public function __construct(
        private readonly ManageTvShowWatchActivityAction $manageActivity
    ) {}

    public function execute(int $userId, array $validated): void
    {
        DB::transaction(function () use ($userId, $validated) {
            $userShow = UserTvShow::where([
                'user_id' => $userId,
                'show_id' => $validated['show_id'],
            ])->firstOrFail();

            if (Gate::denies('delete-tv-show', $userShow)) {
                throw new \Illuminate\Auth\Access\AuthorizationException('You do not own this TV show.');
            }

            UserTvPlay::where('user_tv_show_id', $userShow->id)->delete();
            $this->manageActivity->delete($userShow);
            $userShow->delete();
        });
    }
}
