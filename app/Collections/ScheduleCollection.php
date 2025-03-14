<?php

namespace App\Collections;

use Carbon\Carbon;
use Illuminate\Support\Collection;

class ScheduleCollection extends Collection
{

    public function filterByDateRange(Carbon $startDate, Carbon $endDate): self
    {
        return $this->filter(function ($schedule) use ($startDate, $endDate) {
            $scheduleDate = Carbon::parse($schedule['date']);
            return $scheduleDate->greaterThanOrEqualTo($startDate) &&
                   $scheduleDate->lessThanOrEqualTo($endDate);
        })->values();
    }

    public function filterTvShowsWithNullLogos(): self
    {
        return $this->map(function ($daySchedule) {
            $filteredDaySchedules = collect($daySchedule['schedules'])->filter(function ($schedule) {
                return $schedule['type'] !== 'tv' || $schedule['logo'] !== null;
            })->values();

            return array_merge($daySchedule, ['schedules' => $filteredDaySchedules]);
        });
    }

    public function filterOutFieldsByType(): self
    {
        return $this->map(function ($daySchedule) {
            $filteredDaySchedules = collect($daySchedule['schedules'])->map(function ($schedule) {
                if ($schedule['type'] === 'anime') {
                    return collect($schedule)
                        ->forget(['anidb_id', 'anime_map', 'poster', 'week', 'year'])
                        ->toArray();
                } elseif ($schedule['type'] === 'tv') {
                    return collect($schedule)
                        ->forget(['poster', 'show_id', 'week', 'year'])
                        ->toArray();
                }
                return $schedule;
            })->values();

            return array_merge($daySchedule, ['schedules' => $filteredDaySchedules]);
        });
    }

    public function filterByType(?string $type): self
    {
        if (!$type) {
            return $this;
        }

        return $this->map(function ($daySchedule) use ($type) {
            $filteredDaySchedules = collect($daySchedule['schedules'])->filter(function ($schedule) use ($type) {
                return $schedule['type'] === $type;
            })->values();

            return array_merge($daySchedule, ['schedules' => $filteredDaySchedules]);
        });
    }

    public function countItemsByType(): array
    {
        $typeCounts = [
            'tv' => 0,
            'anime' => 0,
        ];

        foreach ($this as $daySchedule) {
            if (isset($daySchedule['schedules'])) {
                $schedules = collect($daySchedule['schedules']);
                $typeCounts['tv'] += $schedules->where('type', 'tv')->count();
                $typeCounts['anime'] += $schedules->where('type', 'anime')->count();
            }
        }

        return $typeCounts;
    }

    public function applyFilters(array $filters): self
    {
        $collection = $this;

        if (isset($filters['start_date']) && isset($filters['end_date'])) {
            $collection = $collection->filterByDateRange(
                Carbon::parse($filters['start_date']),
                Carbon::parse($filters['end_date'])
            );
        }

        $collection = $collection->filterTvShowsWithNullLogos();

        if (isset($filters['type'])) {
            $collection = $collection->filterByType($filters['type']);
        }

        $collection = $collection->filterOutFieldsByType();

        return $collection;
    }
}