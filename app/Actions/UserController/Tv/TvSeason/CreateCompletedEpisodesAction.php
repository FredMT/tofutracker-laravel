<?php

namespace App\Actions\UserController\Tv\TvSeason;

use App\Actions\Activity\ManageTvEpisodeWatchActivityAction;
use App\Actions\Tv\Plays\CreateUserTvSeasonPlayAction;
use App\Enums\WatchStatus;
use App\Models\TvEpisode;
use App\Models\TvSeason;
use App\Models\TvShow;
use App\Models\UserActivity;
use App\Models\UserTv\UserTvEpisode;
use App\Models\UserTv\UserTvPlay;

class CreateCompletedEpisodesAction
{
    public function __construct(
        private readonly CreateUserTvSeasonPlayAction $createTvSeasonPlay,
        private readonly ManageTvEpisodeWatchActivityAction $manageActivity
    ) {}

    public function execute(array $data): array
    {
        // Load show and season data
        $show = TvShow::find($data['show_id']);
        $season = TvSeason::find($data['season_id']);

        if (!$show || !$season) {
            throw new \Exception('Show or season not found');
        }

        $episodes = TvEpisode::where([
            'show_id' => $data['show_id'],
            'season_id' => $data['season_id'],
        ])->get();

        $createdEpisodes = [];
        $episodeIds = [];

        // Create/update all episodes as completed
        foreach ($episodes as $episode) {
            $userEpisode = UserTvEpisode::updateOrCreate(
                [
                    'user_id' => $data['user_id'],
                    'episode_id' => $episode->id,
                ],
                [
                    'user_tv_season_id' => $data['user_season_id'],
                    'show_id' => $data['show_id'],
                    'season_id' => $data['season_id'],
                    'watch_status' => WatchStatus::COMPLETED,
                ]
            );

            $createdEpisodes[] = $userEpisode;
            $episodeIds[] = $userEpisode->id;

            // Create play record for each episode
            UserTvPlay::firstOrCreate(
                [
                    'user_id' => $data['user_id'],
                    'user_tv_show_id' => $data['show']->id,
                    'user_tv_season_id' => $data['user_season_id'],
                    'user_tv_episode_id' => $userEpisode->id,
                    'playable_id' => $userEpisode->id,
                    'playable_type' => UserTvEpisode::class,
                ],
                ['watched_at' => now()]
            );
        }

        if (!empty($createdEpisodes)) {
            // Find existing activity for this season
            $existingActivity = UserActivity::where('activity_type', 'tv_watch')
                ->where('user_id', $data['user_id'])
                ->whereJsonContains('metadata->user_tv_season_id', $data['user_season_id'])
                ->latest('occurred_at')
                ->first();

            if ($existingActivity) {
                // Update existing activity with all episodes
                $metadata = $existingActivity->metadata;
                $metadata['user_tv_episode_ids'] = array_values(array_unique(
                    array_merge($metadata['user_tv_episode_ids'] ?? [], $episodeIds)
                ));
                $metadata['count'] = count($metadata['user_tv_episode_ids']);

                $existingActivity->update([
                    'metadata' => $metadata,
                    'description' => "Watched {$metadata['count']} episodes of {$show->title} {$season->title}",
                    'occurred_at' => now(),
                ]);
            } else {
                // Create a single activity for all episodes watched
                $this->manageActivity->execute($createdEpisodes[0], [
                    'user_tv_show_id' => $data['show']->id,
                    'user_tv_season_id' => $data['user_season_id'],
                    'show_id' => $data['show_id'],
                    'season_id' => $data['season_id'],
                    'user_tv_episode_ids' => $episodeIds,
                    'count' => count($episodeIds),
                    'season_title' => "{$show->title} {$season->title}",
                    'season_link' => "/tv/{$show->id}/season/{$season->season_number}",
                    'poster_path' => $season->poster,
                    'poster_from' => 'tmdb',
                ]);
            }

            $this->createTvSeasonPlay->execute($data['user_season']);
        }

        return [
            'created_episodes' => $createdEpisodes,
            'episode_ids' => $episodeIds,
        ];
    }
}
