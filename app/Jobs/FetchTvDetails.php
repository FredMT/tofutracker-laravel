<?php

namespace App\Jobs;

use App\Services\TmdbService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;

class FetchTvDetails implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private readonly string $tvId
    ) {}

    public function handle(TmdbService $tmdbService): void
    {
        $details = $tmdbService->getTv($this->tvId)->json();
        Cache::put("tv.{$this->tvId}", $details, now()->addMinutes(30));
    }
}
