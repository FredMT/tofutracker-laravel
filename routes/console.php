<?php

use Illuminate\Support\Facades\Schedule;

Schedule::command('anime:fetch-updates --days=1')->dailyAt('08:00')->timezone('UTC');
Schedule::command('trending:update')->dailyAt('08:00')->timezone('UTC');
Schedule::command('tvmaze:fetch-schedule')->dailyAt('10:00')->timezone('UTC');
Schedule::command('anime:fetch-schedules')->dailyAt('09:00')->timezone('UTC');
