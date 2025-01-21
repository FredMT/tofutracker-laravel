<?php

namespace App\Actions\Activity\Handlers;

use App\Models\Movie;
use App\Models\UserActivity;
use App\Models\UserMovie;
use Illuminate\Database\Eloquent\Model;

class MoviePlayActivityHandler implements MovieActivityInterface
{
    public function canHandle(Model $subject): bool
    {
        return $subject instanceof UserMovie;
    }

    public function createActivity(int $userId, string $activityType, Model $subject, ?array $metadata = null): UserActivity
    {
        if (! $this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserMovie models');
        }

        $movie = Movie::find($subject->movie_id);
        $metadata = array_merge($metadata ?? [], [
            'movie_id' => $movie?->id,
            'movie_title' => $movie?->title,
            'poster_path' => $movie?->poster,
            'poster_from' => 'tmdb',
            'movie_link' => "/movie/{$movie?->id}",
        ]);

        return UserActivity::create([
            'user_id' => $userId,
            'activity_type' => $activityType,
            'subject_type' => get_class($subject),
            'subject_id' => $subject->id,
            'metadata' => $metadata,
            'description' => $this->generateDescription($movie),
            'occurred_at' => now(),
        ]);
    }

    public function deleteActivity(Model $subject): void
    {
        if (! $this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserMovie models');
        }

        UserActivity::where('activity_type', 'movie_watch')
            ->where('subject_type', UserMovie::class)
            ->where('subject_id', $subject->id)
            ->delete();
    }

    private function generateDescription(?Movie $movie): string
    {
        if (! $movie) {
            return 'Watched movie';
        }

        return "Watched {$movie->title}";
    }

    public function getMovieTitle(Model $subject): ?string
    {
        if (! $this->canHandle($subject)) {
            return null;
        }

        return Movie::find($subject->movie_id)?->title;
    }

    public function getMovieId(Model $subject): ?int
    {
        if (! $this->canHandle($subject)) {
            return null;
        }

        return $subject->movie_id;
    }
}
