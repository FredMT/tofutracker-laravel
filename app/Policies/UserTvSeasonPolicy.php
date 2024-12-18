<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserTvSeason;
use Illuminate\Auth\Access\HandlerContract;

class UserTvSeasonPolicy
{
    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, UserTvSeason $userTvSeason): bool
    {
        return $user->id === $userTvSeason->user_id;
    }
}
