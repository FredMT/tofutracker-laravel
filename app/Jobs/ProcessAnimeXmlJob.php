<?php

namespace App\Jobs;

use App\Services\AnidbXmlDatabaseService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\RateLimiter;

class ProcessAnimeXmlJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $tries = 3;

    public $backoff = 3;

    public function __construct(
        private readonly int $animeId
    ) {}

    public function handle(AnidbXmlDatabaseService $service): void
    {
        try {
            $client = config('services.anidb.client_name');
            $url = "http://api.anidb.net:9001/httpapi?request=anime&client={$client}&clientver=1&protover=1&aid={$this->animeId}";

            $response = Http::get($url);
            if (! $response->successful()) {
                throw new \Exception('Failed to fetch anime XML: '.$response->status());
            }

            // Clean XML content
            $xmlContent = preg_replace('/&(?!(?:amp|lt|gt|quot|apos);)/', '&amp;', $response->body());

            // Process the XML
            $service->processXmlContent($xmlContent);

            UpdateAnidbTvdbEpisodeData::dispatchSync($this->animeId);

            logger()->channel('anidbupdate')->info('Successfully processed anime', ['anime_id' => $this->animeId]);
        } catch (\Exception $e) {
            logger()->channel('anidbupdate')->error('Failed to process anime', ['anime_id' => $this->animeId]);
            logger()->channel('anidbupdate')->error($e->getMessage());
            logger()->channel('anidbupdate')->error($e->getTraceAsString());
            throw $e; // Re-throw to trigger job failure
        }
    }
}
