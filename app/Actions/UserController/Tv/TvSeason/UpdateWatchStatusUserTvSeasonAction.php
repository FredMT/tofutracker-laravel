<?php

namespace App\Actions\UserController\Tv\TvSeason;

use App\Enums\WatchStatus;
use App\Models\UserTv\UserTvSeason;
use App\Pipeline\Shared\UpdateShowStatus;
use App\Pipeline\TV\EnsureUserTvLibrary;
use App\Pipeline\TV\EnsureUserTvShow;
use App\Pipeline\UserTvSeason\CreateUserTvSeason;
use App\Pipeline\UserTvSeason\UpdateWatchStatus;
use App\Pipeline\UserTvSeason\ValidateSeasonRelations;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Pipeline;

class UpdateWatchStatusUserTvSeasonAction
{
    public function execute(int $userId, array $validated): array
    {
        return DB::transaction(function () use ($userId, $validated) {
            // Try to find existing user season entry
            $userSeason = UserTvSeason::where([
                'user_id' => $userId,
                'season_id' => $validated['season_id'],
                'show_id' => $validated['show_id'],
            ])->first();

            // Check gate authorization
            if (!Gate::allows('update-season-watch-status', $userSeason)) {
                throw new \Illuminate\Auth\Access\AuthorizationException;
            }

            // Check if trying to update to the same status
            if ($userSeason && $userSeason->watch_status === WatchStatus::from($validated['watch_status'])) {
                return [
                    'success' => false,
                    'message' => "Season is already marked as {$validated['watch_status']}",
                ];
            }

            $result = Pipeline::send([
                'user_id' => $userId,
                'validated' => $validated,
                'user_season' => $userSeason,
            ])
                ->through([
                    ValidateSeasonRelations::class,
                    EnsureUserTvLibrary::class,
                    EnsureUserTvShow::class,
                    CreateUserTvSeason::class,
                    UpdateWatchStatus::class,
                    UpdateShowStatus::class,
                ])
                ->thenReturn();

            return [
                'success' => true,
                'message' => "Season marked as {$validated['watch_status']}",
            ];
        });
    }
}
