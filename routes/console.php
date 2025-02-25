<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote')->hourly();

Schedule::command('anime:fetch-updates --days=1')->dailyAt('08:00')->timezone('UTC');
Schedule::command('trendingGenresAndWatchProviders:update')->dailyAt('08:00')->timezone('UTC');
