<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserTvSeason;
use Illuminate\Auth\Access\Response;

class UserTvSeasonPolicy
{
    public function watch_status(User $user, ?UserTvSeason $userSeason = null): bool
    {
        if (!$userSeason) {
            return true;
        }

        // If the season exists, check if the user owns it
        return $user->id === $userSeason->user_id;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, UserTvSeason $userTvSeason): bool
    {
        return $user->id === $userTvSeason->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, UserTvSeason $userTvSeason): bool
    {
        return $user->id === $userTvSeason->user_id;
    }
}
