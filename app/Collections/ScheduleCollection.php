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

    public function countItemsByTypeForToday(): array
    {
        $today = today()->format('Y-m-d');
        $todaySchedule = $this->firstWhere('date', $today);

        $typeCounts = [
            'tv' => 0,
            'anime' => 0,
        ];

        if ($todaySchedule && isset($todaySchedule['schedules'])) {
            $todayItems = collect($todaySchedule['schedules']);

            $typeCounts['tv'] = $todayItems->where('type', 'tv')->count();
            $typeCounts['anime'] = $todayItems->where('type', 'anime')->count();
        }

        return $typeCounts;
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

        return $collection;
    }
}