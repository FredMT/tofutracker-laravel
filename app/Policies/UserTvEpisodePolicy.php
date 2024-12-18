<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserTvEpisode;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserTvEpisodePolicy
{
    use HandlesAuthorization;

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, UserTvEpisode $userTvEpisode): bool
    {
        return $user->id === $userTvEpisode->user_id;
    }
}
