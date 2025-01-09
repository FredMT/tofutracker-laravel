<?php

namespace App\Jobs;

use App\Actions\Trending\GetTrendingGenresAndWatchProvidersAction;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateTrendingGenresAndWatchProvidersJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;


    public int $timeout = 0;

    public function handle(GetTrendingGenresAndWatchProvidersAction $action): void
    {
        try {
            $action->store();
        } catch (\Exception $e) {
            logger()->error('Failed to update trending genres and watch providers: ' . $e->getMessage());
            logger()->error($e->getTraceAsString());
            $this->fail($e->getMessage());
        }
    }
}
