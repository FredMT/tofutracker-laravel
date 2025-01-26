<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserMovie\UserMovie;
use Illuminate\Auth\Access\Response;

class UserMoviePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, UserMovie $userMovie): bool
    {
        return true;
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $user->hasVerifiedEmail();
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, UserMovie $userMovie): Response
    {
        return $user->id === $userMovie->user_id
            ? Response::allow()
            : Response::deny('You do not own this movie entry.');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, UserMovie $userMovie): Response
    {
        return $user->id === $userMovie->user_id
            ? Response::allow()
            : Response::deny('You do not own this movie entry.');
    }
}
