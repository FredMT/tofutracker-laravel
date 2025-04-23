<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('anime:fetch-genres')->weeklyOn(6, '8:00')->timezone('UTC');

Schedule::command('trendingGenresAndWatchProviders:update')->dailyAt('05:00')->timezone('UTC');
Schedule::command('anime:fetch-updates --days=1')->dailyAt('08:00')->timezone('UTC');
Schedule::command('anime:fetch-schedules')->dailyAt('09:00')->timezone('UTC');
Schedule::command('anime:fetch-external-ids')->dailyAt('09:00')->timezone('UTC');
Schedule::command('tmdb:fetch-airing-shows')->dailyAt('10:00')->timezone('UTC');
Schedule::command('tmdb:update-movies')->hourly();
Schedule::command('tvshows:fetch-changes')->hourly();
Schedule::command('horizon:snapshot')->everyFiveMinutes();
Schedule::command('telescope:prune')->daily();