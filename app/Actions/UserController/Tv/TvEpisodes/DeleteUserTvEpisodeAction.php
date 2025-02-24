<?php

namespace App\Actions\UserController\Tv\TvEpisodes;

use App\Actions\Activity\ManageTvEpisodeWatchActivityAction;
use App\Actions\Tv\Plays\DeleteUserTvPlayAction;
use App\Models\UserTv\UserTvEpisode;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;

class DeleteUserTvEpisodeAction
{
    public function __construct(
        private DeleteUserTvPlayAction $deleteTvPlay,
        private ManageTvEpisodeWatchActivityAction $manageActivity
    ) {}

    public function execute(int $userId, array $validated): void
    {
        DB::transaction(function () use ($userId, $validated) {
            $episode = UserTvEpisode::where([
                'user_id' => $userId,
                'episode_id' => $validated['episode_id'],
                'show_id' => $validated['show_id'],
                'season_id' => $validated['season_id'],
            ])->firstOrFail();

            if (request()->user()->cannot('delete', $episode)) {
                throw new AuthorizationException('You are not authorized to remove this episode');
            }

            $this->deleteTvPlay->execute($episode);
            $this->manageActivity->delete($episode);
            $episode->delete();
        });
    }
}
