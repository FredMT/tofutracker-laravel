<?php

namespace App\Actions\UserController\Tv\TvSeason;

use App\Actions\Activity\ManageTvSeasonUserActivityAction;
use App\Models\User;
use App\Models\UserTv\UserTvPlay;
use App\Models\UserTv\UserTvSeason;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class DeleteUserTvSeasonAction
{
    public function __construct(
        private readonly ManageTvSeasonUserActivityAction $manageActivity
    ) {}

    public function execute(User $user, array $validated): void
    {
        DB::transaction(function () use ($user, $validated) {
            $season = UserTvSeason::where([
                'user_id' => $user->id,
                'season_id' => $validated['season_id'],
                'show_id' => $validated['show_id'],
            ])->firstOrFail();

            if (! Gate::allows('delete', $season)) {
                throw new \Illuminate\Auth\Access\AuthorizationException;
            }

            UserTvPlay::where('user_tv_season_id', $season->id)->delete();
            $this->manageActivity->delete($season);
            $season->delete();
        });
    }
}
