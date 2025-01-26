<?php

namespace App\Pipeline\UserTvSeason;

use App\Actions\Activity\CreateUserActivityAction;
use App\Actions\Tv\Plays\CreateUserTvPlayAction;
use App\Actions\Tv\Plays\CreateUserTvSeasonPlayAction;
use App\Enums\WatchStatus;
use App\Models\TvEpisode;
use App\Models\UserActivity;
use App\Models\UserTv\UserTvEpisode;
use App\Models\UserTv\UserTvPlay;
use Closure;

class UpdateWatchStatus
{
    public function __construct(
        private readonly CreateUserTvPlayAction $createTvPlay,
        private readonly CreateUserTvSeasonPlayAction $createTvSeasonPlay,
        private readonly CreateUserActivityAction $createActivity
    ) {}

    public function __invoke($payload, Closure $next)
    {
        $watchStatus = WatchStatus::from($payload['validated']['watch_status']);
        $userSeason = $payload['user_season'] ?? null;

        // If status is COMPLETED, we need to create all episodes and plays
        if ($watchStatus === WatchStatus::COMPLETED) {
            // Get all episodes for this season
            $episodes = TvEpisode::where([
                'show_id' => $payload['validated']['show_id'],
                'season_id' => $payload['validated']['season_id'],
            ])->get();

            $createdEpisodes = [];
            $episodeIds = [];

            // Find existing episode activity for this season
            $existingActivity = UserActivity::where('activity_type', 'tv_watch')
                ->where('user_id', $payload['user']->id)
                ->whereJsonContains('metadata->user_tv_season_id', $payload['user_season']->id)
                ->where('subject_type', UserTvEpisode::class)
                ->latest('occurred_at')
                ->first();

            $existingEpisodeIds = [];
            if ($existingActivity) {
                $existingEpisodeIds = $existingActivity->metadata['user_tv_episode_ids'] ?? [];
            }

            // Create/update all episodes as completed
            foreach ($episodes as $episode) {
                $userEpisode = UserTvEpisode::updateOrCreate(
                    [
                        'user_id' => $payload['user']->id,
                        'episode_id' => $episode->id,
                    ],
                    [
                        'user_tv_season_id' => $payload['user_season']->id,
                        'show_id' => $payload['validated']['show_id'],
                        'season_id' => $payload['validated']['season_id'],
                        'watch_status' => WatchStatus::COMPLETED,
                    ]
                );

                $createdEpisodes[] = $userEpisode;
                $episodeIds[] = $userEpisode->id;

                // Only create play record if not already watched
                if (! in_array($userEpisode->id, $existingEpisodeIds)) {
                    UserTvPlay::firstOrCreate([
                        'user_id' => $payload['user']->id,
                        'user_tv_show_id' => $payload['show']->id,
                        'user_tv_season_id' => $payload['user_season']->id,
                        'user_tv_episode_id' => $userEpisode->id,
                        'playable_id' => $userEpisode->id,
                        'playable_type' => UserTvEpisode::class,
                    ], [
                        'watched_at' => now(),
                    ]);
                }
            }

            // Update or create episode activity
            if (! empty($createdEpisodes)) {
                $firstEpisode = $createdEpisodes[0];

                if ($existingActivity) {
                    // Update existing activity with all episodes
                    $metadata = $existingActivity->metadata;
                    $metadata['user_tv_episode_ids'] = array_values(array_unique($episodeIds));
                    $metadata['count'] = count($metadata['user_tv_episode_ids']);
                    $metadata['episode_id'] = $firstEpisode->episode_id;

                    $existingActivity->update([
                        'metadata' => $metadata,
                        'description' => "Watched {$metadata['count']} episodes of {$firstEpisode->userTvSeason->show->title} {$firstEpisode->userTvSeason->season->title}",
                        'occurred_at' => now(),
                    ]);
                } else {
                    // Create new activity with all episodes
                    $this->createActivity->execute(
                        userId: $payload['user']->id,
                        activityType: 'tv_watch',
                        subject: $firstEpisode,
                        metadata: [
                            'user_tv_show_id' => $firstEpisode->userTvSeason->user_tv_show_id,
                            'user_tv_season_id' => $firstEpisode->user_tv_season_id,
                            'show_id' => $firstEpisode->show_id,
                            'season_id' => $firstEpisode->season_id,
                            'episode_id' => $firstEpisode->episode_id,
                            'user_tv_episode_ids' => $episodeIds,
                            'count' => count($episodeIds),
                        ]
                    );
                }
                $this->createTvSeasonPlay->execute($payload['user_season']);
            }
        }

        // Update the season's watch status
        $payload['user_season']->update(['watch_status' => $watchStatus]);

        return $next($payload);
    }
}
