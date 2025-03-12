<?php

namespace App\Http\Controllers;

use App\Actions\Schedule\GetCombinedSchedules;
use App\Http\Requests\ScheduleRequest;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class ScheduleController extends Controller
{
    protected GetCombinedSchedules $getCombinedSchedules;

    public function __construct(
        GetCombinedSchedules $getCombinedSchedules
    ) {
        $this->getCombinedSchedules = $getCombinedSchedules;
    }

    public function index(ScheduleRequest $request)
    {
        try {
            $validated = $request->validated();

            $allSchedules = $this->getCombinedSchedules->execute();
            $dateFilteredSchedules = $this->filterSchedulesByDateRange(
                $allSchedules,
                Carbon::parse($validated['start_date']),
                Carbon::parse($validated['end_date'])
            );

            $filteredSchedules = $dateFilteredSchedules->map(function ($daySchedule) {
                return $this->filterTvShowsWithNullLogos($daySchedule);
            });

            $typeCounts = $this->countItemsByTypeForToday($filteredSchedules);

            return Inertia::render('Schedule', [
                'schedule' => $filteredSchedules,
                'counts' => $typeCounts
            ]);

        } catch (\Exception $e) {
            Log::error('Schedule controller error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return response()->json([
                'message' => 'An error occurred while fetching schedules.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    private function countItemsByTypeForToday(Collection $schedules): array
    {
        $today = today()->format('Y-m-d');
        $todaySchedule = $schedules->firstWhere('date', $today);

        $typeCounts = [
            'tv' => 0,
            'anime' => 0,
            'movie' => 0,
        ];

        if ($todaySchedule && isset($todaySchedule['schedules'])) {
            $todayItems = collect($todaySchedule['schedules']);

            $typeCounts['tv'] = $todayItems->where('type', 'tv')->count();
            $typeCounts['anime'] = $todayItems->where('type', 'anime')->count();
            $typeCounts['movie'] = $todayItems->where('type', 'movie')->count();
        }

        return $typeCounts;
    }

    private function filterSchedulesByDateRange(Collection $schedules, Carbon $startDate, Carbon $endDate): Collection
    {
        return $schedules->filter(function ($schedule) use ($startDate, $endDate) {
            $scheduleDate = Carbon::parse($schedule['date']);
            return $scheduleDate->greaterThanOrEqualTo($startDate) &&
                   $scheduleDate->lessThanOrEqualTo($endDate);
        })->values();
    }

    private function filterTvShowsWithNullLogos(array $daySchedule): array
    {
        $filteredDaySchedules = collect($daySchedule['schedules'])->filter(function ($schedule) {
            return $schedule['type'] !== 'tv' || $schedule['logo'] !== null;
        })->values();

        return array_merge($daySchedule, ['schedules' => $filteredDaySchedules]);
    }
}
