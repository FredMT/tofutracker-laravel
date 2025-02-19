<?php

namespace App\Actions\Activity;

use App\Models\TvSeason;
use App\Models\TvShow;
use App\Models\UserActivity;
use App\Models\UserTv\UserTvSeason;

class ManageTvSeasonWatchActivityAction
{
    public function execute(UserTvSeason $userSeason, ?array $additionalMetadata = null): UserActivity
    {
        $show = TvShow::find($userSeason->show_id);
        $season = TvSeason::find($userSeason->season_id);

        if (!$show || !$season) {
            throw new \Exception('Show or season not found');
        }

        $metadata = array_merge($additionalMetadata ?? [], [
            'poster_path' => $season->poster,
            'poster_from' => 'tmdb',
            'show_id' => $show->id,
            'season_id' => $season->id,
            'user_tv_show_id' => $userSeason->user_tv_show_id,
            'type' => 'tv_season',
            'season_title' => "{$show->title} {$season->title}",
            'season_link' => "/tv/{$show->id}/season/{$season->season_number}",
        ]);

        return UserActivity::create([
            'user_id' => $userSeason->user_id,
            'activity_type' => 'tv_watch',
            'subject_type' => UserTvSeason::class,
            'subject_id' => $userSeason->id,
            'metadata' => $metadata,
            'description' => $this->generateDescription($show, $season),
            'occurred_at' => now()->addSecond(),
        ]);
    }

    public function delete(UserTvSeason $userSeason): void
    {
        UserActivity::where('activity_type', 'tv_watch')
            ->where('user_id', $userSeason->user_id)
            ->where(function ($query) use ($userSeason) {
                $query->whereJsonContains('metadata->user_tv_season_id', $userSeason->id)
                    ->orWhere(function ($q) use ($userSeason) {
                        $q->where('subject_type', UserTvSeason::class)
                            ->where('subject_id', $userSeason->id);
                    });
            })
            ->delete();
    }

    private function generateDescription(?TvShow $show, ?TvSeason $season): string
    {
        if (!$show) {
            return 'Completed TV season';
        }

        $seasonTitle = $season?->title ? " {$season->title}" : '';
        return "Completed {$show->title}{$seasonTitle}";
    }
}
