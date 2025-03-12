<?php

namespace App\Actions\Schedule;

use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class GetCombinedSchedules
{
    protected GetFutureAnimeSchedules $getFutureAnimeSchedules;
    protected GetFutureTvSchedules $getFutureTvSchedules;

    public function __construct(
        GetFutureAnimeSchedules $getFutureAnimeSchedules,
        GetFutureTvSchedules $getFutureTvSchedules
    ) {
        $this->getFutureAnimeSchedules = $getFutureAnimeSchedules;
        $this->getFutureTvSchedules = $getFutureTvSchedules;
    }

    public function execute(): Collection
    {
        return Cache::remember('combined_schedules', 3600, function () {
            try {
                $animeSchedules = $this->getFutureAnimeSchedules->execute()
                    ->map(fn ($schedule) => array_merge($schedule, ['type' => 'anime']));

                $tvSchedules = $this->getFutureTvSchedules->execute()
                    ->map(fn ($schedule) => array_merge($schedule, ['type' => 'tv']));

                return $this->groupSchedulesByDate($animeSchedules->concat($tvSchedules));
            } catch (\Exception $e) {
                Log::error('Error in GetCombinedSchedules: ' . $e->getMessage());
                return collect([]);
            }
        });
    }

    private function groupSchedulesByDate(Collection $schedules): Collection
    {
        try {
            $validSchedules = $schedules->filter(function ($schedule) {
                return isset($schedule['episode_date']) && !empty($schedule['episode_date']);
            });

            $sortedSchedules = $validSchedules->sortBy(fn ($schedule) =>
                Carbon::parse($schedule['episode_date'])->timestamp
            );

            $groupedSchedules = $sortedSchedules->groupBy(fn ($schedule) =>
                Carbon::parse($schedule['episode_date'])->format('Y-m-d')
            );

            return $groupedSchedules->sortKeys()
                ->map(function ($schedules, $date) {
                    $sortedDaySchedules = $schedules->sortBy(fn ($schedule) =>
                        Carbon::parse($schedule['episode_date'])->format('H:i:s')
                    )->values();

                    return [
                        'date' => $date,
                        'formatted_date' => Carbon::parse($date)->format('F j, Y'),
                        'day_of_week' => Carbon::parse($date)->format('l'),
                        'schedules' => $sortedDaySchedules
                    ];
                })->values();
        } catch (\Exception $e) {
            Log::error('Error in groupSchedulesByDate: ' . $e->getMessage());
            return collect([]);
        }
    }
}
