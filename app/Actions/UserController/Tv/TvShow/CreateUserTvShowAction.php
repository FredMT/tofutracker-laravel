<?php

namespace App\Actions\UserController\Tv\TvShow;

use App\Pipeline\TV\EnsureUserTvLibrary;
use App\Pipeline\UserTvEpisode\EnsureTvShowExists;
use App\Pipeline\UserTvShow\CreateUserTvShow;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Pipeline;

class CreateUserTvShowAction
{
    public function execute(array $validated, $user): array
    {
        return DB::transaction(function () use ($validated, $user) {
            return Pipeline::send([
                'user' => $user,
                'validated' => $validated,
            ])
                ->through([
                    EnsureTvShowExists::class,
                    EnsureUserTvLibrary::class,
                    CreateUserTvShow::class,
                ])
                ->thenReturn();
        });
    }
}
