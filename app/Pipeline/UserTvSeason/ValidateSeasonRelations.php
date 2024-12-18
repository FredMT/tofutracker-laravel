<?php

namespace App\Pipeline\UserTvSeason;

use App\Models\TvSeason;
use App\Models\TvShow;
use Closure;

class ValidateSeasonRelations
{
    public function __invoke($payload, Closure $next)
    {
        $season = TvSeason::where([
            'id' => $payload['validated']['season_id'],
            'show_id' => $payload['validated']['show_id'],
        ])->first();

        if (!$season) {
            return back()->with([
                'success' => false,
                'message' => "Invalid season or show combination",
            ]);
        }

        $show = TvShow::find($payload['validated']['show_id']);

        $payload['season'] = $season;
        $payload['tv_show'] = $show;
        $payload['season_title'] = $season->data['name'] ?? 'Season ' . $season->season_number;
        $payload['show_title'] = $show->data['name'] ?? 'Unknown Show';

        return $next($payload);
    }
}
