<?php

namespace App\Actions\UserController\Tv\TvShow;

use App\Models\User;
use App\Models\UserTv\UserTvShow;
use App\Pipeline\TV\EnsureUserTvLibrary;
use App\Pipeline\UserTvEpisode\EnsureTvShowExists;
use App\Pipeline\UserTvShow\CreateUserTvShowForRating;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Pipeline;

class RateUserTvShowAction
{
    public function execute(User $user, array $validated): array
    {
        return DB::transaction(function () use ($user, $validated) {
            $userShow = UserTvShow::where([
                'user_id' => $user->id,
                'show_id' => $validated['show_id'],
            ])->first();

            if (Gate::denies('rate-tv-show', $userShow)) {
                throw new \Illuminate\Auth\Access\AuthorizationException('You do not own this TV show.');
            }

            if ($userShow && (float) $validated['rating'] === (float) $userShow->rating) {
                return [
                    'success' => false,
                    'message' => "Show already has a rating of {$userShow->rating}",
                ];
            }

            if (! $userShow) {
                return Pipeline::send([
                    'user' => $user,
                    'validated' => $validated,
                ])
                    ->through([
                        EnsureTvShowExists::class,
                        EnsureUserTvLibrary::class,
                        CreateUserTvShowForRating::class,
                    ])
                    ->thenReturn();
            }

            $userShow->update(['rating' => $validated['rating']]);

            return [
                'success' => true,
                'message' => 'Show rating updated successfully',
            ];
        });
    }
}
