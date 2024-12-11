<?php

namespace App\Console\Commands;

use App\Jobs\ProcessAnimeXmlJob;
use App\Services\AnidbUdpService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class FetchUpdatedAnimeCommand extends Command
{
    protected $signature = 'anime:fetch-updates';
    protected $description = 'Fetch and process updated anime from AniDB';

    public function handle(AnidbUdpService $udpService): void
    {
        try {
            $result = $udpService->getUpdatedAnime(1);

            if (!isset($result['anime_ids']) || empty($result['anime_ids'])) {
                Log::info('No anime updates found');
                return;
            }

            // Get the current time
            $currentTime = now();

            // Dispatch jobs with delay to respect rate limit
            foreach ($result['anime_ids'] as $index => $animeId) {
                ProcessAnimeXmlJob::dispatch($animeId);
            }

            Log::info('Queued anime updates for processing', [
                'count' => count($result['anime_ids'])
            ]);
        } catch (\Exception $e) {
            Log::error('Failed to fetch anime updates', [
                'error' => $e->getMessage()
            ]);
        }
    }
}
