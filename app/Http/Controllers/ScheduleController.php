<?php

namespace App\Http\Controllers;

use App\Actions\Schedule\FilterAndPresentSchedules;
use App\Http\Requests\ScheduleRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;

class ScheduleController extends Controller
{
    protected FilterAndPresentSchedules $filterAndPresentSchedules;

    public function __construct(
        FilterAndPresentSchedules $filterAndPresentSchedules
    ) {
        $this->filterAndPresentSchedules = $filterAndPresentSchedules;
    }

    public function index(ScheduleRequest $request)
    {
        $validated = $request->validated();

        $result = $this->filterAndPresentSchedules->execute($validated);

        if (!$result['success']) {
            Log::error('Schedule controller error: ' . $result['error']);

            return response()->json([
                'message' => 'An error occurred while fetching schedules.',
                'error' => $result['error'],
            ], 500);
        }

        return Inertia::render('Schedule', [
            'schedule' => $result['schedule'],
            'counts' => $result['counts']
        ]);
    }
}
