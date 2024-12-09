<?php

namespace App\Providers;

use App\Models\User;
use App\Models\UserLibrary;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);
        Gate::define('manage-library-entry', function (User $user, UserLibrary $entry) {
            return $user->is($entry->user);
        });
    }
}
