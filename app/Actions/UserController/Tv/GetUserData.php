<?php

namespace App\Actions\UserController\Tv;

use App\Models\User;

class GetUserData
{
    public function handle(User $user): array
    {
        return [
            'id' => $user->id,
            'username' => $user->username,
            'created_at' => 'Joined ' . $user->created_at->format('F Y'),
            'avatar' => $user->avatar,
            'banner' => $user->banner,
        ];
    }
}
