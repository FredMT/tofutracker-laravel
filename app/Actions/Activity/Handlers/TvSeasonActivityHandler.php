<?php

namespace App\Actions\Activity\Handlers;

use App\Models\TvSeason;
use App\Models\TvShow;
use App\Models\UserActivity;
use App\Models\UserTvSeason;
use Illuminate\Database\Eloquent\Model;

class TvSeasonActivityHandler implements TvActivityInterface
{
    public function canHandle(Model $subject): bool
    {
        return $subject instanceof UserTvSeason;
    }

    public function createActivity(int $userId, string $activityType, Model $subject, ?array $metadata = null): UserActivity
    {
        if (! $this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserTvSeason models');
        }

        $show = TvShow::find($subject->show_id);
        $season = TvSeason::find($subject->season_id);

        $metadata = array_merge($metadata ?? [], [
            'poster_path' => $subject->season->poster,
            'poster_from' => 'tmdb',
            'show_id' => $show?->id,
            'season_id' => $subject->season_id,
            'user_tv_show_id' => $subject->user_tv_show_id,
            'type' => 'tv_season',
            'season_title' => "{$show->title} {$season->title}",
            'season_link' => "/tv/{$show->id}/season/{$season->season_number}",
        ]);

        return UserActivity::create([
            'user_id' => $userId,
            'activity_type' => $activityType,
            'subject_type' => get_class($subject),
            'subject_id' => $subject->id,
            'metadata' => $metadata,
            'description' => $this->generateDescription($show, $season),
            'occurred_at' => now()->addSecond(),
        ]);
    }

    public function deleteActivity(Model $subject): void
    {
        if (! $this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserTvSeason models');
        }

        UserActivity::where('activity_type', 'tv_watch')
            ->where('subject_type', UserTvSeason::class)
            ->where('subject_id', $subject->id)
            ->delete();
    }

    private function generateDescription(?TvShow $show, ?TvSeason $season): string
    {
        if (! $show) {
            return 'Completed TV season';
        }

        $seasonTitle = $season?->title ? " {$season->title}" : '';

        return "Completed {$show->title}{$seasonTitle}";
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
