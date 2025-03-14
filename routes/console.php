<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('anime:fetch-updates --days=1')->dailyAt('08:00')->timezone('UTC');
Schedule::command('trendingGenresAndWatchProviders:update')->dailyAt('08:00')->timezone('UTC');
Schedule::command('tmdb:fetch-airing-shows')->dailyAt('10:00')->timezone('UTC');
Schedule::command('anime:fetch-schedules')->dailyAt('09:00')->timezone('UTC');
Schedule::command('horizon:snapshot')->everyFiveMinutes();
