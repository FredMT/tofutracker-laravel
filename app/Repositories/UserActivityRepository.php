<?php

namespace App\Repositories;

use App\Models\UserActivity;
use App\Models\Movie;
use App\Models\TvShow;
use App\Models\TvSeason;
use App\Models\Anidb\AnidbAnime;
use App\Models\UserAnime\UserAnime;
use App\Models\UserAnime\UserAnimeEpisode;
use App\Models\UserAnime\UserAnimeCollection;
use App\Models\UserCustomList\UserCustomList;
use App\Models\UserCustomList\UserCustomListItem;
use App\Models\UserMovie\UserMovie;
use App\Models\UserTv\UserTvEpisode;
use App\Models\UserTv\UserTvSeason;
use App\Models\UserTv\UserTvShow;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class UserActivityRepository
{
    public function create(array $attributes): UserActivity
    {
        return UserActivity::create($attributes);
    }

    public function findRecentActivityByType(
        int $userId,
        string $activityType,
        string $subjectType,
        ?int $subjectId = null,
        ?array $additionalConditions = []
    ): ?UserActivity {
        $query = UserActivity::where('user_id', $userId)
            ->where('activity_type', $activityType)
            ->where('subject_type', $subjectType)
            ->where('occurred_at', '>=', now()->subHour())
            ->latest('occurred_at');

        if ($subjectId) {
            $query->where('subject_id', $subjectId);
        }

        foreach ($additionalConditions as $condition) {
            $query->where(...$condition);
        }

        return $query->first();
    }

    public function findRecentBatchByMetadata(int $userId, string $metadataKey, $metadataValue): ?UserActivity
    {
        return UserActivity::where('user_id', $userId)
            ->where('activity_type', 'anime_watch')
            ->whereJsonContains("metadata->{$metadataKey}", $metadataValue)
            ->where('occurred_at', '>=', now()->subHour())
            ->latest('occurred_at')
            ->first();
    }

    public function deleteByConditions(array $conditions): void
    {
        UserActivity::where($conditions)->delete();
    }

    public function deleteByMetadataContains(array $conditions, string $metadataKey, $metadataValue): void
    {
        $query = UserActivity::query();

        // Handle activity_type specially if it exists in conditions
        if (isset($conditions['activity_type'])) {
            $activityType = $conditions['activity_type'];
            unset($conditions['activity_type']);

            if (is_array($activityType)) {
                $query->whereIn('activity_type', $activityType);
            } else {
                $query->where('activity_type', $activityType);
            }
        }

        // Apply remaining conditions
        $query->where($conditions)
            ->whereJsonContains("metadata->{$metadataKey}", $metadataValue)
            ->delete();
    }

    public function updateActivity(UserActivity $activity, array $attributes): UserActivity
    {
        $activity->update($attributes);
        return $activity;
    }

    public function createCustomListActivity(
        int $userId,
        string $activityType,
        UserCustomList $list,
        ?array $metadata = null
    ): UserActivity {
        $description = match ($activityType) {
            'custom_list_created' => "Created a new list: {$list->title}",
            default => "List activity: {$list->title}"
        };

        return $this->create([
            'user_id' => $userId,
            'activity_type' => $activityType,
            'subject_type' => UserCustomList::class,
            'subject_id' => $list->id,
            'description' => $description,
            'metadata' => array_merge($metadata ?? [], [
                'list_id' => $list->id,
                'list_title' => $list->title,
            ]),
            'occurred_at' => now(),
        ]);
    }

    public function createMovieWatchActivity(
        UserMovie $userMovie,
        ?Movie $movie,
        ?array $additionalMetadata = null
    ): UserActivity {
        $metadata = [
            'movie_id' => $movie?->id,
            'movie_title' => $movie?->title,
            'poster_path' => $movie?->poster,
            'poster_from' => 'tmdb',
            'movie_link' => "/movie/{$movie?->id}",
        ];

        if ($additionalMetadata) {
            $metadata = array_merge($metadata, $additionalMetadata);
        }

        return $this->create([
            'user_id' => $userMovie->user_id,
            'activity_type' => 'movie_watch',
            'subject_type' => UserMovie::class,
            'subject_id' => $userMovie->id,
            'metadata' => $metadata,
            'description' => $movie ? "Watched {$movie->title}" : 'Watched movie',
            'occurred_at' => now(),
        ]);
    }

    public function createTvShowWatchActivity(
        UserTvShow $userShow,
        ?TvShow $show,
        ?array $additionalMetadata = null
    ): UserActivity {
        $metadata = array_merge($additionalMetadata ?? [], [
            'poster_path' => $show?->poster,
            'poster_from' => 'tmdb',
            'show_id' => $show?->id,
            'user_tv_show_id' => $userShow->id,
            'type' => 'tv_show',
            'show_title' => $show?->title,
            'show_link' => "/tv/{$show?->id}",
        ]);

        return $this->create([
            'user_id' => $userShow->user_id,
            'activity_type' => 'tv_watch',
            'subject_type' => UserTvShow::class,
            'subject_id' => $userShow->id,
            'metadata' => $metadata,
            'description' => $show ? "Completed {$show->title}" : 'Completed TV show',
            'occurred_at' => now()->addSeconds(2),
        ]);
    }

    public function createTvSeasonWatchActivity(
        UserTvSeason $userSeason,
        ?TvShow $show,
        ?TvSeason $season,
        ?array $additionalMetadata = null
    ): UserActivity {
        $metadata = array_merge($additionalMetadata ?? [], [
            'poster_path' => $season?->poster,
            'poster_from' => 'tmdb',
            'show_id' => $show?->id,
            'season_id' => $season?->id,
            'user_tv_show_id' => $userSeason->user_tv_show_id,
            'user_tv_season_id' => $userSeason->id,
            'type' => 'tv_season',
            'season_title' => $show && $season ? "{$show->title} {$season->title}" : '',
            'season_link' => $show && $season ? "/tv/{$show->id}/season/{$season->season_number}" : '',
        ]);

        $description = $show
            ? "Completed {$show->title}" . ($season?->title ? " {$season->title}" : '')
            : 'Completed TV season';

        return $this->create([
            'user_id' => $userSeason->user_id,
            'activity_type' => 'tv_watch',
            'subject_type' => UserTvSeason::class,
            'subject_id' => $userSeason->id,
            'metadata' => $metadata,
            'description' => $description,
            'occurred_at' => now()->addSecond(),
        ]);
    }

    public function createTvEpisodeWatchActivity(
        UserTvEpisode $userEpisode,
        ?TvShow $show,
        ?TvSeason $season,
        ?array $additionalMetadata = null
    ): UserActivity {
        $episodeIds = $additionalMetadata['user_tv_episode_ids'] ?? [$userEpisode->id];
        $count = $additionalMetadata['count'] ?? 1;

        $seasonTitle = $additionalMetadata['season_title']
            ?? ($show && $season ? "{$show->title} {$season->title}" : '');
        $seasonLink = $additionalMetadata['season_link']
            ?? ($show && $season ? "/tv/{$show->id}/season/{$season->season_number}" : '');

        $defaultMetadata = [
            'poster_path' => $userEpisode->episode->poster,
            'poster_from' => 'tmdb',
            'user_tv_show_id' => $userEpisode->userTvSeason->user_tv_show_id,
            'user_tv_season_id' => $userEpisode->user_tv_season_id,
            'show_id' => $show?->id,
            'season_id' => $userEpisode->season_id,
            'episode_id' => $userEpisode->episode_id,
            'user_tv_episode_ids' => $episodeIds,
            'count' => $count,
            'season_title' => $seasonTitle,
            'season_link' => $seasonLink,
            'type' => 'tv_episode',
        ];

        $metadata = array_merge($defaultMetadata, $additionalMetadata ?? []);
        $description = $this->generateTvEpisodeDescription($show, $season, $count);

        return $this->create([
            'user_id' => $userEpisode->user_id,
            'activity_type' => 'tv_watch',
            'subject_type' => UserTvEpisode::class,
            'subject_id' => $userEpisode->id,
            'metadata' => $metadata,
            'description' => $description,
            'occurred_at' => now(),
        ]);
    }

    public function createAnimeWatchActivity(
        int $userId,
        Model $subject,
        ?array $metadata = null
    ): UserActivity {
        if ($subject instanceof UserAnimeEpisode) {
            return $this->createAnimeEpisodeActivity($userId, $subject, $metadata);
        }

        if ($subject instanceof UserAnime) {
            return $this->createAnimeSeasonActivity($userId, $subject, $metadata);
        }

        throw new \InvalidArgumentException('Subject must be either UserAnimeEpisode or UserAnime');
    }

    private function createAnimeEpisodeActivity(
        int $userId,
        UserAnimeEpisode $episode,
        ?array $metadata = null
    ): UserActivity {
        $anime = AnidbAnime::find($episode->userAnime->anidb_id);
        $metadata = array_merge($metadata ?? [], [
            'user_anime_episode_ids' => [$episode->id],
            'count' => 1,
            'anidb_id' => $episode->userAnime->anidb_id,
            'poster_path' => $episode->episode->poster ?? $anime?->poster,
            'poster_from' => $episode->episode->poster ? 'tvdb' : 'anidb',
            'map_id' => $anime?->map(),
            'anime_title' => $anime?->title,
            'anime_link' => $anime ? "/anime/{$anime->map()}/season/{$anime->id}" : null,
            'type' => 'anime_episode',
        ]);

        return $this->create([
            'user_id' => $userId,
            'activity_type' => 'anime_watch',
            'subject_type' => UserAnimeEpisode::class,
            'subject_id' => $episode->id,
            'metadata' => $metadata,
            'description' => $this->generateAnimeEpisodeDescription($metadata),
            'occurred_at' => now(),
        ]);
    }

    private function createAnimeSeasonActivity(
        int $userId,
        UserAnime $userAnime,
        ?array $metadata = null
    ): UserActivity {
        $anime = AnidbAnime::find($userAnime->anidb_id);
        $metadata = array_merge($metadata ?? [], [
            'user_anime_id' => $userAnime->id,
            'anidb_id' => $userAnime->anidb_id,
            'map_id' => $anime?->map(),
            'is_movie' => $userAnime->is_movie,
            'poster_path' => $anime?->poster,
            'poster_from' => 'anidb',
            'anime_title' => $anime?->title,
            'anime_link' => $anime ? "/anime/{$anime->map()}/season/{$anime->id}" : null,
            'type' => 'anime_season',
        ]);

        return $this->create([
            'user_id' => $userId,
            'activity_type' => 'anime_watch',
            'subject_type' => UserAnime::class,
            'subject_id' => $userAnime->id,
            'metadata' => $metadata,
            'description' => $anime ? "Watched {$anime->title}" : 'Watched anime',
            'occurred_at' => now()->addSecond(),
        ]);
    }

    private function generateTvEpisodeDescription(?TvShow $show, ?TvSeason $season, int $count): string
    {
        if (!$show) {
            return 'Watched TV episode';
        }

        $seasonTitle = $season?->title ? " {$season->title}" : '';
        $episodeText = $count === 1 ? '1 episode' : "{$count} episodes";

        return "Watched {$episodeText} of {$show->title}{$seasonTitle}";
    }

    private function generateAnimeEpisodeDescription(array $metadata): string
    {
        if (!isset($metadata['anidb_id'])) {
            return 'Watched anime';
        }

        try {
            $anime = AnidbAnime::find($metadata['anidb_id']);
            if (!$anime) {
                return 'Watched anime';
            }

            $count = $metadata['count'] ?? 1;

            return 'Watched ' .
                ($count === 1 ? '1 episode' : "{$count} episodes") .
                " of {$anime->title}";
        } catch (\Exception $e) {
            return 'Watched anime';
        }
    }

    public function updateBatchEpisodeActivity(UserActivity $activity, UserAnimeEpisode $episode): UserActivity
    {
        $metadata = $activity->metadata ?? [];
        $episodeIds = $metadata['user_anime_episode_ids'] ?? [];
        $episodeIds[] = $episode->id;

        $metadata['user_anime_episode_ids'] = array_unique($episodeIds);
        $metadata['count'] = count($metadata['user_anime_episode_ids']);

        return $this->updateActivity($activity, [
            'metadata' => $metadata,
            'description' => $this->generateAnimeEpisodeDescription($metadata),
            'occurred_at' => now(),
        ]);
    }

    public function updateTvEpisodeActivity(
        UserActivity $activity,
        UserTvEpisode $userEpisode,
        ?TvShow $show,
        ?TvSeason $season
    ): UserActivity {
        $metadata = $activity->metadata;
        $episodeIds = $metadata['user_tv_episode_ids'] ?? [];
        $episodeIds[] = $userEpisode->id;
        $metadata['user_tv_episode_ids'] = array_values(array_unique($episodeIds));
        $metadata['count'] = count($metadata['user_tv_episode_ids']);
        $metadata['episode_id'] = $userEpisode->episode_id;

        return $this->updateActivity($activity, [
            'metadata' => $metadata,
            'description' => $this->generateTvEpisodeDescription($show, $season, $metadata['count']),
            'occurred_at' => now(),
        ]);
    }

    public function deleteAnimeEpisodeActivity(UserAnimeEpisode $episode): void
    {
        UserActivity::where('activity_type', 'anime_watch')
            ->where('user_id', $episode->load('user')->user->id)
            ->whereJsonContains('metadata->user_anime_episode_ids', $episode->id)
            ->each(function ($activity) use ($episode) {
                $metadata = $activity->metadata;
                $metadata['user_anime_episode_ids'] = array_values(
                    array_filter(
                        $metadata['user_anime_episode_ids'] ?? [],
                        fn($id) => $id !== $episode->id
                    )
                );
                $metadata['count'] = count($metadata['user_anime_episode_ids']);

                if ($metadata['count'] === 0) {
                    $activity->delete();
                } else {
                    $activity->update([
                        'metadata' => $metadata,
                        'description' => $this->generateAnimeEpisodeDescription($metadata),
                    ]);
                }
            });
    }

    public function deleteTvEpisodeActivity(UserTvEpisode $userEpisode): void
    {
        UserActivity::where('activity_type', 'tv_watch')
            ->where('user_id', $userEpisode->user_id)
            ->whereJsonContains('metadata->user_tv_episode_ids', $userEpisode->id)
            ->each(function ($activity) use ($userEpisode) {
                $metadata = $activity->metadata;
                $metadata['user_tv_episode_ids'] = array_values(
                    array_filter(
                        $metadata['user_tv_episode_ids'] ?? [],
                        fn($id) => $id !== $userEpisode->id
                    )
                );
                $metadata['count'] = count($metadata['user_tv_episode_ids']);

                if ($metadata['count'] === 0) {
                    $activity->delete();
                } else {
                    $show = TvShow::find($metadata['show_id']);
                    $season = TvSeason::find($metadata['season_id']);
                    $activity->update([
                        'metadata' => $metadata,
                        'description' => $this->generateTvEpisodeDescription($show, $season, $metadata['count']),
                    ]);
                }
            });
    }

    public function deleteCustomListItemActivity(UserCustomListItem $subject): void
    {
        if (!$subject->relationLoaded('listable')) {
            $subject->load('listable');
        }

        UserActivity::where('activity_type', 'list_item_add')
            ->where(function ($query) use ($subject) {
                $query->whereJsonContains('metadata->list_id', $subject->custom_list_id)
                    ->orWhere(function ($q) use ($subject) {
                        $q->where('subject_type', UserCustomListItem::class)
                            ->where('subject_id', $subject->id);
                    });
            })
            ->where('occurred_at', '>=', now()->subHour())
            ->get()
            ->each(function ($activity) use ($subject) {
                $metadata = $activity->metadata;
                $items = collect($metadata['items'] ?? []);

                $itemExists = $items->contains(function ($item) use ($subject) {
                    return $item['id'] == $subject->listable_id && $item['type'] == $this->getItemType($subject->listable);
                });

                if (!$itemExists) {
                    return;
                }

                $updatedItems = $items->reject(function ($item) use ($subject) {
                    return $item['id'] == $subject->listable_id && $item['type'] == $this->getItemType($subject->listable);
                })->values()->all();

                if (empty($updatedItems)) {
                    $activity->delete();
                } else {
                    $metadata['items'] = $updatedItems;
                    $this->updateActivity($activity, [
                        'metadata' => $metadata,
                        'description' => $this->generateBatchDescription($updatedItems, $subject->customList->title),
                    ]);
                }
            });
    }

    public function deleteAnimeCollectionActivity(UserAnimeCollection $collection): void
    {
        UserActivity::where('activity_type', 'anime_watch')
            ->where('user_id', $collection->userLibrary->user_id)
            ->where(function ($query) use ($collection) {
                $query->whereJsonContains('metadata->map_id', $collection->map_id)
                    ->orWhere(function ($q) use ($collection) {
                        $q->where('subject_type', UserAnimeCollection::class)
                            ->where('subject_id', $collection->id);
                    });
            })
            ->delete();
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
}
