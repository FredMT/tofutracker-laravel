<?php

namespace App\Http\Controllers;

use App\Actions\Schedule\FilterAndPresentSchedules;
use App\Actions\Schedule\GetFutureAnimeSchedules;
use App\Actions\Schedule\GetFutureTvSchedules;
use App\Http\Requests\ScheduleRequest;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Log;
use App\Collections\ScheduleCollection;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    private FilterAndPresentSchedules $filterAndPresentSchedules;
    private GetFutureAnimeSchedules $getFutureAnimeSchedules;
    private GetFutureTvSchedules $getFutureTvSchedules;

    public function __construct(
        FilterAndPresentSchedules $filterAndPresentSchedules,
        GetFutureAnimeSchedules $getFutureAnimeSchedules,
        GetFutureTvSchedules $getFutureTvSchedules
    ) {
        $this->filterAndPresentSchedules = $filterAndPresentSchedules;
        $this->getFutureAnimeSchedules = $getFutureAnimeSchedules;
        $this->getFutureTvSchedules = $getFutureTvSchedules;
    }

    public function index(ScheduleRequest $request)
    {
        $validatedData = $request->validated();

        return Inertia::render('Schedule', [
            'data' => $this->getDeferredScheduleData($validatedData),
            'datav2' => $this->getDeferredScheduleDataV2($validatedData),
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


    private function getDeferredScheduleDataV2(array $validatedData): callable
    {
        return Inertia::defer(function () use ($validatedData) {
            try {
                // Get raw schedule data directly from the services
                $animeSchedules = $this->getFutureAnimeSchedules->execute();
                $tvSchedules = $this->getFutureTvSchedules->execute();

                // Apply date filtering
                $date = $validatedData['date'] ?? Carbon::today()->format('Y-m-d');
                $endDate = Carbon::parse($date)->addDays(6)->format('Y-m-d');
                $startTimestamp = Carbon::parse($date)->timestamp;
                $endTimestamp = Carbon::parse($endDate)->timestamp;

                // Process anime schedules
                $processedAnimeSchedules = $animeSchedules->map(function ($schedule) {
                    return [
                        'id' => $schedule['id'],
                        'title' => $schedule['title'],
                        'episode_date' => Carbon::parse($schedule['episode_date'])->timestamp,
                        'episode_number' => $schedule['episode_number'] ?? null,
                        'backdrop' => $schedule['backdrop'],
                        'logo' => $schedule['logo'],
                        'link' => $schedule['link'],
                        'type' => 'anime'
                    ];
                });

                // Process TV schedules
                $processedTvSchedules = $tvSchedules->map(function ($schedule) {
                    return [
                        'id' => $schedule['id'],
                        'title' => $schedule['title'],
                        'episode_date' => Carbon::parse($schedule['episode_date'])->timestamp,
                        'episode_number' => $schedule['episode_number'] ?? null,
                        'episode_name' => $schedule['episode_name'] ?? null,
                        'season_number' => $schedule['season_number'] ?? null,
                        'backdrop' => $schedule['backdrop'],
                        'logo' => $schedule['logo'],
                        'link' => $schedule['link'],
                        'type' => 'tv'
                    ];
                });

                // Combine and filter by date range
                $combinedSchedules = $processedAnimeSchedules->concat($processedTvSchedules)
                    ->filter(function ($schedule) use ($startTimestamp, $endTimestamp) {
                        return $schedule['episode_date'] >= $startTimestamp && 
                               $schedule['episode_date'] <= $endTimestamp;
                    })
                    ->sortBy('episode_date')
                    ->values();

                // Apply type filter if specified
                if (isset($validatedData['type'])) {
                    $combinedSchedules = $combinedSchedules->filter(function ($schedule) use ($validatedData) {
                        return $schedule['type'] === $validatedData['type'];
                    })->values();
                }

                // Count items by type
                $typeCounts = [
                    'tv' => $combinedSchedules->where('type', 'tv')->count(),
                    'anime' => $combinedSchedules->where('type', 'anime')->count(),
                    'formatted_start_date' => Carbon::parse($date)->format('F j, Y'),
                    'formatted_end_date' => Carbon::parse($endDate)->format('F j, Y')
                ];

                return [
                    'success' => true,
                    'schedules' => $combinedSchedules,
                    'counts' => $typeCounts
                ];
            } catch (\Throwable $e) {
                $this->logError($e->getMessage());
                
                return [
                    'success' => false,
                    'schedules' => [],
                    'counts' => [
                        'tv' => 0,
                        'anime' => 0,
                        'formatted_start_date' => Carbon::parse($date ?? Carbon::today())->format('F j, Y'),
                        'formatted_end_date' => Carbon::parse($endDate ?? Carbon::today()->addDays(7))->format('F j, Y')
                    ],
                    'message' => 'An error occurred while processing schedules.'
                ];
            }
        });
    }

    private function logError(string $errorMessage): void
    {
        Log::error("Schedule controller error: {$errorMessage}");
    }
}
