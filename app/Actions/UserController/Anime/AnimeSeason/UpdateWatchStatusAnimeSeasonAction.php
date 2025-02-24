<?php

namespace App\Actions\UserController\Anime\AnimeSeason;

use App\Models\UserAnime\UserAnime;
use App\Pipeline\Shared\MediaLibraryPipeline;
use App\Pipeline\UserAnimeSeason\CreateUserAnimeSeasonEpisodes;
use App\Pipeline\UserAnimeSeason\CreateUserAnimeSeasonWatchStatusCollection;
use App\Pipeline\UserAnimeSeason\UpdateUserAnimeCollectionWatchStatus;
use App\Pipeline\UserAnimeSeason\UpdateUserAnimeSeasonWatchStatus;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Pipeline;

class UpdateWatchStatusAnimeSeasonAction
{
    public function execute(array $validated, $user)
    {
        return DB::transaction(function () use ($validated, $user) {
            // Find existing season
            $season = UserAnime::where('anidb_id', $validated['anidb_id'])
                ->whereHas('collection.userLibrary', function ($query) use ($user) {
                    $query->where('user_id', $user->id);
                })
                ->first();

            // Check authorization for existing or new season
            if ($season) {
                if (Gate::denies('update-anime', $season)) {
                    throw new AuthorizationException('You do not own this anime season.');
                }
            }

            if (Gate::denies('update-anime', null)) {
                throw new AuthorizationException('You are not authorized to update this anime season.');
            }

            // Use pipeline to handle all operations
            return Pipeline::send([
                'user' => $user,
                'validated' => $validated,
                'season' => $season,
            ])
                ->through([
                    MediaLibraryPipeline::anime(),
                    CreateUserAnimeSeasonWatchStatusCollection::class,
                    UpdateUserAnimeSeasonWatchStatus::class,
                    CreateUserAnimeSeasonEpisodes::class,
                    UpdateUserAnimeCollectionWatchStatus::class,
                ])
                ->then(function () {
                    return [
                        'success' => true,
                        'message' => 'Anime season watch status updated.',
                    ];
                });
        });
    }
}
