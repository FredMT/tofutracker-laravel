<?php

namespace App\Actions\UserController\Tv\TvShow;

use App\Actions\Activity\ManageTvShowWatchActivityAction;
use App\Actions\Tv\Plays\CreateUserTvShowPlayAction;
use App\Enums\WatchStatus;
use App\Models\User;
use App\Models\UserTv\UserTvShow;
use App\Pipeline\Shared\MediaLibraryPipeline;
use App\Pipeline\UserTvShow\CompleteShow;
use App\Pipeline\UserTvShow\CreateUserTvShowWithStatus;
use App\Pipeline\UserTvShow\EnsureShowExists;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Pipeline;

class UpdateStatusUserTvShowAction
{
    public function __construct(
        private readonly CreateUserTvShowPlayAction $createTvShowPlay,
        private readonly ManageTvShowWatchActivityAction $manageActivity
    ) {}

    public function execute(User $user, array $validated): array
    {
        return DB::transaction(function () use ($user, $validated) {
            $userShow = UserTvShow::where([
                'user_id' => $user->id,
                'show_id' => $validated['show_id'],
            ])->first();

            if (Gate::denies('update-tv-show-status', $userShow)) {
                throw new \Illuminate\Auth\Access\AuthorizationException('You do not own this TV show.');
            }

            $watchStatus = WatchStatus::from($validated['watch_status']);

            if ($userShow) {
                return $this->updateExistingShow($userShow, $watchStatus);
            }

            return $this->createNewShow($user, $validated, $watchStatus);
        });
    }

    private function updateExistingShow(UserTvShow $userShow, WatchStatus $watchStatus): array
    {
        // Prevent updating to same status
        if ($userShow->watch_status === $watchStatus) {
            return [
                'success' => false,
                'message' => "Show already has watch status of {$watchStatus->value}",
            ];
        }

        if ($watchStatus === WatchStatus::COMPLETED) {
            $userShow->update(['watch_status' => $watchStatus]);
            $this->createTvShowPlay->execute($userShow);
            $this->manageActivity->execute($userShow);

            return [
                'success' => true,
                'message' => 'Show marked as completed',
            ];
        }

        $userShow->update(['watch_status' => $watchStatus]);

        return [
            'success' => true,
            'message' => 'Show watch status updated',
        ];
    }

    private function createNewShow(User $user, array $validated, WatchStatus $watchStatus): array
    {
        if ($watchStatus === WatchStatus::COMPLETED) {
            $result = Pipeline::send([
                'user' => $user,
                'validated' => $validated,
            ])
                ->through([
                    MediaLibraryPipeline::tv(),
                    EnsureShowExists::class,
                    CreateUserTvShowWithStatus::class,
                    CompleteShow::class,
                ])
                ->thenReturn();

            $this->createTvShowPlay->execute($result['user_show']);
            $this->manageActivity->execute($result['user_show']);

            return [
                'success' => true,
                'message' => "Show '{$result['show_title']}' added and marked as completed",
            ];
        }

        // For other statuses, just create the show
        $result = Pipeline::send([
            'user' => $user,
            'validated' => $validated,
        ])
            ->through([
                MediaLibraryPipeline::tv(),
                EnsureShowExists::class,
                CreateUserTvShowWithStatus::class,
            ])
            ->thenReturn();

        return [
            'success' => true,
            'message' => "Show '{$result['show_title']}' added with status {$result['watch_status']->value}",
        ];
    }
}
