<?php

namespace App\Actions\Activity\Handlers;

use App\Models\TvShow;
use App\Models\UserActivity;
use App\Models\UserTvShow;
use Illuminate\Database\Eloquent\Model;

class TvShowActivityHandler implements TvShowActivityInterface
{
    public function canHandle(Model $subject): bool
    {
        return $subject instanceof UserTvShow;
    }

    public function createActivity(int $userId, string $activityType, Model $subject, ?array $metadata = null): UserActivity
    {
        if (!$this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserTvShow models');
        }

        $show = TvShow::find($subject->show_id);

        $metadata = array_merge($metadata ?? [], [
            'show_id' => $show?->id,
            'user_tv_show_id' => $subject->id,
        ]);

        return UserActivity::create([
            'user_id' => $userId,
            'activity_type' => $activityType,
            'subject_type' => get_class($subject),
            'subject_id' => $subject->id,
            'metadata' => $metadata,
            'description' => $this->generateDescription($show),
            'occurred_at' => now(),
        ]);
    }

    public function deleteActivity(Model $subject): void
    {
        if (!$this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserTvShow models');
        }

        UserActivity::where('activity_type', 'tv_watch')
            ->where('subject_type', UserTvShow::class)
            ->where('subject_id', $subject->id)
            ->delete();
    }

    private function generateDescription(?TvShow $show): string
    {
        if (!$show) {
            return 'Completed TV show';
        }

        return "Completed {$show->title}";
    }

    public function getTvShowTitle(Model $subject): ?string
    {
        if (!$this->canHandle($subject)) {
            return null;
        }

        return TvShow::find($subject->show_id)?->title;
    }

    public function getTvShowId(Model $subject): ?int
    {
        if (!$this->canHandle($subject)) {
            return null;
        }

        return $subject->show_id;
    }
}
