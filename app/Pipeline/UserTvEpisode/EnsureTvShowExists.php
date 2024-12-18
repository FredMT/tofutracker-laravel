<?php

namespace App\Pipeline\UserTvEpisode;

use App\Models\TvShow;
use Closure;

class EnsureTvShowExists
{
    public function __invoke($payload, Closure $next)
    {
        $tvShow = TvShow::findOrFail($payload['validated']['show_id']);

        $payload['tv_show'] = $tvShow;
        $payload['show_title'] = $tvShow->data['name'] ?? 'Unknown Show';

        return $next($payload);
    }
}
