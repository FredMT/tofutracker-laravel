<?php

namespace App\Actions\Activity;

use App\Models\Movie;
use App\Models\UserActivity;
use App\Models\UserMovie\UserMovie;

class ManageMovieWatchActivityAction
{
    public function execute(UserMovie $userMovie, ?array $additionalMetadata = null): UserActivity
    {
        $movie = Movie::find($userMovie->movie_id);

        $recentActivity = $this->findRecentActivity($userMovie);

        if ($recentActivity) {
            return $this->updateExistingActivity($recentActivity, $movie, $additionalMetadata);
        }

        return $this->createNewActivity($userMovie, $movie, $additionalMetadata);
    }

    public function delete(UserMovie $userMovie): void
    {
        UserActivity::where('activity_type', 'movie_watch')
            ->where('subject_type', UserMovie::class)
            ->where('subject_id', $userMovie->id)
            ->delete();
    }

    private function findRecentActivity(UserMovie $userMovie): ?UserActivity
    {
        return UserActivity::where('activity_type', 'movie_watch')
            ->where('subject_type', UserMovie::class)
            ->where('subject_id', $userMovie->id)
            ->where('occurred_at', '>=', now()->subHour())
            ->latest('occurred_at')
            ->first();
    }

    private function createNewActivity(UserMovie $userMovie, ?Movie $movie, ?array $additionalMetadata): UserActivity
    {
        $metadata = [
            'movie_id' => $movie?->id,
            'movie_title' => $movie?->title,
            'poster_path' => $movie?->poster,
            'poster_from' => 'tmdb',
            'movie_link' => "/movie/{$movie?->id}",
        ];

        if ($additionalMetadata) {
            $metadata = array_merge($metadata, $additionalMetadata);
        }

        return UserActivity::create([
            'user_id' => $userMovie->user_id,
            'activity_type' => 'movie_watch',
            'subject_type' => UserMovie::class,
            'subject_id' => $userMovie->id,
            'metadata' => $metadata,
            'description' => $this->generateDescription($movie),
            'occurred_at' => now(),
        ]);
    }

    private function updateExistingActivity(UserActivity $activity, ?Movie $movie, ?array $additionalMetadata): UserActivity
    {
        $metadata = $activity->metadata;

        if ($additionalMetadata) {
            $metadata = array_merge($metadata, $additionalMetadata);
        }

        $activity->update([
            'metadata' => $metadata,
            'description' => $this->generateDescription($movie),
            'occurred_at' => now(),
        ]);

        return $activity;
    }

    private function generateDescription(?Movie $movie): string
    {
        if (!$movie) {
            return 'Watched movie';
        }

        return "Watched {$movie->title}";
    }
}
