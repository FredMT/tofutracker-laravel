<?php

namespace App\Actions\UserController\Tv\TvSeason;

use App\Models\User;
use App\Models\UserTv\UserTvSeason;
use App\Pipeline\TV\EnsureUserTvLibrary;
use App\Pipeline\TV\EnsureUserTvShow;
use App\Pipeline\UserTvSeason\CreateUserTvSeasonWithRating;
use App\Pipeline\UserTvSeason\ValidateSeasonRelations;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Pipeline;

class RateUserTvSeasonAction
{
    public function execute(User $user, array $validated): array
    {
        return DB::transaction(function () use ($user, $validated) {
            // Try to find existing user season entry
            $userSeason = UserTvSeason::where([
                'user_id' => $user->id,
                'season_id' => $validated['season_id'],
                'show_id' => $validated['show_id'],
            ])->first();

            // If season exists, check authorization and update
            if ($userSeason) {
                if (! Gate::allows('update', $userSeason)) {
                    throw new \Illuminate\Auth\Access\AuthorizationException;
                }

                // Check if trying to update to the same rating
                if ((float) $validated['rating'] === (float) $userSeason->rating) {
                    return [
                        'success' => false,
                        'message' => "Season already has a rating of {$userSeason->rating}",
                    ];
                }

                $userSeason->update(['rating' => $validated['rating']]);

                return [
                    'success' => true,
                    'message' => 'Season rating updated successfully',
                ];
            }

            /*
            Pipeline variables = user, validated, season, tv_show, show_title, season_title, library, show, user_season
            */
            Pipeline::send([
                'user' => $user,
                'validated' => $validated,
            ])
                ->through([
                    ValidateSeasonRelations::class,
                    EnsureUserTvLibrary::class,
                    EnsureUserTvShow::class,
                    CreateUserTvSeasonWithRating::class,
                ])
                ->thenReturn();
            // // If season doesn't exist, create new entries
            // // First, ensure user has a TV library
            // $userLibrary = UserLibrary::firstOrCreate([
            //     'user_id' => $userId,
            //     'type' => MediaType::TV,
            // ]);

            // // Then, ensure user has a TV show entry
            // $userShow = UserTvShow::firstOrCreate(
            //     [
            //         'user_id' => $userId,
            //         'show_id' => $validated['show_id'],
            //     ],
            //     [
            //         'user_library_id' => $userLibrary->id,
            //     ]
            // );

            // // Finally, create the season entry with the rating
            // UserTvSeason::create([
            //     'user_id' => $userId,
            //     'user_tv_show_id' => $userShow->id,
            //     'show_id' => $validated['show_id'],
            //     'season_id' => $validated['season_id'],
            //     'rating' => $validated['rating'],
            // ]);

            return [
                'success' => true,
                'message' => 'Season added to library with rating',
            ];
        });
    }
}
