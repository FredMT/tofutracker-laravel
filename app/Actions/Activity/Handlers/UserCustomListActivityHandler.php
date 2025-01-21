<?php

namespace App\Actions\Activity\Handlers;

use App\Models\UserActivity;
use App\Models\UserCustomList;
use Illuminate\Database\Eloquent\Model;

class UserCustomListActivityHandler implements ActivityHandlerInterface
{
    public function canHandle(Model $subject): bool
    {
        return $subject instanceof UserCustomList;
    }

    public function createActivity(int $userId, string $activityType, Model $subject, ?array $metadata = null): UserActivity
    {
        $description = match ($activityType) {
            'custom_list_created' => "Created a new list: {$subject->title}",
            'custom_list_deleted' => "Deleted list: {$subject->title}",
            default => "List activity: {$subject->title}"
        };

        return UserActivity::create([
            'user_id' => $userId,
            'activity_type' => $activityType,
            'subject_type' => UserCustomList::class,
            'subject_id' => $subject->id,
            'description' => $description,
            'metadata' => array_merge($metadata ?? [], [
                'list_id' => $subject->id,
                'list_title' => $subject->title,
            ]),
            'occurred_at' => now(),
        ]);
    }

    public function deleteActivity(Model $subject): void
    {
        UserActivity::where(function ($query) use ($subject) {
            $query->where(function ($q) use ($subject) {
                $q->where('subject_type', UserCustomList::class)
                    ->where('subject_id', $subject->id);
            })->orWhere(function ($q) use ($subject) {
                $q->whereJsonContains('metadata->list_id', $subject->id);
            });
        })->delete();
    }
}
