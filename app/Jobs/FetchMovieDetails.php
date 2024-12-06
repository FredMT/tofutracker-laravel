<?php

namespace App\Jobs;

use App\Services\TmdbService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Cache;

class FetchMovieDetails implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private readonly string $movieId
    ) {}

    public function handle(TmdbService $tmdbService): void
    {
        $details = $tmdbService->getMovie($this->movieId);
        Cache::put("movie.{$this->movieId}", $details, now()->addHours(6));
    }
}
