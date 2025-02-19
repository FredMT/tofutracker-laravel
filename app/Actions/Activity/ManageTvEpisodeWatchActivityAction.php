<?php

namespace App\Actions\Activity;

use App\Models\TvSeason;
use App\Models\TvShow;
use App\Models\UserActivity;
use App\Models\UserTv\UserTvEpisode;

class ManageTvEpisodeWatchActivityAction
{
    public function execute(UserTvEpisode $userEpisode, ?array $additionalMetadata = null): UserActivity
    {
        $show = TvShow::find($userEpisode->show_id);
        $season = TvSeason::find($userEpisode->season_id);

        // Check for recent activity within the last hour
        $recentActivity = $this->findRecentActivity($userEpisode);

        if ($recentActivity) {
            return $this->updateExistingActivity($recentActivity, $userEpisode, $show, $season);
        }

        return $this->createNewActivity($userEpisode, $show, $season, $additionalMetadata);
    }

    public function delete(UserTvEpisode $userEpisode): void
    {
        UserActivity::where('activity_type', 'tv_watch')
            ->where('user_id', $userEpisode->user_id)
            ->whereJsonContains('metadata->user_tv_episode_ids', $userEpisode->id)
            ->each(function ($activity) use ($userEpisode) {
                $metadata = $activity->metadata;
                $metadata['user_tv_episode_ids'] = array_values(
                    array_filter(
                        $metadata['user_tv_episode_ids'] ?? [],
                        fn($id) => $id !== $userEpisode->id
                    )
                );
                $metadata['count'] = count($metadata['user_tv_episode_ids']);

                if ($metadata['count'] === 0) {
                    $activity->delete();
                } else {
                    $show = TvShow::find($metadata['show_id']);
                    $season = TvSeason::find($metadata['season_id']);
                    $activity->update([
                        'metadata' => $metadata,
                        'description' => $this->generateDescription($show, $season, $metadata['count']),
                    ]);
                }
            });
    }

    private function findRecentActivity(UserTvEpisode $userEpisode): ?UserActivity
    {
        return UserActivity::where('activity_type', 'tv_watch')
            ->where('user_id', $userEpisode->user_id)
            ->where('subject_type', UserTvEpisode::class)
            ->whereJsonContains('metadata->user_tv_season_id', $userEpisode->user_tv_season_id)
            ->latest('occurred_at')
            ->first();
    }

    private function updateExistingActivity(
        UserActivity $activity,
        UserTvEpisode $userEpisode,
        ?TvShow $show,
        ?TvSeason $season
    ): UserActivity {
        $metadata = $activity->metadata;
        $episodeIds = $metadata['user_tv_episode_ids'] ?? [];
        $episodeIds[] = $userEpisode->id;
        $metadata['user_tv_episode_ids'] = array_values(array_unique($episodeIds));
        $metadata['count'] = count($metadata['user_tv_episode_ids']);
        $metadata['episode_id'] = $userEpisode->episode_id;

        $activity->update([
            'metadata' => $metadata,
            'description' => $this->generateDescription($show, $season, $metadata['count']),
            'occurred_at' => now(),
        ]);

        return $activity;
    }

    private function createNewActivity(
        UserTvEpisode $userEpisode,
        ?TvShow $show,
        ?TvSeason $season,
        ?array $additionalMetadata
    ): UserActivity {
        $episodeIds = [$userEpisode->id];
        $count = 1;

        $metadata = array_merge($additionalMetadata ?? [], [
            'poster_path' => $userEpisode->episode->poster,
            'poster_from' => 'tmdb',
            'user_tv_show_id' => $userEpisode->userTvSeason->user_tv_show_id,
            'user_tv_season_id' => $userEpisode->user_tv_season_id,
            'show_id' => $show?->id,
            'season_id' => $userEpisode->season_id,
            'episode_id' => $userEpisode->episode_id,
            'user_tv_episode_ids' => $episodeIds,
            'count' => $count,
            'season_title' => "{$show->title} {$season->title}",
            'season_link' => "/tv/{$show->id}/season/{$season->season_number}",
            'type' => 'tv_episode',
        ]);

        return UserActivity::create([
            'user_id' => $userEpisode->user_id,
            'activity_type' => 'tv_watch',
            'subject_type' => UserTvEpisode::class,
            'subject_id' => $userEpisode->id,
            'metadata' => $metadata,
            'description' => $this->generateDescription($show, $season, $count),
            'occurred_at' => now(),
        ]);
    }

    private function generateDescription(?TvShow $show, ?TvSeason $season, int $count): string
    {
        if (!$show) {
            return 'Watched TV episode';
        }

        $seasonTitle = $season?->title ? " {$season->title}" : '';
        $episodeText = $count === 1 ? '1 episode' : "{$count} episodes";

        return "Watched {$episodeText} of {$show->title}{$seasonTitle}";
    }
}
