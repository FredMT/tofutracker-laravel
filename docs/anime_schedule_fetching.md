# Anime Schedule Fetching Process

This document explains the step-by-step process of what happens when the `php artisan anime:fetch-schedules` command is run.

## Overview

The `anime:fetch-schedules` command retrieves anime schedules from the AnimeShedule API, extracts AniDB IDs, and stores this information in the database. This allows the system to maintain a mapping between AnimeShedule IDs and AniDB IDs, as well as keep track of anime schedules for different weeks and years. The system only stores anime episodes with future air dates.

## Database Structure

The process uses two main database tables:

1. **anime_schedule_maps**: Maps AnimeShedule IDs to AniDB IDs

    - Defined in migration file: `2025_03_09_063955_create_anime_schedule_maps_table.php`
    - Contains fields: animeschedule_id (primary key), animeschedule_route, anidb_id
    - No timestamps (as specified in the model)
    - Has unique constraints on animeschedule_route

2. **anime_schedules**: Stores anime schedule information with year and week tracking
    - Defined in migration file: `2025_03_09_063956_create_anime_schedules_table.php`
    - Contains fields: id, animeschedule_id (foreign key), title, episode_date, year, week
    - No timestamps (as specified in the model)
    - Has a unique constraint on animeschedule_id, year, and week
    - Has a foreign key reference to anime_schedule_maps

## Step-by-Step Process

### 1. Command Execution

When `php artisan anime:fetch-schedules` is run:

-   The command is defined in `routes/console.php`
-   It accepts optional `--year` and `--week` parameters
-   If not provided, the current year and week are used
-   The command dispatches the `FetchAnimeSchedulesJob` with the specified parameters

```php
Artisan::command('anime:fetch-schedules {--year=} {--week=}', function () {
    $year = $this->option('year') ? (int) $this->option('year') : null;
    $week = $this->option('week') ? (int) $this->option('week') : null;

    FetchAnimeSchedulesJob::dispatch($year, $week);
});
```

### 2. Job Processing

The `FetchAnimeSchedulesJob` is queued and processed:

-   The job has a timeout of 0 (unlimited time)
-   It has 3 retry attempts with increasing backoff times (30, 60, 120 seconds)
-   The job uses the `AnimeScheduleService` to fetch and process anime schedules

```php
public function handle(AnimeScheduleService $animeScheduleService)
{
    $year = $this->year ?? now()->year;
    $week = $this->week ?? now()->weekOfYear;

    $scheduledAnime = $animeScheduleService->getScheduledAnimeWithAnidbIds($year, $week);

    $this->storeSchedules($scheduledAnime);
}
```

### 3. API Data Retrieval

The `AnimeScheduleService` makes API calls to retrieve anime schedules:

1. **First API Call**: Fetches the weekly schedule

    - Endpoint: `https://animeschedule.net/api/v3/timetables/sub?year={year}&week={week}`
    - Returns a list of anime schedules for the specified week

2. **For Each Anime in the Schedule**:

    - Checks if the episode date is in the future (skips past episodes)
    - If the anime already has a mapping in the database, it uses the existing mapping
    - Otherwise, it makes a second API call to get detailed information

3. **Second API Call** (if needed): Fetches detailed anime information
    - Endpoint: `https://animeschedule.net/api/v3/anime/{route}`
    - Extracts the AnimeShedule ID from the `id` field
    - Extracts the AniDB ID from the `websites.anidb` field
    - If no AniDB ID is found, the anime is skipped

### 4. Mapping Storage

When a new anime is found with a valid AniDB ID:

1. The service creates a mapping in the `anime_schedule_maps` table:

    - animeschedule_id: The ID from the API
    - animeschedule_route: The route from the API
    - anidb_id: The extracted AniDB ID

2. This mapping is stored only once and is reused for future requests

### 5. Schedule Storage

For each anime with a valid mapping and a future episode date:

1. The service creates a schedule entry in the `anime_schedules` table:

    - animeschedule_id: References the mapping
    - title: From the API
    - episode_date: From the API (only future dates)
    - year: The current year or specified year
    - week: The current week or specified week

2. This allows storing multiple schedules for the same anime (for different weeks/years)

### 6. Rate Limiting

The service implements rate limiting to respect the API's constraints:

-   Tracks the remaining requests (120 per minute)
-   Monitors the rate limit reset time
-   Waits if the rate limit is reached
-   Uses exponential backoff for retries

### 7. Batch Processing

The job processes data in batches:

-   Schedules are processed in batches of 100 records
-   This prevents memory issues with large datasets

### 8. Logging

Throughout the process, detailed logging is performed:

-   Logs the start and completion of the job
-   Tracks the number of anime processed, skipped, and stored
-   Records any errors encountered
-   Provides a summary of the operation

## Scheduled Execution

The command is scheduled to run daily at 09:00 UTC:

```php
Schedule::command('anime:fetch-schedules')->dailyAt('09:00')->timezone('UTC');
```

## Error Handling

The process includes robust error handling:

-   API request failures are retried with exponential backoff
-   Database errors are logged but don't stop the entire process
-   The job can be retried up to 3 times if it fails
