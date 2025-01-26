<?php

namespace App\Actions\Anime\Plays;

use App\Actions\Activity\CreateUserActivityAction;
use App\Models\Anidb\AnidbAnime;
use App\Models\UserAnime\UserAnime;
use App\Models\UserAnime\UserAnimeEpisode;
use App\Models\UserAnime\UserAnimePlay;
use Illuminate\Database\Eloquent\Model;

class CreateUserAnimePlayAction
{
    public function __construct(
        private readonly CreateUserActivityAction $createActivity
    ) {}

    public function execute(Model $playable, ?\DateTime $watchedAt = null): UserAnimePlay
    {
        $play = UserAnimePlay::create([
            'playable_id' => $playable->id,
            'playable_type' => $playable::class,
            'watched_at' => $watchedAt ?? now(),
        ]);

        if ($playable instanceof UserAnimeEpisode && ! $playable->relationLoaded('userAnime')) {
            $playable->load(['userAnime.user']);
        }

        if ($playable instanceof UserAnimeEpisode && $playable->userAnime?->user) {
            $anime = AnidbAnime::find($playable->userAnime->anidb_id);
            $this->createActivity->execute(
                userId: $playable->userAnime->user->id,
                activityType: 'anime_watch',
                subject: $playable,
                metadata: [
                    'user_anime_id' => $playable->userAnime->id,
                    'anidb_id' => $playable->userAnime->anidb_id,
                    'map_id' => $anime?->map(),
                    'user_anime_episode_ids' => [$playable->id],
                    'count' => 1,
                    'poster_path' => $playable?->episode->poster,
                    'poster_from' => 'tvdb',
                    'anime_title' => $anime?->title,
                    'anime_link' => "/anime/{$anime?->map()}/season/{$anime->id}",
                    'type' => 'anime_episode',
                ]
            );
        } elseif ($playable instanceof UserAnime) {
            $anime = AnidbAnime::find($playable->anidb_id);
            $this->createActivity->execute(
                userId: $playable->user->id,
                activityType: 'anime_watch',
                subject: $playable,
                metadata: [
                    'user_anime_id' => $playable->id,
                    'anidb_id' => $playable->anidb_id,
                    'map_id' => $anime?->map(),
                    'is_movie' => $playable->is_movie,
                    'poster_path' => $anime->poster,
                    'poster_from' => 'anidb',
                    'anime_title' => $anime?->title,
                    'anime_link' => "/anime/{$anime?->map()}/season/{$anime->id}",
                    'type' => 'anime_season',
                ]
            );
        }

        return $play;
    }

    public function executeMultiple(array $playables, ?\DateTime $watchedAt = null): void
    {
        foreach ($playables as $playable) {
            $this->execute($playable, $watchedAt);
        }
    }
}
