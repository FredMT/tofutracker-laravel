<?php

namespace App\Actions\UserController\Anime\AnimeTv;

use App\Enums\MediaType;
use App\Enums\WatchStatus;
use App\Models\UserAnime\UserAnimeCollection;
use App\Models\UserLibrary;
use Illuminate\Support\Facades\DB;

class StoreAnimeTvAction
{
    public function execute(array $validated, $user)
    {
        return DB::transaction(function () use ($validated, $user) {
            // Get or create user's anime library
            $library = UserLibrary::firstOrCreate([
                'user_id' => $user->id,
                'type' => MediaType::ANIME,
            ]);

            // Create collection for the TV show
            UserAnimeCollection::create([
                'user_library_id' => $library->id,
                'map_id' => $validated['map_id'],
                'watch_status' => WatchStatus::WATCHING,
            ]);

            return [
                'success' => true,
                'message' => 'Anime TV show added to your library',
            ];
        });
    }
}
