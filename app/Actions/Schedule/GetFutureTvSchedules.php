<?php

namespace App\Actions\Schedule;

use App\Models\TmdbScheduleEpisode;
use App\Models\TvShow;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection as EloquentCollection;
use Illuminate\Support\Collection;

class GetFutureTvSchedules
{
    public function execute(): Collection
    {
        $schedules = $this->getTvSchedules();
        $showIds = $schedules->pluck('show_id')->unique()->values()->toArray();
        $tvShows = $this->getTvShows($showIds);

        return $this->transformScheduleData($schedules, $tvShows);
    }

    /**
     * Get TV schedules for the next 30 days
     */
    private function getTvSchedules(): EloquentCollection
    {
        $startDate = Carbon::now();
        $endDate = Carbon::now()->addDays(30);

        return TmdbScheduleEpisode::with('tvShow')
            ->inDateRange($startDate, $endDate)
            ->orderBy('episode_date')
            ->get();
    }

    /**
     * Get TV shows by IDs
     */
    private function getTvShows(array $showIds): EloquentCollection
    {
        return TvShow::whereIn('id', $showIds)->get()->keyBy('id');
    }

    /**
     * Transform schedule data with related TV shows
     */
    private function transformScheduleData(
        EloquentCollection $schedules,
        EloquentCollection $tvShows
    ): Collection {
        return $schedules->map(function (TmdbScheduleEpisode $schedule) use ($tvShows) {
            $showId = $schedule->show_id;
            $tvShow = $tvShows->get($showId);

            $title = $tvShow ? $tvShow->title : 'Unknown Show';
            $mediaAssets = $this->getMediaAssets($tvShow);

            $year = Carbon::parse($schedule->episode_date)->year;
            $week = Carbon::parse($schedule->episode_date)->weekOfYear;

            return [
                'id' => $schedule->id,
                'title' => $title,
                'episode_date' => $schedule->episode_date,
                'episode_number' => $schedule->episode_number,
                'episode_name' => $schedule->episode_name,
                'season_number' => $schedule->season_number,
                'year' => $year,
                'week' => $week,
                'show_id' => $showId,
                'backdrop' => $mediaAssets['backdrop'],
                'logo' => $mediaAssets['logo'],
                'poster' => $mediaAssets['poster'],
                'link' => $tvShow ? '/tv/' . $showId . '/season/' . $schedule->season_number : null
            ];
        });
    }

    /**
     * Get media assets for a TV show
     */
    private function getMediaAssets(?TvShow $tvShow): array
    {
        if (!$tvShow) {
            return [
                'backdrop' => null,
                'logo' => null,
                'poster' => null
            ];
        }

        return [
            'backdrop' => $tvShow->backdrop,
            'logo' => $tvShow->highestVotedLogoPath,
            'poster' => $tvShow->poster
        ];
    }
}
