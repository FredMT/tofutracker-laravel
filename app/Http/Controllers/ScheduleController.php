<?php

namespace App\Http\Controllers;

use App\Actions\Schedule\ProcessScheduleWithTimestamps;
use App\Http\Requests\ScheduleRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class ScheduleController extends Controller
{
    private ProcessScheduleWithTimestamps $processScheduleWithTimestamps;

    public function __construct(
        ProcessScheduleWithTimestamps $processScheduleWithTimestamps
    ) {
        $this->processScheduleWithTimestamps = $processScheduleWithTimestamps;
    }

    public function index(ScheduleRequest $request)
    {
        $validatedData = $request->validated();

        return Inertia::render('Schedule', [
            'data' => $this->getDeferredScheduleData($validatedData),
        ]);
    }

    public function refreshCache(): JsonResponse
    {
        try {
            $this->processScheduleWithTimestamps->clearCache();
            
            $this->processScheduleWithTimestamps->execute([]);
            
            return response()->json([
                'success' => true,
                'message' => 'Schedule cache refreshed successfully',
            ]);
        } catch (\Throwable $e) {
            Log::error('Error refreshing schedule cache: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to refresh schedule cache',
            ], 500);
        }
    }

    private function getDeferredScheduleData(array $validatedData): callable
    {
        return Inertia::defer(function () use ($validatedData) {
            $result = $this->processScheduleWithTimestamps->execute($validatedData);

            if (! $result['success']) {
                $this->logError($result['message'] ?? 'Unknown error');

                return [
                    'schedules' => [],
                    'counts' => $result['counts'] ?? [],
                ];
            }

            return [
                'schedules' => $result['schedules'],
                'counts' => $result['counts'],
            ];
        });
    }

    private function logError(string $errorMessage): void
    {
        Log::error("Schedule controller error: {$errorMessage}");
    }
}
