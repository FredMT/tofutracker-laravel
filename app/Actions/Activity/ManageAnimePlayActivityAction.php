<?php

namespace App\Actions\Activity;

use App\Models\Anidb\AnidbAnime;
use App\Models\UserActivity;
use App\Models\UserAnime\UserAnime;
use App\Models\UserAnime\UserAnimeEpisode;
use Illuminate\Database\Eloquent\Model;

class ManageAnimePlayActivityAction
{
    public function createActivity(int $userId, Model $subject, ?array $metadata = null): UserActivity
    {
        if ($subject instanceof UserAnimeEpisode) {
            return $this->createEpisodeActivity($userId, $subject, $metadata);
        }

        if ($subject instanceof UserAnime) {
            return $this->createAnimeActivity($userId, $subject, $metadata);
        }

        throw new \InvalidArgumentException('Subject must be either UserAnimeEpisode or UserAnime');
    }

    public function deleteActivity(Model $subject): void
    {
        if ($subject instanceof UserAnimeEpisode) {
            $this->deleteEpisodeActivity($subject);
            return;
        }

        if ($subject instanceof UserAnime) {
            $this->deleteAnimeActivity($subject);
            return;
        }

        throw new \InvalidArgumentException('Subject must be either UserAnimeEpisode or UserAnime');
    }

    private function createEpisodeActivity(int $userId, UserAnimeEpisode $episode, ?array $metadata = null): UserActivity
    {
        $recentBatch = $this->findRecentBatch($userId, $metadata['user_anime_id'] ?? null);
        if ($recentBatch) {
            return $this->updateBatch($recentBatch, $episode);
        }

        $anime = AnidbAnime::find($episode->userAnime->anidb_id);
        $metadata = array_merge($metadata ?? [], [
            'user_anime_episode_ids' => [$episode->id],
            'count' => 1,
            'anidb_id' => $episode->userAnime->anidb_id,
            'poster_path' => $episode->episode->poster ?? $anime?->poster,
            'poster_from' => $episode->episode->poster ? 'tvdb' : 'anidb',
            'map_id' => $anime?->map(),
            'anime_title' => $anime?->title,
            'anime_link' => $anime ? "/anime/{$anime->map()}/season/{$anime->id}" : null,
            'type' => 'anime_episode'
        ]);

        return UserActivity::create([
            'user_id' => $userId,
            'activity_type' => 'anime_watch',
            'subject_type' => UserAnimeEpisode::class,
            'subject_id' => $episode->id,
            'metadata' => $metadata,
            'description' => $this->generateEpisodeDescription($metadata),
            'occurred_at' => now(),
        ]);
    }

    private function createAnimeActivity(int $userId, UserAnime $userAnime, ?array $metadata = null): UserActivity
    {
        $anime = AnidbAnime::find($userAnime->anidb_id);
        $metadata = array_merge($metadata ?? [], [
            'user_anime_id' => $userAnime->id,
            'anidb_id' => $userAnime->anidb_id,
            'map_id' => $anime?->map(),
            'is_movie' => $userAnime->is_movie,
            'poster_path' => $anime?->poster,
            'poster_from' => 'anidb',
            'anime_title' => $anime?->title,
            'anime_link' => $anime ? "/anime/{$anime->map()}/season/{$anime->id}" : null,
            'type' => 'anime_season'
        ]);

        return UserActivity::create([
            'user_id' => $userId,
            'activity_type' => 'anime_watch',
            'subject_type' => UserAnime::class,
            'subject_id' => $userAnime->id,
            'metadata' => $metadata,
            'description' => $this->generateAnimeDescription($anime),
            'occurred_at' => now()->addSecond(),
        ]);
    }

    private function deleteEpisodeActivity(UserAnimeEpisode $episode): void
    {
        UserActivity::where('activity_type', 'anime_watch')
            ->where('user_id', $episode->load('user')->user->id)
            ->whereJsonContains('metadata->user_anime_episode_ids', $episode->id)
            ->each(function ($activity) use ($episode) {
                $metadata = $activity->metadata;

                $metadata['user_anime_episode_ids'] = array_values(
                    array_filter(
                        $metadata['user_anime_episode_ids'] ?? [],
                        fn($id) => $id !== $episode->id
                    )
                );

                $metadata['count'] = count($metadata['user_anime_episode_ids']);

                if ($metadata['count'] === 0) {
                    $activity->delete();
                } else {
                    $activity->update([
                        'metadata' => $metadata,
                        'description' => $this->generateEpisodeDescription($metadata),
                    ]);
                }
            });
    }

    private function deleteAnimeActivity(UserAnime $userAnime): void
    {
        UserActivity::where('activity_type', 'anime_watch')
            ->where('subject_type', UserAnime::class)
            ->where('subject_id', $userAnime->id)
            ->delete();
    }

    private function findRecentBatch(int $userId, ?int $userAnimeId): ?UserActivity
    {
        if (!$userAnimeId) {
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
            'description' => $this->generateEpisodeDescription($metadata),
            'occurred_at' => now(),
        ]);

        return $activity;
    }

    private function generateEpisodeDescription(array $metadata): string
    {
        if (!isset($metadata['anidb_id'])) {
            return 'Watched anime';
        }

        try {
            $anime = AnidbAnime::find($metadata['anidb_id']);
            if (!$anime) {
                return 'Watched anime';
            }

            $count = $metadata['count'] ?? 1;

            return 'Watched ' .
                ($count === 1 ? '1 episode' : "{$count} episodes") .
                " of {$anime->title}";
        } catch (\Exception $e) {
            return 'Watched anime';
        }
    }

    private function generateAnimeDescription(?AnidbAnime $anime): string
    {
        if (!$anime) {
            return 'Watched anime';
        }

        return "Watched {$anime->title}";
    }
}
