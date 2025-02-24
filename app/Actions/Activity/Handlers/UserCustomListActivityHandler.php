<?php

namespace App\Actions\Activity\Handlers;

use App\Models\UserActivity;
use App\Models\UserCustomList\UserCustomList;
use App\Repositories\UserActivityRepository;
use Illuminate\Database\Eloquent\Model;

class UserCustomListActivityHandler implements ActivityHandlerInterface
{
    private UserActivityRepository $activityRepository;

    public function __construct()
    {
        $this->activityRepository = new UserActivityRepository();
    }

    public function canHandle(Model $subject): bool
    {
        return $subject instanceof UserCustomList;
    }

    public function createActivity(int $userId, string $activityType, Model $subject, ?array $metadata = null): UserActivity
    {
        if (!$this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserCustomList models');
        }

        return $this->activityRepository->createCustomListActivity($userId, $activityType, $subject, $metadata);
    }

    public function deleteActivity(Model $subject): void
    {
        if (!$this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserCustomList models');
        }

        $this->activityRepository->deleteByMetadataContains([
            'activity_type' => ['custom_list_created', 'list_item_add'],
        ], 'list_id', $subject->id);
    }
}
