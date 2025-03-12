<?php

namespace App\Actions\Schedule;

use App\Collections\ScheduleCollection;
use Throwable;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class FilterAndPresentSchedules
{
    protected GetCombinedSchedules $getCombinedSchedules;

    public function __construct(
        GetCombinedSchedules $getCombinedSchedules
    ) {
        $this->getCombinedSchedules = $getCombinedSchedules;
    }

    public function execute(array $filters): array
    {
        try {
            $allSchedules = $this->getCombinedSchedules->execute();

            $scheduleCollection = new ScheduleCollection($allSchedules);
            $filteredSchedules = $scheduleCollection->applyFilters($filters);

            $typeCounts = $filteredSchedules->countItemsByType();

            $start_date = $filters['start_date'] ?? Carbon::today()->format('Y-m-d');
            $end_date = $filters['end_date'] ?? Carbon::today()->addDays(7)->format('Y-m-d');

            $typeCounts['formatted_start_date'] = Carbon::parse($start_date)->format('F j, Y');
            $typeCounts['formatted_end_date'] = Carbon::parse($end_date)->format('F j, Y');

            return [
                'success' => true,
                'schedule' => $filteredSchedules,
                'counts' => $typeCounts
            ];
        } catch (Throwable $e) {
            Log::error('FilterAndPresentSchedules error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());

            return [
                'success' => false,
                'message' => 'An error occurred while filtering schedules.',
                'error' => $e->getMessage(),
            ];
        }
    }
}
