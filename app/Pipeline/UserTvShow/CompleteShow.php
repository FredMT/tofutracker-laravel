<?php

namespace App\Pipeline\UserTvShow;

use App\Enums\WatchStatus;
use App\Models\TvEpisode;
use App\Models\TvSeason;
use App\Models\UserTv\UserTvEpisode;
use App\Models\UserTv\UserTvPlay;
use App\Models\UserTv\UserTvSeason;
use Closure;

class CompleteShow
{
    public function handle(array $payload, Closure $next)
    {
        $show = $payload['tv_show'];
        $user = $payload['user'];
        $userShow = $payload['user_show'];

        // Get all non-special seasons
        $seasons = TvSeason::where('show_id', $show->id)
            ->where('season_number', '>=', 1)
            ->get();

        foreach ($seasons as $season) {
            // Get or create season
            $userSeason = UserTvSeason::firstOrCreate(
                [
                    'user_id' => $user->id,
                    'season_id' => $season->id,
                ],
                [
                    'user_tv_show_id' => $userShow->id,
                    'show_id' => $show->id,
                    'watch_status' => WatchStatus::COMPLETED,
                ]
            );

            // Update season status if not completed
            if ($userSeason->watch_status !== WatchStatus::COMPLETED) {
                $userSeason->update(['watch_status' => WatchStatus::COMPLETED]);
            }

            // Add play record for season if not exists
            UserTvPlay::firstOrCreate([
                'user_id' => $user->id,
                'user_tv_show_id' => $userShow->id,
                'user_tv_season_id' => $userSeason->id,
                'playable_type' => UserTvSeason::class,
                'playable_id' => $userSeason->id,
                'watched_at' => now(),
            ]);

            // Get all episodes for this season
            $episodes = TvEpisode::where('season_id', $season->id)->get();

            // Get existing episodes for this season
            $existingEpisodeIds = UserTvEpisode::where([
                'user_id' => $user->id,
                'season_id' => $season->id,
            ])->pluck('episode_id');

            // Filter out episodes that already exist
            $remainingEpisodes = $episodes->whereNotIn('id', $existingEpisodeIds);

            foreach ($remainingEpisodes as $episode) {
                // Create episode as completed
                $userEpisode = UserTvEpisode::create([
                    'user_id' => $user->id,
                    'user_tv_season_id' => $userSeason->id,
                    'show_id' => $show->id,
                    'season_id' => $season->id,
                    'episode_id' => $episode->id,
                    'watch_status' => WatchStatus::COMPLETED,
                ]);

                // Add play record for episode
                UserTvPlay::create([
                    'user_id' => $user->id,
                    'user_tv_show_id' => $userShow->id,
                    'user_tv_season_id' => $userSeason->id,
                    'user_tv_episode_id' => $userEpisode->id,
                    'playable_type' => UserTvEpisode::class,
                    'playable_id' => $userEpisode->id,
                    'watched_at' => now(),
                ]);
            }

            // Update any existing episodes that aren't completed
            UserTvEpisode::where([
                'user_id' => $user->id,
                'season_id' => $season->id,
            ])
                ->where('watch_status', '!=', WatchStatus::COMPLETED)
                ->update(['watch_status' => WatchStatus::COMPLETED]);
        }

        return $next($payload);
    }
}


// class CompleteShow
// {
//     public function handle(array $payload, Closure $next)
//     {
//         $show = $payload['tv_show'];
//         $user = $payload['user'];
//         $userShow = $payload['user_show'];

//         $seasons = $this->getNonSpecialSeasons($show->id);

//         foreach ($seasons as $season) {
//             $userSeason = $this->markSeasonAsCompleted($user, $userShow, $show, $season);
//             $this->createPlayRecords(
//                 [$userSeason],
//                 UserTvSeason::class,
//                 $user,
//                 $userShow
//             );

//             $this->processEpisodes($user, $userSeason, $show, $season);
//         }

//         return $next($payload);
//     }

//     private function getNonSpecialSeasons(int $showId)
//     {
//         return TvSeason::where('show_id', $showId)
//             ->where(
//                 'season_number',
//                 '>',
//                 0
//             )
//             ->get();
//     }

//     private function markSeasonAsCompleted($user, $userShow, $show, $season)
//     {
//         return UserTvSeason::updateOrCreate(
//             ['user_id' => $user->id, 'season_id' => $season->id],
//             ['user_tv_show_id' => $userShow->id, 'show_id' => $show->id, 'watch_status' => WatchStatus::COMPLETED]
//         );
//     }

//     private function createPlayRecords(
//         array $playables,
//         string $playableType,
//         $user,
//         $userShow
//     ) {
//         $playRecords = [];

//         foreach ($playables as $playable) {
//             $playRecords[] = [
//                 'user_id' => $user->id,
//                 'user_tv_show_id' => $userShow->id,
//                 'user_tv_season_id' => $playable instanceof UserTvSeason ? $playable->id : null,
//                 'user_tv_episode_id' => $playable instanceof UserTvEpisode ? $playable->id : null,
//                 'playable_type' => $playableType,
//                 'playable_id' => $playable->id,
//                 'watched_at' => now(),
//             ];
//         }

//         UserTvPlay::insertOrIgnore($playRecords);
//     }

//     private function processEpisodes($user, $userSeason, $show, $season)
//     {
//         $existingEpisodeIds = $this->getExistingEpisodeIds($user->id, $season->id);
//         $episodes = TvEpisode::where('season_id', $season->id)
//             ->whereNotIn('id', $existingEpisodeIds)
//             ->get();

//         if ($episodes->isNotEmpty()) {
//             $newEpisodes = [];
//             foreach ($episodes as $episode) {
//                 $newEpisodes[] = [
//                     'user_id' => $user->id,
//                     'user_tv_season_id' => $userSeason->id,
//                     'show_id' => $show->id,
//                     'season_id' => $season->id,
//                     'episode_id' => $episode->id,
//                     'watch_status' => WatchStatus::COMPLETED,
//                     'created_at' => now(),
//                     'updated_at' => now(),
//                 ];
//             }
//             UserTvEpisode::insert($newEpisodes);
//             $this->createPlayRecords($newEpisodes, UserTvEpisode::class, $user, $userSeason->user_tv_show);
//         }

//         $this->updateIncompleteEpisodes($user->id, $season->id);
//     }

//     private function getExistingEpisodeIds($userId, $seasonId)
//     {
//         return UserTvEpisode::where(['user_id' => $userId, 'season_id' => $seasonId])
//             ->pluck('episode_id')
//             ->toArray();
//     }

//     private function updateIncompleteEpisodes($userId, $seasonId)
//     {
//         UserTvEpisode::where([
//             'user_id' => $userId,
//             'season_id' => $seasonId,
//         ])
//             ->where('watch_status', '!=', WatchStatus::COMPLETED)
//             ->update(['watch_status' => WatchStatus::COMPLETED, 'updated_at' => now()]);
//     }
// }
