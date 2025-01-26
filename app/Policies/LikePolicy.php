<?php

namespace App\Policies;

use App\Models\User;

class LikePolicy
{
    /**
     * Determine whether the user can toggle likes.
     */
    public function toggle(?User $user): bool
    {
        if (! $user) {
            return false;
        }

        return $user->hasVerifiedEmail();
    }
}
