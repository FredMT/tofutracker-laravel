<?php

namespace App\Pipeline\UserTvEpisode;

use App\Models\TvEpisode;
use Closure;

class ValidateEpisodeRelations
{
    public function __invoke($payload, Closure $next)
    {
        $episode = TvEpisode::where([
            'id' => $payload['validated']['episode_id'],
            'season_id' => $payload['validated']['season_id'],
            'show_id' => $payload['validated']['show_id'],
        ])->first();

        if (! $episode) {
            return back()->with([
                'success' => false,
                'message' => 'Invalid episode, season, or show combination',
            ]);
        }

        $payload['episode'] = $episode;
        $payload['episode_title'] = $episode->data['name'] ?? 'Episode '.$episode->data['episode_number'];

        return $next($payload);
    }
}
