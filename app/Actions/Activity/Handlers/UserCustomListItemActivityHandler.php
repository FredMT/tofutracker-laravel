<?php

namespace App\Actions\Activity\Handlers;

use App\Models\UserActivity;
use App\Models\UserCustomList\UserCustomListItem;
use App\Repositories\UserActivityRepository;
use Illuminate\Database\Eloquent\Model;

class UserCustomListItemActivityHandler implements ActivityHandlerInterface
{
    private UserActivityRepository $activityRepository;

    public function __construct()
    {
        $this->activityRepository = new UserActivityRepository;
    }

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
            'App\Models\Anime\AnimeMap' => 'anime',
            'App\Models\Anidb\AnidbAnime' => 'anime_season',
            'App\Models\Anime\AnimeEpisodeMapping' => 'anime_episode',
            default => ''
        };
    }

    public function createActivity(int $userId, string $activityType, Model $subject, ?array $metadata = null): UserActivity
    {
        if (! $this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserCustomListItem models');
        }

        $recentActivity = $this->activityRepository->findRecentActivityByType(
            $userId,
            'list_item_add',
            UserCustomListItem::class,
            null,
            [['metadata->list_id', $subject->custom_list_id]]
        );

        if ($recentActivity) {
            return $this->updateActivity($recentActivity, $subject, $metadata);
        }

        return $this->createNewActivity($userId, $activityType, $subject, $metadata);
    }

    public function deleteActivity(Model $subject): void
    {
        if (! $this->canHandle($subject)) {
            throw new \InvalidArgumentException('This handler only supports UserCustomListItem models');
        }

        $this->activityRepository->deleteCustomListItemActivity($subject);
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

        return $this->activityRepository->updateActivity($activity, [
            'metadata' => $existingMetadata,
            'description' => $this->generateBatchDescription($items, $newItem->customList->title),
        ]);
    }

    private function createNewActivity(int $userId, string $activityType, UserCustomListItem $item, ?array $metadata): UserActivity
    {
        $metadata = array_merge($metadata ?? [], [
            'list_id' => $item->custom_list_id,
            'list_title' => $item->customList->title,
            'items' => [
                [
                    'id' => $item->listable_id,
                    'type' => $this->getItemType($item->listable),
                    'title' => $this->getTitleFromListable($item),
                    'link' => $this->generateItemLink($item->listable),
                    'poster_path' => $item->listable->poster ?? null,
                    'poster_type' => $this->getPosterType($item->listable_type),
                ],
            ],
        ]);

        return $this->activityRepository->create([
            'user_id' => $userId,
            'activity_type' => $activityType,
            'subject_type' => get_class($item),
            'subject_id' => $item->id,
            'metadata' => $metadata,
            'description' => $this->generateDescription($item),
            'occurred_at' => now(),
        ]);
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
            'App\Models\Anime\AnimeMap' => $item->listable->title ?? 'Unknown Anime Collection',
            'App\Models\Anidb\AnidbAnime' => $item->listable->title ?? 'Unknown Anime',
            'App\Models\Anime\AnimeEpisodeMapping' => $item->listable->anime->title." Episode {$item->listable->episode_number}",
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
            'App\Models\Anime\AnimeMap' => "/anime/{$item->id}",
            'App\Models\Anidb\AnidbAnime' => "/anime/{$item->map()}/season/{$item->id}",
            'App\Models\Anime\AnimeEpisodeMapping' => "/anime/{$item->anime->map()}/season/{$item->anime->id}",
            default => ''
        };
    }

    private function getPosterType(string $type): string
    {
        return match ($type) {
            'App\Models\Movie', 'App\Models\TvShow', 'App\Models\TvSeason', 'App\Models\TvEpisode', 'App\Models\Anime\AnimeMap' => 'tmdb',
            'App\Models\Anidb\AnidbAnime' => 'anidb',
            'App\Models\Anime\AnimeEpisodeMapping' => 'tvdb',
            default => ''
        };
    }
}
