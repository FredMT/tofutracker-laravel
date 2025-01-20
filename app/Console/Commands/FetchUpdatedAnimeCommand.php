<?php

namespace App\Console\Commands;

use App\Jobs\ProcessAnimeXmlJob;
use App\Services\AnidbUdpService;
use Illuminate\Console\Command;

class FetchUpdatedAnimeCommand extends Command
{
    protected $signature = 'anime:fetch-updates {--days=3 : Number of days to look back for updates}';

    protected $description = 'Fetch and process updated anime from AniDB';

    public function handle(AnidbUdpService $udpService): void
    {
        try {
            $days = $this->option('days');
            $result = $udpService->getUpdatedAnime($days);

            if (! isset($result['anime_ids']) || empty($result['anime_ids'])) {
                logger()->info('No anime updates found');

                return;
            }

            // Dispatch jobs with delay to respect rate limit
            foreach ($result['anime_ids'] as $index => $animeId) {
                ProcessAnimeXmlJob::dispatch($animeId);
            }

            logger()->info('Queued anime updates for processing', [
                'count' => count($result['anime_ids']),
            ]);
        } catch (\Exception $e) {
            logger()->error('Failed to fetch anime updates', [
                'error' => $e->getMessage(),
            ]);
        }
    }
}
