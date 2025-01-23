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

    private function getItemType(Model $item): string
    {
        return match (get_class($item)) {
            'App\Models\Movie' => 'movie',
            'App\Models\TvShow' => 'tv_show',
            'App\Models\TvSeason' => 'tv_season',
            'App\Models\TvEpisode' => 'tv_episode',
            'App\Models\AnimeMap' => 'anime',
            'App\Models\AnidbAnime' => 'anime_season',
            'App\Models\AnimeEpisodeMapping' => 'anime_episode',
            default => ''
        };
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
                'list_title' => $subject->customList->title,
                'items' => [
                    [
                        'id' => $subject->listable_id,
                        'type' => $this->getItemType($subject->listable),
                        'title' => $this->getTitleFromListable($subject),
                        'link' => $this->generateItemLink($subject->listable),
                        'poster_path' => $subject->listable->poster ?? null,
                        'poster_type' => $this->getPosterType($subject->listable_type),
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

        if (!$subject->relationLoaded('listable')) {
            $subject->load('listable');
        }

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

            $itemExists = $items->contains(function ($item) use ($subject) {
                return $item['id'] == $subject->listable_id && $item['type'] == $this->getItemType($subject->listable);
            });

            if (! $itemExists) {
                continue;
            }

            $updatedItems = $items->reject(function ($item) use ($subject) {
                return $item['id'] == $subject->listable_id && $item['type'] == $this->getItemType($subject->listable);
            })->values()->all();

            if (empty($updatedItems)) {
                $activity->delete();
            } else {
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

        $items[] = [
            'id' => $newItem->listable_id,
            'type' => $this->getItemType($newItem->listable),
            'title' => $this->getTitleFromListable($newItem),
            'link' => $this->generateItemLink($newItem->listable),
            'poster_path' => $newItem->listable->poster ?? null,
            'poster_type' => $this->getPosterType($newItem->listable_type),
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
            'App\Models\TvSeason' => $item->listable->show->title . " S{$item->listable->season_number}",
            'App\Models\TvEpisode' => $item->listable->show->title . " S{$item->listable->season_number}E{$item->listable->episode_number}",
            'App\Models\AnimeMap' => $item->listable->title ?? 'Unknown Anime Collection',
            'App\Models\AnidbAnime' => $item->listable->title ?? 'Unknown Anime',
            'App\Models\AnimeEpisodeMapping' => $item->listable->anime->title . " Episode {$item->listable->episode_number}",
            default => 'Unknown Item'
        };
    }

    private function generateItemLink(Model $item): string
    {
        return match (get_class($item)) {
            'App\Models\Movie' => "/movie/{$item->id}",
            'App\Models\TvShow' => "/tv/{$item->id}",
            'App\Models\TvSeason' => "/tv/{$item->show->id}/season/{$item->season_number}",
            'App\Models\TvEpisode' => "/tv/{$item->show->id}/season/{$item->season_number}",
            'App\Models\AnimeMap' => "/anime/{$item->id}",
            'App\Models\AnidbAnime' => "/anime/{$item->map()}/season/{$item->id}",
            'App\Models\AnimeEpisodeMapping' => "/anime/{$item->anime->map()}/season/{$item->anime->id}",
            default => ''
        };
    }

    private function getPosterType(string $type): string
    {
        return match ($type) {
            'App\Models\Movie', 'App\Models\TvShow', 'App\Models\TvSeason', 'App\Models\TvEpisode', 'App\Models\AnimeMap' => 'tmdb',
            'App\Models\AnidbAnime' => 'anidb',
            'App\Models\AnimeEpisodeMapping' => 'tvdb',
            default => ''
        };
    }
}
