<?php

namespace App\Actions\Activity;

use App\Models\TvShow;
use App\Models\UserActivity;
use App\Models\UserTv\UserTvShow;

class ManageTvShowWatchActivityAction
{
    public function execute(UserTvShow $userShow, ?array $additionalMetadata = null): UserActivity
    {
        $show = TvShow::find($userShow->show_id);

        if (! $show) {
            throw new \Exception('Show not found');
        }

        $metadata = array_merge($additionalMetadata ?? [], [
            'poster_path' => $show?->poster,
            'poster_from' => 'tmdb',
            'show_id' => $show?->id,
            'user_tv_show_id' => $userShow->id,
            'type' => 'tv_show',
            'show_title' => $show->title,
            'show_link' => "/tv/{$show->id}",
        ]);

        return UserActivity::create([
            'user_id' => $userShow->user_id,
            'activity_type' => 'tv_watch',
            'subject_type' => UserTvShow::class,
            'subject_id' => $userShow->id,
            'metadata' => $metadata,
            'description' => $this->generateDescription($show),
            'occurred_at' => now()->addSeconds(2),
        ]);
    }

    public function delete(UserTvShow $userShow): void
    {
        UserActivity::where('activity_type', 'tv_watch')
            ->where('subject_type', UserTvShow::class)
            ->where('subject_id', $userShow->id)
            ->delete();
    }

    private function generateDescription(?TvShow $show): string
    {
        return $show ? "Completed {$show->title}" : 'Completed TV show';
    }
}
