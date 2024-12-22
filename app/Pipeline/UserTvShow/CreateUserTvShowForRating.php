<?php

namespace App\Pipeline\UserTvShow;

use App\Models\TvShow;
use App\Models\UserTvShow;
use Closure;

class CreateUserTvShowForRating
{
    public function handle(array $payload, Closure $next)
    {
        $show = TvShow::findOrFail($payload['validated']['show_id']);

        UserTvShow::create([
            'user_id' => $payload['user']->id,
            'show_id' => $show->id,
            'rating' => $payload['validated']['rating'] ?? null,
            'user_library_id' => $payload['library']->id,
        ]);


        return $next($payload);
    }
}
