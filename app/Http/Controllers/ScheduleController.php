<?php

namespace App\Http\Controllers;

use App\Actions\Schedule\FilterAndPresentSchedules;
use App\Http\Requests\ScheduleRequest;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use App\Collections\ScheduleCollection;

class ScheduleController extends Controller
{
    private FilterAndPresentSchedules $filterAndPresentSchedules;

    public function __construct(FilterAndPresentSchedules $filterAndPresentSchedules)
    {
        $this->filterAndPresentSchedules = $filterAndPresentSchedules;
    }

    public function index(ScheduleRequest $request)
    {
        $validatedData = $request->validated();

        return Inertia::render('Schedule', [
            'data' => $this->getDeferredScheduleData($validatedData),
        ]);
    }

    private function getDeferredScheduleData(array $validatedData): callable
    {
        return Inertia::defer(function () use ($validatedData) {
            $result = $this->filterAndPresentSchedules->execute($validatedData);

            if (!$result['success']) {
                $this->logError($result['error']);
                return [
                    'schedule' => [],
                    'counts' => []
                ];
            }

            return [
                'schedule' => $result['schedule'],
                'counts' => $result['counts']
            ];
        });
    }

    private function logError(string $errorMessage): void
    {
        Log::error("Schedule controller error: {$errorMessage}");
    }
}
