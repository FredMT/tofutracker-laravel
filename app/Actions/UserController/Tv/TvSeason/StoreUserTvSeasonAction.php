<?php

namespace App\Actions\UserController\Tv\TvSeason;

use App\Models\User;
use App\Pipeline\Shared\MediaLibraryPipeline;
use App\Pipeline\UserTvSeason\CreateUserTvSeason;
use App\Pipeline\UserTvSeason\InitializeShowStatus;
use App\Pipeline\UserTvSeason\ValidateSeasonRelations;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Pipeline;

class StoreUserTvSeasonAction
{
    public function execute(array $validated, User $user): array
    {
        return DB::transaction(function () use ($validated, $user) {
            return Pipeline::send([
                'user' => $user,
                'validated' => $validated,
            ])
                ->through([
                    ValidateSeasonRelations::class,
                    MediaLibraryPipeline::tv(),
                    InitializeShowStatus::class,
                    CreateUserTvSeason::class,
                ])
                ->thenReturn();
        });
    }
}
