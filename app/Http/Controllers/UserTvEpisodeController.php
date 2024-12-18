<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Pipeline;
use App\Pipeline\UserTvEpisode\ValidateEpisodeRelations;
use App\Pipeline\UserTvEpisode\EnsureTvShowExists;
use App\Pipeline\UserTvEpisode\EnsureUserTvLibrary;
use App\Pipeline\UserTvEpisode\EnsureUserTvShow;
use App\Pipeline\UserTvEpisode\EnsureUserTvSeason;
use App\Pipeline\UserTvEpisode\CreateUserTvEpisode;
use App\Pipeline\UserTvEpisode\CreateUserTvEpisodePlay;
use App\Pipeline\UserTvEpisode\UpdateSeasonStatus;
use App\Pipeline\UserTvEpisode\UpdateShowStatus;

class UserTvEpisodeController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'show_id' => ['required', 'integer'],
            'season_id' => ['required', 'integer'],
            'episode_id' => ['required', 'integer'],
        ]);

        try {
            return DB::transaction(function () use ($validated, $request) {
                return Pipeline::send([
                    'user' => $request->user(),
                    'validated' => $validated,
                ])
                    ->through([
                        ValidateEpisodeRelations::class,
                        EnsureTvShowExists::class,
                        EnsureUserTvLibrary::class,
                        EnsureUserTvShow::class,
                        EnsureUserTvSeason::class,
                        CreateUserTvEpisode::class,
                        CreateUserTvEpisodePlay::class,
                        UpdateSeasonStatus::class,
                        UpdateShowStatus::class,
                    ])
                    ->then(function ($payload) {
                        return back()->with([
                            'success' => true,
                            'message' => "Episode '{$payload['episode_title']}' added to {$payload['show_title']} in your library",
                        ]);
                    });
            });
        } catch (\Exception $e) {
            logger()->error('Failed to add episode to library: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());
            return back()->with([
                'success' => false,
                'message' => "An error occurred while adding episode to library",
            ]);
        }
    }
}
