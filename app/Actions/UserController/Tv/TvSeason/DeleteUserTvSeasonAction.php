<?php

namespace App\Actions\UserController\Tv\TvSeason;

use App\Actions\Activity\ManageTvSeasonUserActivityAction;
use App\Models\UserTv\UserTvPlay;
use App\Models\UserTv\UserTvSeason;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;

class DeleteUserTvSeasonAction
{
    public function __construct(
        private readonly ManageTvSeasonUserActivityAction $manageActivity
    ) {}

    public function execute(int $userId, array $validated): void
    {
        DB::transaction(function () use ($userId, $validated) {
            $season = UserTvSeason::where([
                'user_id' => $userId,
                'season_id' => $validated['season_id'],
                'show_id' => $validated['show_id'],
            ])->firstOrFail();

            if (!Gate::allows('delete', $season)) {
                throw new \Illuminate\Auth\Access\AuthorizationException();
            }

            UserTvPlay::where('user_tv_season_id', $season->id)->delete();
            $this->manageActivity->delete($season);
            $season->delete();
        });
    }
}
