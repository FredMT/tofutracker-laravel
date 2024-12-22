<?php

namespace App\Pipeline\UserTvShow;

use App\Models\TvShow;
use Closure;
use Illuminate\Database\Eloquent\ModelNotFoundException;

class EnsureShowExists
{
    public function handle(array $payload, Closure $next)
    {
        $show = TvShow::find($payload['validated']['show_id']);

        if (!$show) {
            throw new ModelNotFoundException('TV show not found.');
        }

        $payload['tv_show'] = $show;
        $payload['show_title'] = $show->title;

        return $next($payload);
    }
}
