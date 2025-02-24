<?php

namespace App\Actions\Activity;

use App\Models\Anidb\AnidbAnime;
use App\Models\UserActivity;
use App\Models\UserAnime\UserAnime;
use App\Models\UserAnime\UserAnimeEpisode;
use App\Repositories\UserActivityRepository;
use Illuminate\Database\Eloquent\Model;

class ManageAnimePlayActivityAction
{
    private UserActivityRepository $activityRepository;

    public function __construct()
    {
        $this->activityRepository = new UserActivityRepository();
    }

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
        $recentBatch = $this->activityRepository->findRecentBatchByMetadata(
            $userId,
            'user_anime_id',
            $metadata['user_anime_id'] ?? null
        );

        if ($recentBatch) {
            return $this->activityRepository->updateBatchEpisodeActivity($recentBatch, $episode);
        }

        return $this->activityRepository->createAnimeWatchActivity($userId, $episode, $metadata);
    }

    private function createAnimeActivity(int $userId, UserAnime $userAnime, ?array $metadata = null): UserActivity
    {
        return $this->activityRepository->createAnimeWatchActivity($userId, $userAnime, $metadata);
    }

    private function deleteEpisodeActivity(UserAnimeEpisode $episode): void
    {
        $this->activityRepository->deleteAnimeEpisodeActivity($episode);
    }

    private function deleteAnimeActivity(UserAnime $userAnime): void
    {
        $this->activityRepository->deleteByConditions([
            'activity_type' => 'anime_watch',
            'subject_type' => UserAnime::class,
            'subject_id' => $userAnime->id,
        ]);
    }
}
