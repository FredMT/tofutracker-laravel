<?php

namespace App\Actions\Schedule;

use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ProcessScheduleWithTimestamps
{
    protected GetFutureAnimeSchedules $getFutureAnimeSchedules;
    protected GetFutureTvSchedules $getFutureTvSchedules;
    
    protected const CACHE_KEY_RAW_DATA = 'schedule_raw_data';
    protected const CACHE_KEY_PROCESSED_DATA = 'schedule_processed_data';
    protected const CACHE_DURATION_MINUTES = 60;

    public function __construct(
        GetFutureAnimeSchedules $getFutureAnimeSchedules,
        GetFutureTvSchedules $getFutureTvSchedules
    ) {
        $this->getFutureAnimeSchedules = $getFutureAnimeSchedules;
        $this->getFutureTvSchedules = $getFutureTvSchedules;
    }

    public function execute(array $filters): array
    {
        try {
            $rawData = $this->getRawData();
            
            $cacheKey = $this->generateCacheKey($filters);
            
            return Cache::remember($cacheKey, self::CACHE_DURATION_MINUTES * 60, function () use ($rawData, $filters) {

                $date = $filters['date'] ?? Carbon::today()->format('Y-m-d');
                $endDate = Carbon::parse($date)->addDays(6)->format('Y-m-d');
                $startTimestamp = Carbon::parse($date)->timestamp;
                $endTimestamp = Carbon::parse($endDate)->timestamp;
                
                $processedAnimeSchedules = $rawData['anime'];
                $processedTvSchedules = $rawData['tv'];

                $combinedSchedules = $this->combineAndFilterSchedules(
                    $processedAnimeSchedules, 
                    $processedTvSchedules, 
                    $startTimestamp, 
                    $endTimestamp, 
                    $filters
                );

                $typeCounts = $this->calculateTypeCounts($combinedSchedules, $date, $endDate);

                return [
                    'success' => true,
                    'schedules' => $combinedSchedules,
                    'counts' => $typeCounts
                ];
            });
        } catch (\Throwable $e) {
            Log::error('ProcessScheduleWithTimestamps error: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            
            return $this->errorResponse($filters['date'] ?? null, null);
        }
    }

    protected function getRawData(): array
    {
        return Cache::remember(self::CACHE_KEY_RAW_DATA, self::CACHE_DURATION_MINUTES * 60, function () {
            
            $animeSchedules = $this->getFutureAnimeSchedules->execute();
            $tvSchedules = $this->getFutureTvSchedules->execute();
            
            $processedAnimeSchedules = $this->processAnimeSchedules($animeSchedules);
            
            $processedTvSchedules = $this->processTvSchedules($tvSchedules);
            
            return [
                'anime' => $processedAnimeSchedules,
                'tv' => $processedTvSchedules
            ];
        });
    }

    protected function generateCacheKey(array $filters): string
    {
        $date = $filters['date'] ?? Carbon::today()->format('Y-m-d');
        $type = $filters['type'] ?? 'all';
        
        return self::CACHE_KEY_PROCESSED_DATA . '_' . $date . '_' . $type;
    }

    public function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY_RAW_DATA);
        
        $keys = Cache::get('schedule_processed_data_keys', []);
        foreach ($keys as $key) {
            Cache::forget($key);
        }
        Cache::forget('schedule_processed_data_keys');
    }

    protected function processAnimeSchedules(Collection $animeSchedules): Collection
    {
        return $animeSchedules->map(function ($schedule) {
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
    }

    protected function processTvSchedules(Collection $tvSchedules): Collection
    {
        return $tvSchedules->map(function ($schedule) {
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
    }

    protected function combineAndFilterSchedules(
        Collection $animeSchedules, 
        Collection $tvSchedules, 
        int $startTimestamp, 
        int $endTimestamp, 
        array $filters
    ): Collection {
        $combinedSchedules = $animeSchedules->concat($tvSchedules)
            ->filter(function ($schedule) use ($startTimestamp, $endTimestamp) {
                return $schedule['episode_date'] >= $startTimestamp && 
                       $schedule['episode_date'] <= $endTimestamp;
            })
            ->sortBy('episode_date')
            ->values();

        if (isset($filters['type'])) {
            $combinedSchedules = $combinedSchedules->filter(function ($schedule) use ($filters) {
                return $schedule['type'] === $filters['type'];
            })->values();
        }

        return $combinedSchedules;
    }

    protected function calculateTypeCounts(Collection $schedules, string $startDate, string $endDate): array
    {
        return [
            'tv' => $schedules->where('type', 'tv')->count(),
            'anime' => $schedules->where('type', 'anime')->count(),
            'formatted_start_date' => Carbon::parse($startDate)->format('F j, Y'),
            'formatted_end_date' => Carbon::parse($endDate)->format('F j, Y')
        ];
    }

    protected function errorResponse(?string $startDate, ?string $endDate): array
    {
        $startDate = $startDate ?? Carbon::today()->format('Y-m-d');
        $endDate = $endDate ?? Carbon::parse($startDate)->addDays(6)->format('Y-m-d');
        
        $formattedStartDate = Carbon::parse($startDate)->format('F j, Y');
        $formattedEndDate = Carbon::parse($endDate)->format('F j, Y');

        return [
            'success' => false,
            'schedules' => [],
            'counts' => [
                'tv' => 0,
                'anime' => 0,
                'formatted_start_date' => $formattedStartDate,
                'formatted_end_date' => $formattedEndDate
            ],
            'message' => 'An error occurred while processing schedules.'
        ];
    }
} 