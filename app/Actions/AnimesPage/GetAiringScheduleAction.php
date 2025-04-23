<?php

namespace App\Actions\AnimesPage;

use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeMap;
use App\Models\AnimeSchedule;
use App\Models\AnimeScheduleMap;

class GetAiringScheduleAction
{
    /**
     * Execute the action to get the next 10 future anime episodes with schedule and related info.
     *
     * @return array<int, array<string, mixed>>
     */
    public function execute(): array
    {
        $episodes = AnimeSchedule::futureEpisodes()
            ->orderBy('episode_date')
            ->limit(10)
            ->get();

        $result = [];
        foreach ($episodes as $episode) {
            $scheduleMap = AnimeScheduleMap::where('animeschedule_id', $episode->animeschedule_id)->first();

            if (! $scheduleMap) {
                continue;
            }

            $anidbAnime = AnidbAnime::find($scheduleMap->anidb_id);

            if (! $anidbAnime) {
                continue;
            }

            $animeMap = AnimeMap::find($anidbAnime->map_id);

            if (! $animeMap) {
                continue;
            }

            $result[] = [
                'id' => $animeMap->id,
                'title' => $episode->title,
                'episode_date' => $episode->episode_date->timestamp,
                'episode_number' => $episode->episode_number,
                'episode_name' => $episode->episode_number,
                'backdrop' => $animeMap->backdrop,
                'logo' => $animeMap->logo,
                'link' => "anime/{$animeMap->id}",
                'type' => 'anime',
            ];
        }

        return $result;
    }
}
