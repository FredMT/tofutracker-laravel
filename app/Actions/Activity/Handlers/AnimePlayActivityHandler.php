<?php

namespace App\Actions\Activity\Handlers;

use App\Models\AnidbAnime;
use App\Models\UserActivity;
use App\Models\UserAnime;
use Illuminate\Database\Eloquent\Model;

class AnimePlayActivityHandler implements AnimeActivityInterface
{
    public function canHandle(Model $subject): bool
    {
        return $subject instanceof UserAnime;
    }

    public function createActivity(int $userId, string $activityType, Model $subject, ?array $metadata = null): UserActivity
    {
        if (!$this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserAnime models');
        }

        $anime = AnidbAnime::find($subject->anidb_id);
        $metadata = array_merge($metadata ?? [], [
            'map_id' => $anime?->map()
        ]);

        return UserActivity::create([
            'user_id' => $userId,
            'activity_type' => $activityType,
            'subject_type' => get_class($subject),
            'subject_id' => $subject->id,
            'metadata' => $metadata,
            'description' => $this->generateDescription($anime),
            'occurred_at' => now()->addSecond(),
        ]);
    }

    public function deleteActivity(Model $subject): void
    {
        if (!$this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserAnime models');
        }

        UserActivity::where('activity_type', 'anime_watch')
            ->where('subject_type', UserAnime::class)
            ->where('subject_id', $subject->id)
            ->delete();
    }

    private function generateDescription(?AnidbAnime $anime): string
    {
        if (!$anime) {
            return 'Watched anime';
        }

        return "Watched {$anime->title}";
    }

    public function getAnimeTitle(Model $subject): ?string
    {
        if (!$this->canHandle($subject)) {
            return null;
        }

        return AnidbAnime::find($subject->anidb_id)?->title;
    }

    public function getAnimeId(Model $subject): ?int
    {
        if (!$this->canHandle($subject)) {
            return null;
        }

        return $subject->anidb_id;
    }
}
