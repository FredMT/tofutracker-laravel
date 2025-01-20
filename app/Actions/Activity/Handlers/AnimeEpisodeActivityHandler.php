<?php

namespace App\Actions\Activity\Handlers;

use App\Models\AnidbAnime;
use App\Models\UserActivity;
use App\Models\UserAnimeEpisode;
use Illuminate\Database\Eloquent\Model;

class AnimeEpisodeActivityHandler implements AnimeActivityInterface
{
    public function canHandle(Model $subject): bool
    {
        return $subject instanceof UserAnimeEpisode;
    }

    public function createActivity(int $userId, string $activityType, Model $subject, ?array $metadata = null): UserActivity
    {
        if (! $this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserAnimeEpisode models');
        }

        $recentBatch = $this->findRecentBatch($userId, $metadata['user_anime_id'] ?? null);
        if ($recentBatch) {
            return $this->updateBatch($recentBatch, $subject);
        }

        return UserActivity::create([
            'user_id' => $userId,
            'activity_type' => $activityType,
            'subject_type' => get_class($subject),
            'subject_id' => $subject->id,
            'metadata' => $metadata,
            'description' => $this->generateDescription($metadata),
            'occurred_at' => now(),
        ]);
    }

    public function deleteActivity(Model $subject): void
    {
        if (! $this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserAnimeEpisode models');
        }

        UserActivity::where('activity_type', 'anime_watch')
            ->where('user_id', $subject->load('user')->user->id)
            ->whereJsonContains('metadata->user_anime_episode_ids', $subject->id)
            ->each(function ($activity) use ($subject) {
                $metadata = $activity->metadata;

                $metadata['user_anime_episode_ids'] = array_values(
                    array_filter(
                        $metadata['user_anime_episode_ids'] ?? [],
                        fn ($id) => $id !== $subject->id
                    )
                );

                $metadata['count'] = count($metadata['user_anime_episode_ids']);

                if ($metadata['count'] === 0) {
                    $activity->delete();
                } else {
                    $activity->update([
                        'metadata' => $metadata,
                        'description' => $this->generateDescription($metadata),
                    ]);
                }
            });
    }

    private function generateDescription(?array $metadata): string
    {
        if (! isset($metadata['anidb_id'])) {
            return 'Watched anime';
        }

        try {
            $anime = AnidbAnime::find($metadata['anidb_id']);
            if (! $anime) {
                return 'Watched anime';
            }

            $count = $metadata['count'] ?? 1;

            return 'Watched '.
                ($count === 1 ? '1 episode' : "{$count} episodes").
                " of {$anime->title}";
        } catch (\Exception $e) {
            return 'Watched anime';
        }
    }

    private function findRecentBatch(int $userId, ?int $userAnimeId): ?UserActivity
    {
        if (! $userAnimeId) {
            return null;
        }

        return UserActivity::where('user_id', $userId)
            ->where('activity_type', 'anime_watch')
            ->whereJsonContains('metadata->user_anime_id', $userAnimeId)
            ->where('occurred_at', '>=', now()->subHour())
            ->latest('occurred_at')
            ->first();
    }

    private function updateBatch(UserActivity $activity, UserAnimeEpisode $episode): UserActivity
    {
        $metadata = $activity->metadata ?? [];
        $episodeIds = $metadata['user_anime_episode_ids'] ?? [];
        $episodeIds[] = $episode->id;

        $metadata['user_anime_episode_ids'] = array_unique($episodeIds);
        $metadata['count'] = count($metadata['user_anime_episode_ids']);

        $activity->update([
            'metadata' => $metadata,
            'description' => $this->generateDescription($metadata),
            'occurred_at' => now(),
        ]);

        return $activity;
    }

    public function getAnimeTitle(Model $subject): ?string
    {
        if (! $this->canHandle($subject)) {
            return null;
        }

        return AnidbAnime::find($subject->userAnime->anidb_id)?->title;
    }

    public function getAnimeId(Model $subject): ?int
    {
        if (! $this->canHandle($subject)) {
            return null;
        }

        return $subject->userAnime->anidb_id;
    }
}
