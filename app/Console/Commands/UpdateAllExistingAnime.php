<?php

namespace App\Console\Commands;

use App\Jobs\ProcessAnimeXmlJob;
use App\Models\Anidb\AnidbAnime;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Throwable;

class UpdateAllExistingAnime extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'anime:update-all-existing-anime';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Continuously processes random AnidbAnime records update until ban or completion.';

    private const ID_LIST_PATH = 'app/anidb_ids_update.json';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $logger = Log::channel('anidbupdate');
        $idFilePath = self::ID_LIST_PATH;
        $storage = Storage::disk('local');

        $ids = [];

        // 1. Load or Generate IDs
        if ($storage->exists($idFilePath)) {
            $jsonContent = $storage->get($idFilePath);
            if (!empty($jsonContent)) {
                $ids = json_decode($jsonContent, true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    $logger->error('Failed to decode existing ID list. Regenerating...', ['error' => json_last_error_msg()]);
                    $ids = []; // Force regeneration on decode error
                } else {
                    $logger->info('Loaded existing ID list.', ['count' => count($ids)]);
                }
            }
        }

        if (empty($ids)) {
            $logger->info('ID list not found or empty. Generating list of AnidbAnime IDs missing tags...');
            $ids = AnidbAnime::pluck('id')->toArray();

            if (empty($ids)) {
                $logger->info('No AnidbAnime records found missing tags.');
                $this->info('No AnidbAnime records found missing tags.');
                return Command::SUCCESS;
            }

            $storage->put($idFilePath, json_encode($ids, JSON_PRETTY_PRINT));
            $logger->info('Generated and saved new ID list.', ['count' => count($ids)]);
            $this->info('Generated list of '.count($ids).' anime IDs missing tags.');
        }

        $logger->info('Starting processing loop.', ['initial_count' => count($ids)]);

        while (true) {
            // 2. Check if list is empty
            if (empty($ids)) {
                $logger->info('ID list is now empty. Processing complete.');
                $this->info('ID list is empty. Processing complete.');
                break; // Exit the loop
            }

            // Introduce random delay (2 to 2.5 seconds)
            $delayMicroseconds = rand(2000000, 2200000);
            $logger->debug('Sleeping before next process.', ['delay_ms' => $delayMicroseconds / 1000]);
            usleep($delayMicroseconds);

            // 3. Select Random ID
            $randomKey = array_rand($ids);
            $randomId = $ids[$randomKey];
            $logger->info('Selected random anime ID to process.', ['id' => $randomId, 'remaining_approx' => count($ids)]);

            // 4. Dispatch Job Synchronously (No Pre-check)
            $this->info("Processing Anime ID: {$randomId}");
            try {
                $logger->info('Dispatching ProcessAnimeXmlJob synchronously...', ['id' => $randomId]);
                ProcessAnimeXmlJob::dispatchSync($randomId);
                $logger->info('ProcessAnimeXmlJob completed successfully.', ['id' => $randomId]);

                // 5. Update ID List on Success
                unset($ids[$randomKey]);
                $remainingIds = array_values($ids); // Re-index array
                $storage->put($idFilePath, json_encode($remainingIds, JSON_PRETTY_PRINT));
                $ids = $remainingIds; // Update the loop's copy of the IDs

                $logger->info('Successfully processed and removed anime ID from list.', ['id' => $randomId, 'remaining' => count($remainingIds)]);
                $this->info("Successfully processed Anime ID: {$randomId}. Remaining: ".count($remainingIds));

            } catch (Throwable $e) {
                // Check if the exception message from the job indicates a ban
                if (str_contains($e->getMessage(), '<error code="500">banned</error>') || str_contains($e->getMessage(), 'AniDB API access banned')) {
                    $logger->error('AniDB API ban detected during job execution. Stopping command execution.', ['id' => $randomId, 'error' => $e->getMessage()]);
                    $this->error('AniDB API ban detected during job execution. Stopping execution.');
                    // Do NOT remove the ID from the list if a ban occurred during the job
                    return Command::FAILURE; // Indicate failure due to ban and stop the command
                } else {
                    $logger->error('Error dispatching or executing ProcessAnimeXmlJob. Stopping command execution.', ['id' => $randomId, 'error' => $e->getMessage()]);
                    $this->error('Failed to process Anime ID: '.$randomId.'. Error: '.$e->getMessage().'. Stopping execution.');
                    // Do NOT remove the ID from the list if the job failed for other reasons
                    return Command::FAILURE; // Indicate general failure and stop the command
                }
            }
        } // End while loop

        return Command::SUCCESS; // Only reached if the loop completes successfully (list empty)
    }
}