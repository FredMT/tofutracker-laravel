<?php

namespace App\Actions\Activity;

use App\Models\Movie;
use App\Models\UserActivity;
use App\Models\UserMovie\UserMovie;
use App\Repositories\UserActivityRepository;

class ManageMovieWatchActivityAction
{
    private UserActivityRepository $activityRepository;

    public function __construct()
    {
        $this->activityRepository = new UserActivityRepository;
    }

    public function execute(UserMovie $userMovie, ?array $additionalMetadata = null): UserActivity
    {
        $movie = Movie::find($userMovie->movie_id);
        $recentActivity = $this->activityRepository->findRecentActivityByType(
            $userMovie->user_id,
            'movie_watch',
            UserMovie::class,
            $userMovie->id
        );

        if ($recentActivity) {
            return $this->activityRepository->updateActivity($recentActivity, [
                'metadata' => array_merge($recentActivity->metadata, $additionalMetadata ?? []),
                'description' => $movie ? "Watched {$movie->title}" : 'Watched movie',
                'occurred_at' => now(),
            ]);
        }

        return $this->activityRepository->createMovieWatchActivity($userMovie, $movie, $additionalMetadata);
    }

    public function delete(UserMovie $userMovie): void
    {
        $this->activityRepository->deleteByConditions([
            'activity_type' => 'movie_watch',
            'subject_type' => UserMovie::class,
            'subject_id' => $userMovie->id,
        ]);
    }
}
