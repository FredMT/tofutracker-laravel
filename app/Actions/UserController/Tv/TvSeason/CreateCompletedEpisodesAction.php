<?php

namespace App\Actions\UserController\Tv\TvSeason;

use App\Actions\Activity\CreateUserActivityAction;
use App\Actions\Tv\Plays\CreateUserTvSeasonPlayAction;
use App\Enums\WatchStatus;
use App\Models\TvEpisode;
use App\Models\UserActivity;
use App\Models\UserTv\UserTvEpisode;
use App\Models\UserTv\UserTvPlay;

class CreateCompletedEpisodesAction
{
    public function __construct(
        private readonly CreateUserTvSeasonPlayAction $createTvSeasonPlay,
        private readonly CreateUserActivityAction $createActivity
    ) {}

    public function execute(array $data): array
    {
        $episodes = TvEpisode::where([
            'show_id' => $data['show_id'],
            'season_id' => $data['season_id'],
        ])->get();

        $createdEpisodes = [];
        $episodeIds = [];

        // Find existing episode activity for this season
        $existingActivity = $this->findExistingActivity($data['user_id'], $data['user_season_id']);
        $existingEpisodeIds = $existingActivity?->metadata['user_tv_episode_ids'] ?? [];

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

            $this->createPlayRecordIfNeeded($userEpisode, $data, $existingEpisodeIds);
        }

        if (!empty($createdEpisodes)) {
            $this->handleActivityCreation($existingActivity, $createdEpisodes, $episodeIds, $data);
            $this->createTvSeasonPlay->execute($data['user_season']);
        }

        return [
            'created_episodes' => $createdEpisodes,
            'episode_ids' => $episodeIds,
        ];
    }

    private function findExistingActivity(int $userId, int $userSeasonId): ?UserActivity
    {
        return UserActivity::where('activity_type', 'tv_watch')
            ->where('user_id', $userId)
            ->whereJsonContains('metadata->user_tv_season_id', $userSeasonId)
            ->where('subject_type', UserTvEpisode::class)
            ->latest('occurred_at')
            ->first();
    }

    private function createPlayRecordIfNeeded(UserTvEpisode $userEpisode, array $data, array $existingEpisodeIds): void
    {
        if (!in_array($userEpisode->id, $existingEpisodeIds)) {
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
    }

    private function handleActivityCreation(?UserActivity $existingActivity, array $createdEpisodes, array $episodeIds, array $data): void
    {
        $firstEpisode = $createdEpisodes[0];

        if ($existingActivity) {
            $this->updateExistingActivity($existingActivity, $firstEpisode, $episodeIds);
        } else {
            $this->createNewActivity($firstEpisode, $data, $episodeIds);
        }
    }

    private function updateExistingActivity(UserActivity $activity, UserTvEpisode $firstEpisode, array $episodeIds): void
    {
        $metadata = $activity->metadata;
        $metadata['user_tv_episode_ids'] = array_values(array_unique($episodeIds));
        $metadata['count'] = count($metadata['user_tv_episode_ids']);
        $metadata['episode_id'] = $firstEpisode->episode_id;

        $activity->update([
            'metadata' => $metadata,
            'description' => "Watched {$metadata['count']} episodes of {$firstEpisode->userTvSeason->show->title} {$firstEpisode->userTvSeason->season->title}",
            'occurred_at' => now(),
        ]);
    }

    private function createNewActivity(UserTvEpisode $firstEpisode, array $data, array $episodeIds): void
    {
        $this->createActivity->execute(
            userId: $data['user_id'],
            activityType: 'tv_watch',
            subject: $firstEpisode,
            metadata: [
                'user_tv_show_id' => $firstEpisode->userTvSeason->user_tv_show_id,
                'user_tv_season_id' => $firstEpisode->user_tv_season_id,
                'show_id' => $firstEpisode->show_id,
                'season_id' => $firstEpisode->season_id,
                'episode_id' => $firstEpisode->episode_id,
                'user_tv_episode_ids' => $episodeIds,
                'count' => count($episodeIds),
            ]
        );
    }
}
