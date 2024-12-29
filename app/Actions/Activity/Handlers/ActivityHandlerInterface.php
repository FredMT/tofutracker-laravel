<?php

namespace App\Actions\Activity\Handlers;

use App\Models\UserActivity;
use Illuminate\Database\Eloquent\Model;

interface ActivityHandlerInterface
{
    public function canHandle(Model $subject): bool;

    public function createActivity(int $userId, string $activityType, Model $subject, ?array $metadata = null): UserActivity;

    public function deleteActivity(Model $subject): void;
}
