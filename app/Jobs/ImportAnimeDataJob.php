<?php

namespace App\Jobs;

use App\Services\AnidbService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use JsonStreamingParser\Parser;

class ImportAnimeDataJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public $tries = 3;

    /**
     * The number of seconds the job can run before timing out.
     */
    public $timeout = 3600; // 1 hour

    /**
     * Execute the job.
     */
    public function handle(AnidbService $anidbService): void
    {
        $path = storage_path('app/anidb/anime.json');
        $stream = fopen($path, 'r');
        $listener = new \App\Services\AnidbJsonListener($anidbService);
        try {
            $parser = new Parser($stream, $listener);
            $parser->parse();
            fclose($stream);
            logger()->info('Anime data import completed successfully');
        } catch (\Exception $e) {
            fclose($stream);
            logger()->error('Error importing anime data: '.$e->getMessage());
            throw $e;
        }
    }
}
