<?php

namespace App\Actions\UserController\Movie;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Pipeline;

class UpdateUserMovieStatusAction
{
    public function execute(User $user, array $validated): array
    {
        return DB::transaction(function () use ($user, $validated) {
            return Pipeline::send([
                'user' => $user,
                'validated' => $validated,
            ])
                ->through([
                    \App\Pipeline\UserMovie\WatchStatus\ValidateMovieStatus::class,
                    \App\Pipeline\UserMovie\WatchStatus\UpdateOrCreateUserMovie::class,
                ])
                ->thenReturn([
                    'success' => true,
                    'message' => 'Movie status updated successfully',
                ]);
        });
    }
}
