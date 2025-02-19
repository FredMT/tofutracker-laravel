<?php

namespace App\Actions\UserController\Tv\TvEpisodes;

use App\Pipeline\Shared\UpdateShowStatus;
use App\Pipeline\TV\EnsureUserTvLibrary;
use App\Pipeline\TV\EnsureUserTvShow;
use App\Pipeline\UserTvEpisode\CreateUserTvEpisode;
use App\Pipeline\UserTvEpisode\CreateUserTvEpisodePlay;
use App\Pipeline\UserTvEpisode\CreateUserTvEpisodeWatchActivity;
use App\Pipeline\UserTvEpisode\EnsureTvShowExists;
use App\Pipeline\UserTvEpisode\EnsureUserTvSeason;
use App\Pipeline\UserTvEpisode\UpdateSeasonStatus;
use App\Pipeline\UserTvEpisode\ValidateEpisodeRelations;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Pipeline;

class StoreUserTvEpisodeAction
{
    public function execute(array $validated, $user): array
    {
        return DB::transaction(function () use ($validated, $user) {
            return Pipeline::send([
                'user' => $user,
                'validated' => $validated,
            ])
                ->through([
                    ValidateEpisodeRelations::class,
                    EnsureTvShowExists::class,
                    EnsureUserTvLibrary::class,
                    EnsureUserTvShow::class,
                    EnsureUserTvSeason::class,
                    CreateUserTvEpisode::class,
                    CreateUserTvEpisodePlay::class,
                    CreateUserTvEpisodeWatchActivity::class,
                    UpdateSeasonStatus::class,
                    UpdateShowStatus::class,
                ])
                ->thenReturn();
        });
    }
}
