<?php

namespace App\Http\Controllers;

use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeChainEntry;
use App\Models\Anime\AnimeMap;
use App\Models\Anime\AnimePrequelSequelChain;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

use Illuminate\Support\Facades\Log;

class AdminController extends Controller
{
    protected $logger;

    public function __construct() {
        $this->logger = Log::channel('admin');
    }

    public function show()
    {
        return Inertia::render('Admin/Show');
    }

    public function showAdminAnime(AnidbAnime $animeId)
    {
        $data = $animeId->only(['id', 'type', 'title_main', 'picture', 'map_id']);

        $haglundResponse = Http::get("https://arm.haglund.dev/api/v2/ids?source=anidb&id={$animeId->id}")->json();

        $possibleTmdbId = $haglundResponse['themoviedb'];

        $data['possible_tmdb_id'] = $possibleTmdbId;

        $mapData = null;

        if ($data['map_id']) {
            $animeMap = AnimeMap::find($data['map_id']);
            $mapData = $animeMap->only('most_common_tmdb_id', 'tmdb_type', 'collection_name');
        }

        $data['map_data'] = $mapData;

        return Inertia::render('Admin/ShowAnimePage', [
            'data' => $data,
        ]);
    }

    public function showAdminAnimeCollectionPage(AnimeMap $mapId)
    {
        // {"id":101,"created_at":null,"updated_at":"2024-12-15T15:28:06.000000Z","most_common_tmdb_id":37854,"tmdb_type":"tv","collection_name":null}  
        $chainEntries = $mapId->chainEntries->groupBy('chain_id')->map(function ($entries) {
            return $entries->sortBy('sequence_order')->values();
        });
        $relatedEntries = $mapId->relatedEntries;
        $data["chain_entries"] = $chainEntries;
        $data["related_entries"] = $relatedEntries;
        return Inertia::render('Admin/ShowAnimeCollectionPage', ['data' => $mapId]);
    }

    public function findAnimeByAnidbId(Request $request)
    {
        $validated = $request->validate([
            'animeId' => ['required', 'integer'],
        ]);

        $anime = AnidbAnime::find($validated['animeId']);

        if (! $anime) {
            $message = sprintf('Anidb with the id %d not found', $validated['animeId']);

            return response()->json(['success' => false, 'message' => $message], 404);
        }

        return response()->json(['message' => 'Valid id, can redirect.'], 200);
    }

    public function createAnimeMapChainEntry(Request $request)
    {
        $validated = $request->validate([
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
            'tmdb_id' => ['sometimes', 'integer'],
            'tmdb_type' => ['sometimes', 'string'],
            'collection_name' => ['sometimes', 'string'],
        ]);

        $tmdbId = $validated['tmdb_id'] ?? null;
        $tmdbType = $validated['tmdb_type'] ?? null;
        $collectionName = $validated['collection_name'] ?? null;

        $anime = AnidbAnime::find($validated['anidb_id']);

        if (! $anime) {
            $message = sprintf('Anidb anime with the id %d not found', $validated['anidb_id']);

            return response()->json(['success' => false, 'message' => $message], 404);
        }

        if ($anime->map_id) {
            $message = sprintf('Anidb anime with the id %d is already mapped (Map ID: %d)', $validated['anidb_id'], $anime->map_id);

            return response()->json(['success' => false, 'message' => $message], 409);
        }

        DB::beginTransaction();

        try {
            $maxId = AnimeMap::max('id');
            $maxChainId = AnimePrequelSequelChain::max('id');
            $maxChainEntryId = AnimeChainEntry::max('id');

            $animeMap = AnimeMap::create(['id' => $maxId + 1, 'tmdb_type' => $tmdbType, 'most_common_tmdb_id' => $tmdbId, 'collection_name' => $collectionName]);

            $chain = AnimePrequelSequelChain::create([
                'id' => $maxChainId + 1,
                'map_id' => $animeMap->id,
                'name' => 'Chain 1',
                'importance_order' => 1,
            ]);

            AnimeChainEntry::create([
                'id' => $maxChainEntryId + 1,
                'chain_id' => $chain->id,
                'anime_id' => $validated['anidb_id'],
                'sequence_order' => 1,
            ]);

            $anime->map_id = $animeMap->id;
            $anime->save();

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Anime map chain entry created successfully.', 'map_id' => $animeMap->id], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            logger()->channel('admin')->error("Failed to create anime map chain entry for anidb_id {$validated['anidb_id']}: ".$e->getMessage());

            return response()->json(['success' => false, 'message' => 'Failed to create anime map chain entry. Please check logs.'], 500);
        }
    }
}
