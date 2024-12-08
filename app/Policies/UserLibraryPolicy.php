<?php

namespace App\Policies;

use App\Models\User;
use App\Models\UserLibrary;
use Illuminate\Auth\Access\Response;

class UserLibraryPolicy
{
    /**
     * Determine if the user can view any library entries.
     */
    public function viewAny(User $user): Response
    {
        return Response::allow();
    }

    /**
     * Determine if the user can view the library entry.
     */
    public function view(User $user, UserLibrary $library): Response
    {
        // Allow if entry is public or if user owns the entry
        if (!$library->is_private || $user->id === $library->user_id) {
            return Response::allow();
        }

        return Response::deny('This library entry is private.');
    }

    /**
     * Determine if the user can create library entries.
     */
    public function create(User $user): Response
    {
        if (!$user->hasVerifiedEmail()) {
            return Response::deny('Please verify your email address before adding entries to your library.');
        }

        return Response::allow();
    }

    /**
     * Determine if the user can update the library entry.
     */
    public function update(User $user, UserLibrary $library): Response
    {
        return $user->id === $library->user_id
            ? Response::allow()
            : Response::deny('You do not have permission to update this library entry.');
    }

    /**
     * Determine if the user can delete the library entry.
     */
    public function delete(User $user, UserLibrary $library): Response
    {
        return $user->id === $library->user_id
            ? Response::allow()
            : Response::deny('You do not have permission to delete this library entry.');
    }
}
