<?php

namespace App\Actions\Activity\Handlers;

use App\Models\TvSeason;
use App\Models\TvShow;
use App\Models\UserActivity;
use App\Models\UserTv\UserTvEpisode;
use Illuminate\Database\Eloquent\Model;

class TvEpisodeActivityHandler implements TvActivityInterface
{
    public function canHandle(Model $subject): bool
    {
        return $subject instanceof UserTvEpisode;
    }

    public function createActivity(int $userId, string $activityType, Model $subject, ?array $metadata = null): UserActivity
    {
        if (! $this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserTvEpisode models');
        }

        $show = TvShow::find($subject->show_id);
        $season = TvSeason::find($subject->season_id);

        $recentActivity = UserActivity::where('activity_type', 'tv_watch')
            ->where('user_id', $userId)
            ->where('subject_type', UserTvEpisode::class)
            ->whereJsonContains('metadata->user_tv_season_id', $subject->user_tv_season_id)
            ->where('occurred_at', '>=', now()->subHour())
            ->latest('occurred_at')
            ->first();

        if ($recentActivity) {
            // Update existing activity
            $metadata = $recentActivity->metadata;
            $episodeIds = $metadata['user_tv_episode_ids'] ?? [];
            $episodeIds[] = $subject->id;
            $metadata['user_tv_episode_ids'] = array_values(array_unique($episodeIds));
            $metadata['count'] = count($metadata['user_tv_episode_ids']);
            $metadata['episode_id'] = $subject->episode_id;

            $recentActivity->update([
                'metadata' => $metadata,
                'description' => $this->generateDescription($show, $season, $metadata['count']),
                'occurred_at' => now(),
            ]);

            return $recentActivity;
        }

        $episodeIds = $metadata['user_tv_episode_ids'] ?? [$subject->id];
        $count = count($episodeIds);

        $metadata = array_merge($metadata ?? [], [
            'poster_path' => $subject->episode->poster,
            'poster_from' => 'tmdb',
            'user_tv_show_id' => $subject->userTvSeason->user_tv_show_id,
            'user_tv_season_id' => $subject->user_tv_season_id,
            'show_id' => $show?->id,
            'season_id' => $subject->season_id,
            'episode_id' => $subject->episode_id,
            'user_tv_episode_ids' => $episodeIds,
            'count' => $count,
            'season_title' => "{$show->title} {$season->title}",
            'season_link' => "/tv/{$show->id}/season/{$season->season_number}",
            'type' => 'tv_episode',
        ]);

        return UserActivity::create([
            'user_id' => $userId,
            'activity_type' => $activityType,
            'subject_type' => get_class($subject),
            'subject_id' => $subject->id,
            'metadata' => $metadata,
            'description' => $this->generateDescription($show, $season, $count),
            'occurred_at' => now(),
        ]);
    }

    public function deleteActivity(Model $subject): void
    {
        if (! $this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserTvEpisode models');
        }

        UserActivity::where('activity_type', 'tv_watch')
            ->where('user_id', $subject->user_id)
            ->whereJsonContains('metadata->user_tv_episode_ids', $subject->id)
            ->each(function ($activity) use ($subject) {
                $metadata = $activity->metadata;

                $metadata['user_tv_episode_ids'] = array_values(
                    array_filter(
                        $metadata['user_tv_episode_ids'] ?? [],
                        fn ($id) => $id !== $subject->id
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

    private function generateDescription(?TvShow $show, ?TvSeason $season, int $count): string
    {
        if (! $show) {
            return 'Watched TV episode';
        }

        $seasonTitle = $season?->title ? " {$season->title}" : '';
        $episodeText = $count === 1 ? '1 episode' : "{$count} episodes";

        return "Watched {$episodeText} of {$show->title}{$seasonTitle}";
    }

    public function getTvShowTitle(Model $subject): ?string
    {
        if (! $this->canHandle($subject)) {
            return null;
        }

        return TvShow::find($subject->show_id)?->title;
    }

    public function getTvShowId(Model $subject): ?int
    {
        if (! $this->canHandle($subject)) {
            return null;
        }

        return $subject->show_id;
    }
}
