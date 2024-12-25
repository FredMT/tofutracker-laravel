<?php

namespace App\Actions\UserController\Tv;

use App\Models\User;
use App\Models\UserTvShow;

class GetUserTvGenres
{
    public function handle(User $user): array
    {
        return UserTvShow::query()
            ->with(['show'])
            ->whereHas('userLibrary', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->get()
            ->flatMap(function ($userTvShow) {
                return $userTvShow->show->genres;
            })
            ->unique('id')
            ->values()
            ->toArray();
    }
}
