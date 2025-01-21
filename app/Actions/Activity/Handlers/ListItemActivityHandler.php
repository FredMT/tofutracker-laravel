<?php

namespace App\Actions\Activity\Handlers;

use App\Models\UserActivity;
use App\Models\UserCustomListItem;
use Illuminate\Database\Eloquent\Model;

class ListItemActivityHandler implements ActivityHandlerInterface
{
    public function canHandle(Model $subject): bool
    {
        return $subject instanceof UserCustomListItem;
    }

    public function createActivity(int $userId, string $activityType, Model $subject, ?array $metadata = null): UserActivity
    {
        if (! $this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserCustomListItem models');
        }

        $recentActivity = $this->findRecentActivity($userId, $subject->custom_list_id);

        if ($recentActivity) {
            return $this->updateActivity($recentActivity, $subject, $metadata);
        }

        return UserActivity::create([
            'user_id' => $userId,
            'activity_type' => $activityType,
            'subject_type' => get_class($subject),
            'subject_id' => $subject->id,
            'metadata' => array_merge($metadata ?? [], [
                'list_id' => $subject->custom_list_id,
                'items' => [
                    [
                        'id' => $subject->listable_id,
                        'type' => $subject->listable_type,
                        'title' => $this->getTitleFromListable($subject),
                    ],
                ],
            ]),
            'description' => $this->generateDescription($subject),
            'occurred_at' => now(),
        ]);
    }

    public function deleteActivity(Model $subject): void
    {
        if (! $this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserCustomListItem models');
        }

        // Find activities that might contain this item
        $activities = UserActivity::where('activity_type', 'list_item_add')
            ->where(function ($query) use ($subject) {
                $query->whereJsonContains('metadata->list_id', $subject->custom_list_id)
                    ->orWhere(function ($q) use ($subject) {
                        $q->where('subject_type', UserCustomListItem::class)
                            ->where('subject_id', $subject->id);
                    });
            })
            ->where('occurred_at', '>=', now()->subHour())
            ->get();

        foreach ($activities as $activity) {
            $metadata = $activity->metadata;
            $items = collect($metadata['items'] ?? []);

            // Check if this item exists in the items array
            $itemExists = $items->contains(function ($item) use ($subject) {
                return $item['id'] == $subject->listable_id && $item['type'] == $subject->listable_type;
            });

            if (! $itemExists) {
                continue;
            }

            // Remove the deleted item from the items array
            $updatedItems = $items->reject(function ($item) use ($subject) {
                return $item['id'] == $subject->listable_id && $item['type'] == $subject->listable_type;
            })->values()->all();

            if (empty($updatedItems)) {
                // If no items left, delete the activity
                $activity->delete();
            } else {
                // Update the activity with the remaining items
                $metadata['items'] = $updatedItems;
                $activity->metadata = $metadata;
                $activity->description = $this->generateBatchDescription($updatedItems, $subject->customList->title);
                $activity->save();
            }
        }
    }

    private function findRecentActivity(int $userId, int $listId): ?UserActivity
    {
        return UserActivity::where('user_id', $userId)
            ->where('activity_type', 'list_item_add')
            ->whereJsonContains('metadata->list_id', $listId)
            ->where('occurred_at', '>=', now()->subHour())
            ->latest('occurred_at')
            ->first();
    }

    private function updateActivity(UserActivity $activity, UserCustomListItem $newItem, ?array $metadata): UserActivity
    {
        $existingMetadata = $activity->metadata;
        $items = $existingMetadata['items'] ?? [];

        // Add new item
        $items[] = [
            'id' => $newItem->listable_id,
            'type' => $newItem->listable_type,
            'title' => $this->getTitleFromListable($newItem),
        ];

        $existingMetadata['items'] = $items;

        $activity->metadata = $existingMetadata;
        $activity->description = $this->generateBatchDescription($items, $newItem->customList->title);
        $activity->save();

        return $activity;
    }

    private function generateDescription(UserCustomListItem $item): string
    {
        $title = $this->getTitleFromListable($item);

        return "Added {$title} to {$item->customList->title}";
    }

    private function generateBatchDescription(array $items, string $listTitle): string
    {
        $count = count($items);

        if ($count === 1) {
            return "Added {$items[0]['title']} to {$listTitle}";
        }

        if ($count === 2) {
            return "Added {$items[0]['title']} and {$items[1]['title']} to {$listTitle}";
        }

        $remainingCount = $count - 2;
        $suffix = $remainingCount === 1 ? 'item' : 'items';

        return "Added {$items[0]['title']}, {$items[1]['title']} and {$remainingCount} more {$suffix} to {$listTitle}";
    }

    private function getTitleFromListable(UserCustomListItem $item): string
    {
        return match ($item->listable_type) {
            'App\Models\Movie' => $item->listable->title ?? 'Unknown Movie',
            'App\Models\TvShow' => $item->listable->title ?? 'Unknown Show',
            'App\Models\TvSeason' => $item->listable->show->title." S{$item->listable->season_number}",
            'App\Models\TvEpisode' => $item->listable->show->title." S{$item->listable->season_number}E{$item->listable->episode_number}",
            'App\Models\AnimeMap' => $item->listable->title ?? 'Unknown Anime Collection',
            'App\Models\AnidbAnime' => $item->listable->title ?? 'Unknown Anime',
            'App\Models\AnimeEpisodeMapping' => $item->listable->anime->title." Episode {$item->listable->episode_number}",
            default => 'Unknown Item'
        };
    }
}
