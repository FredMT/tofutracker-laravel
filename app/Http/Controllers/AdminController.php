<?php

namespace App\Http\Controllers;

use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeChainEntry;
use App\Models\Anime\AnimeMap;
use App\Models\Anime\AnimePrequelSequelChain;
use App\Models\Anime\AnimeRelatedEntry;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class AdminController extends Controller
{
    protected $logger;

    public function __construct()
    {
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

    public function showAdminAnimeCollectionPage(AnimeMap $animeMap)
    {
        $animeMap->load('chains.entries');
        $chainEntries = $animeMap->chains->mapWithKeys(function ($chain) {
            $entries = $chain->entries->sortBy('sequence_order')->map(function ($entry) {
                return $entry->only(['id', 'anime_id', 'sequence_order', 'chain_id']);
            })->values();

            return [
                $chain->id => [
                    'name' => $chain->name,
                    'importance_order' => $chain->importance_order,
                    'entries' => $entries,
                ],
            ];
        });

        $relatedEntries = $animeMap->relatedEntries->map(function ($entry) {
            return $entry->only(['id', 'anime_id']);
        });

        $animeIds = $chainEntries->pluck('entries')->flatten(1)->pluck('anime_id')->merge($relatedEntries->pluck('anime_id'))->unique();
        $animes = AnidbAnime::whereIn('id', $animeIds)->get()->keyBy('id');

        $chainEntries = $chainEntries->map(function ($chain) use ($animes) {
            $chain['entries'] = $chain['entries']->map(function ($entry) use ($animes) {
                $anime = $animes->get($entry['anime_id']);
                $entry['picture'] = $anime->picture ?? null;
                $entry['title_main'] = $anime->title_main ?? null;

                return $entry;
            });

            return $chain;
        });

        $relatedEntries = $relatedEntries->map(function ($entry) use ($animes) {
            $anime = $animes->get($entry['anime_id']);
            $entry['picture'] = $anime->picture ?? null;
            $entry['title_main'] = $anime->title_main ?? null;

            return $entry;
        });

        $data['anime_map'] = $animeMap->only(['id', 'collection_name', 'most_common_tmdb_id', 'tmdb_type']);
        $data['chain_entries'] = $chainEntries;
        $data['related_entries'] = $relatedEntries;
        $data['anime_map']['poster'] = $animeMap->poster;

        return Inertia::render('Admin/ShowAnimeCollectionPage', ['data' => $data]);
    }

    public function findAnimeByAnidbId(AnidbAnime $animeId)
    {
        $data = $animeId->only(['id', 'picture', 'title_main', 'map_id']);

        return response()->json(['message' => 'Valid id, can redirect.', 'anime' => $data], 200);
    }

    public function findMapByMapId(AnimeMap $animeMap)
    {
        $animeMap->load(['chains']);

        return response()->json(['message' => 'Anime map data retrieved', 'animeMap' => $animeMap]);
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

            $animeMap = AnimeMap::create([
                'tmdb_type' => $tmdbType,
                'most_common_tmdb_id' => $tmdbId,
                'collection_name' => $collectionName,
            ]);

            $chain = AnimePrequelSequelChain::create([
                'map_id' => $animeMap->id,
                'name' => 'Chain 1',
                'importance_order' => 1,
            ]);

            AnimeChainEntry::create([
                'chain_id' => $chain->id,
                'anime_id' => $validated['anidb_id'],
                'sequence_order' => 1,
            ]);

            $anime->map_id = $animeMap->id;
            $anime->save();

            DB::commit();

            return response()->json(['success' => true, 'message' => 'Anime map chain entry created successfully.', 'redirectMapId' => $animeMap->id, 'redirect' => true], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            $this->logError($e);

            return response()->json(['success' => false, 'message' => 'Failed to create anime map chain entry. Please check logs.'], 500);
        }
    }

    public function addNewRelatedAnimetoAnimeCollection(Request $request)
    {
        $validated = $request->validate([
            'anidb_id' => ['required', 'integer', 'exists:anidb_anime,id'],
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
        ]);

        $anime = AnidbAnime::find($validated['anidb_id']);
        $animeMap = AnimeMap::find($validated['map_id']);

        if (! $anime) {
            return response()->json(['message' => 'Anime not found'], 404);
        }

        if (! $animeMap) {
            return response()->json(['message' => 'Anime map not found'], 404);
        }

        $existingEntry = AnimeRelatedEntry::where('anime_id', $anime->id)
            ->first();

        if ($existingEntry) {
            return response()->json(['message' => 'Anime already exists in related entries'], 400);
        }

        DB::beginTransaction();

        try {
            AnimeRelatedEntry::create([
                'anime_id' => $anime->id,
                'map_id' => $animeMap->id,
            ]);

            $anime->map_id = $animeMap->id;
            $anime->save();

            DB::commit();

            return response()->json(['message' => 'Related anime added successfully'], 201);

        } catch (\Throwable $e) {
            DB::rollBack();
            $this->logError($e);

            return response()->json(['message' => 'Could not add related anime'], 500);
        }
    }

    public function deleteItemFromRelatedEntry(AnimeRelatedEntry $relatedEntry)
    {
        try {

            DB::beginTransaction();

            AnidbAnime::where('id', $relatedEntry->anime_id)->update(['map_id' => $relatedEntry->map_id]);

            $mapFromRelated = AnimeMap::find($relatedEntry->map_id);

            $mapFromRelatedChainEntriesCount = $mapFromRelated->chainEntries()->count();
            $mapFromRelatedRelatedEntriesCount = $mapFromRelated->relatedEntries()->count();

            if ($mapFromRelatedChainEntriesCount === 0 && $mapFromRelatedRelatedEntriesCount === 1) {
                $mapFromRelated->delete();

                DB::commit();

                return response()->json(['message' => 'Deleted related entry for this anime id and map deleted as it has no more entries', 'redirect' => true, 'redirectTo' => route('admin.show')], 200);
            }

            $relatedEntry->delete();
            DB::commit();

            return response()->json(['message' => 'Deleted related entry for this anime id'], 200);
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->logError($e);

            return response()->json(['message' => 'Could not delete related entry'], 500);
        }

        return response()->json(['message' => 'Related entry deleted successfully'], 200);
    }

    public function deleteItemFromChainEntry(AnimePrequelSequelChain $animeChain, AnimeChainEntry $chainEntry)
    {
        $entryCount = AnimeChainEntry::where('chain_id', $animeChain->id)->count();
        $shouldDeleteChain = $entryCount === 1;

        DB::beginTransaction();

        try {
            $anime = AnidbAnime::find($chainEntry->anime_id);
            $anime->map_id = null;
            $anime->save();

            if ($shouldDeleteChain) {
                $animeChain->delete();
            }

            $chainEntry->delete();

            DB::commit();

            return response()->json(['message' => 'Chain entry deleted successfully'], 200);
        } catch (\Throwable $e) {
            DB::rollback();
            $this->logError($e);

            return response()->json(['message' => 'Could not delete chain entry'], 500);
        }
    }

    public function createAnimeChainAndEntry(Request $request)
    {
        $validated = $request->validate([
            'chain_name' => ['required', 'string', 'min:3'],
            'anime_id' => ['required', 'integer', 'exists:anidb_anime,id'],
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
        ]);

        $chainName = $validated['chain_name'];

        $animeId = $validated['anime_id'];
        $animeMapId = $validated['map_id'];

        DB::beginTransaction();

        $maxImportanceOrder = AnimePrequelSequelChain::where('map_id', $animeMapId)
            ->orderBy('importance_order', 'desc')
            ->value('importance_order') ?? 0;

        try {
            $chain = AnimePrequelSequelChain::create([
                'name' => $chainName,
                'importance_order' => $maxImportanceOrder + 1,
                'map_id' => $animeMapId,
            ]);

            AnimeChainEntry::create([
                'chain_id' => $chain->id,
                'anime_id' => $animeId,
                'sequence_order' => 1,
            ]);

            $anime = AnidbAnime::find($animeId);
            $anime->map_id = $animeMapId;
            $anime->save();

            DB::commit();

            return response()->json(['message' => 'Anime chain with entry created'], 201);
        } catch (\Throwable $e) {
            DB::rollback();
            $this->logError($e);

            return response()->json(['message' => 'Could not create anime chain with entry'], 500);
        }

    }

    public function createEntryInAnimeChain(Request $request)
    {
        $validated = $request->validate([
            'chain_id' => ['required', 'integer', 'exists:anime_prequel_sequel_chains,id'],
            'anime_id' => ['required', 'integer', 'exists:anidb_anime,id'],
            'map_id' => ['required', 'integer', 'exists:anime_maps,id'],
        ]);

        $chainId = $validated['chain_id'];
        $animeId = $validated['anime_id'];

        DB::beginTransaction();

        try {
            $maxSequenceOrder = AnimeChainEntry::where('chain_id', $chainId)
                ->orderBy('sequence_order', 'desc')
                ->value('sequence_order');

            AnimeChainEntry::create([
                'chain_id' => $chainId,
                'anime_id' => $animeId,
                'sequence_order' => $maxSequenceOrder + 1,
            ]);

            $anime = AnidbAnime::find($animeId);
            $anime->map_id = $validated['map_id'];
            $anime->save();

            DB::commit();

        } catch (\Throwable $th) {
            DB::rollback();
            $this->logError($th);

            return response()->json(['message' => 'Could not create entry in anime chain'], 500);
        }
    }

    public function patchCollectionName(Request $request, AnimeMap $animeMap)
    {
        $validated = $request->validate([
            'collection_name' => ['required', 'string', 'min:3'],
        ]);

        DB::beginTransaction();
        try {

            $animeMap->collection_name = $validated['collection_name'];
            $animeMap->save();

            DB::commit();

            return response()->json(['message' => 'Saved new collection name'], 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            $this->logError($th);

            return response()->json(['message' => 'Unable to update anime map collection name'], 500);
        }
    }

    public function moveChainEntryToAnotherChain(AnimeChainEntry $chainEntry, AnidbAnime $anime, Request $request)
    {
        $validated = $request->validate([
            'move_chain_id' => ['required', 'integer', 'exists:anime_prequel_sequel_chains,id'],
        ]);

        $chainToMoveTo = AnimePrequelSequelChain::find($validated['move_chain_id']);
        $chainToMoveFrom = AnimePrequelSequelChain::find($chainEntry->chain_id);

        if ($chainToMoveTo->id === $chainToMoveFrom->id) {
            return response()->json(['message' => "You're not allowed to transfer items within the same chain"], 403);
        }
        $mapFromChain = AnimeMap::find($chainToMoveFrom->map_id);
        $mapToChain = AnimeMap::find($chainToMoveTo->map_id);

        $maxSequenceOrder = AnimeChainEntry::where('chain_id', $chainToMoveTo->id)
            ->orderBy('sequence_order', 'desc')
            ->value('sequence_order');

        DB::beginTransaction();

        try {

            $chainEntry->delete();

            $chainToMoveFrom->fresh();

            $anime->map_id = $mapToChain->id;
            $anime->save();

            $mapFromChain->fresh();

            $mapFromChainChainEntriesCount = $mapFromChain->chainEntries()->count();
            $mapFromChainRelatedEntriesCount = $mapFromChain->relatedEntries()->count();

            if ($mapFromChainChainEntriesCount === 0 && $mapFromChainRelatedEntriesCount === 0) {
                $mapFromChain->delete();

                AnimeChainEntry::create([
                    'chain_id' => $chainToMoveTo->id,
                    'anime_id' => $anime->id,
                    'sequence_order' => $maxSequenceOrder + 1,
                ]);

                DB::commit();

                return response()->json(['message' => 'Entry moved successfully', 'redirect' => true, 'redirectMapId' => $mapToChain->id], 200);
            }

            $chainToMoveFromEntriesCount = $chainToMoveFrom->entries()->count();

            if ($chainToMoveFromEntriesCount === 0) {
                $chainToMoveFrom->delete();
            }

            AnimeChainEntry::create([
                'chain_id' => $chainToMoveTo->id,
                'anime_id' => $anime->id,
                'sequence_order' => $maxSequenceOrder + 1,
            ]);

            DB::commit();

            return response()->json(['message' => 'Entry moved successfully', 'redirect' => false, 'refreshMapId' => $mapFromChain->id], 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            $this->logError($th);

            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function moveChainEntryToNewChain(AnimeMap $animeMap, AnimeChainEntry $chainEntry, AnidbAnime $anime, Request $request)
    {
        $validated = $request->validate([
            'chain_name' => ['required', 'string'],
        ]);

        DB::beginTransaction();

        try {
            $chainToMoveFrom = AnimePrequelSequelChain::find($chainEntry->chain_id);
            $mapFromChain = AnimeMap::find($chainToMoveFrom->map_id);

            $mapFromChainChainEntriesCount = $mapFromChain->chainEntries()->count();
            $mapFromChainRelatedEntriesCount = $mapFromChain->relatedEntries()->count();

            if ($mapFromChainChainEntriesCount === 1 && $mapFromChainRelatedEntriesCount === 0) {
                $mapFromChain->delete();

                $maxImportanceOrder = AnimePrequelSequelChain::where('map_id', $animeMap->id)
                    ->orderBy('importance_order', 'desc')
                    ->value('importance_order');

                $newChain = AnimePrequelSequelChain::create([
                    'map_id' => $animeMap->id,
                    'name' => $validated['chain_name'],
                    'importance_order' => $maxImportanceOrder + 1,
                ]);

                AnimeChainEntry::create([
                    'chain_id' => $newChain->id,
                    'anime_id' => $anime->id,
                    'sequence_order' => 1,
                ]);

                $anime->map_id = $animeMap->id;
                $anime->save();

                DB::commit();

                return response()->json(['message' => 'Chain entry moved to new chain successfully', 'redirect' => true, 'redirectMapId' => $animeMap->id], 200);
            }

            $chainToMoveFromEntriesCount = $chainToMoveFrom->entries()->count();

            if ($chainToMoveFromEntriesCount === 1) {
                $chainToMoveFrom->delete();

                $maxImportanceOrder = AnimePrequelSequelChain::where('map_id', $animeMap->id)
                    ->orderBy('importance_order', 'desc')
                    ->value('importance_order');

                $newChain = AnimePrequelSequelChain::create([
                    'map_id' => $animeMap->id,
                    'name' => $validated['chain_name'],
                    'importance_order' => $maxImportanceOrder + 1,
                ]);

                AnimeChainEntry::create([
                    'chain_id' => $newChain->id,
                    'anime_id' => $anime->id,
                    'sequence_order' => 1,
                ]);

                $anime->map_id = $animeMap->id;
                $anime->save();

                DB::commit();

                return response()->json(['message' => 'Chain entry moved to new chain successfully', 'redirect' => true, 'redirectMapId' => $animeMap->id], 200);
            }

            $chainEntry->delete();

            $maxImportanceOrder = AnimePrequelSequelChain::where('map_id', $animeMap->id)
                ->orderBy('importance_order', 'desc')
                ->value('importance_order');

            $newChain = AnimePrequelSequelChain::create([
                'map_id' => $animeMap->id,
                'name' => $validated['chain_name'],
                'importance_order' => $maxImportanceOrder + 1,
            ]);

            AnimeChainEntry::create([
                'chain_id' => $newChain->id,
                'anime_id' => $anime->id,
                'sequence_order' => 1,
            ]);

            $anime->map_id = $animeMap->id;
            $anime->save();

            DB::commit();

            return response()->json(['message' => 'Chain entry moved to new chain successfully', 'refresh' => true, 'refreshMapId' => $mapFromChain->id], 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            $this->logError($th);

            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function moveFromChainToRelated(AnimeMap $animeMap, AnimeChainEntry $chainEntry, AnidbAnime $anime)
    {
        DB::beginTransaction();

        try {
            $chainToMoveFrom = AnimePrequelSequelChain::find($chainEntry->chain_id);
            $mapFromChain = AnimeMap::find($chainToMoveFrom->map_id);

            $mapFromChainChainEntriesCount = $mapFromChain->chainEntries()->count();
            $mapFromChainRelatedEntriesCount = $mapFromChain->relatedEntries()->count();

            if ($mapFromChainChainEntriesCount === 1 && $mapFromChainRelatedEntriesCount === 0) {

                if ($mapFromChain->id !== $animeMap->id) {
                    $mapFromChain->delete();
                }

                $chainToMoveFromEntriesCount = $chainToMoveFrom->entries()->count();

                if ($chainToMoveFromEntriesCount === 1) {
                    $chainToMoveFrom->delete();
                } else {
                    $chainEntry->delete();
                }

                AnimeRelatedEntry::create([
                    'map_id' => $animeMap->id,
                    'anime_id' => $anime->id,
                ]);

                $anime->map_id = $animeMap->id;
                $anime->save();

                DB::commit();

                return response()->json(['message' => 'Chain entry moved to new map successfully', 'redirect' => true, 'redirectMapId' => $animeMap->id], 200);
            }

            $chainToMoveFromEntriesCount = $chainToMoveFrom->entries()->count();

            if ($chainToMoveFromEntriesCount === 1) {
                $chainToMoveFrom->delete();

                AnimeRelatedEntry::create([
                    'map_id' => $animeMap->id,
                    'anime_id' => $anime->id,
                ]);

                $anime->map_id = $animeMap->id;
                $anime->save();

                DB::commit();

                return response()->json(['message' => 'Chain entry moved to new map successfully and chain deleted', 'redirect' => true, 'redirectMapId' => $mapFromChain->id], 200);
            }

            AnimeRelatedEntry::create([
                'map_id' => $animeMap->id,
                'anime_id' => $anime->id,
            ]);

            $anime->map_id = $animeMap->id;
            $anime->save();

            DB::commit();

            return response()->json(['message' => 'Chain entry moved to map successfully', 'refresh' => true, 'refreshMapId' => $animeMap->id], 200);

        } catch (\Throwable $th) {
            DB::rollBack();
            $this->logError($th);

            return response()->json(['message' => 'Internal Server Error'], 500);
        }

    }

    public function moveFromRelatedToChain(AnimeRelatedEntry $relatedEntry, AnimePrequelSequelChain $chain)
    {
        DB::beginTransaction();

        try {
            $relatedEntry->delete();

            $mapFromRelated = AnimeMap::find($relatedEntry->map_id);

            $mapFromRelatedChainEntriesCount = $mapFromRelated->chainEntries()->count();
            $mapFromRelatedRelatedEntriesCount = $mapFromRelated->relatedEntries()->count();

            if ($mapFromRelatedChainEntriesCount === 0 && $mapFromRelatedRelatedEntriesCount === 1) {
                $mapFromRelated->delete();

                $maxSequenceOrder = AnimeChainEntry::where('chain_id', $chain->id)
                    ->max('sequence_order') ?? 0;

                AnimeChainEntry::create([
                    'chain_id' => $chain->id,
                    'anime_id' => $relatedEntry->anime_id,
                    'sequence_order' => $maxSequenceOrder + 1,
                ]);

                AnidbAnime::where('id', $relatedEntry->anime_id)->update(['map_id' => $chain->map_id]);

                DB::commit();

                return response()->json(['message' => "Related entry with anime id {$relatedEntry->anime_id} moved to {$chain->name} successfully and previous map deleted", 'redirect' => true, 'redirectMapId' => $chain->map_id], 200);
            }

            $maxSequenceOrder = AnimeChainEntry::where('chain_id', $chain->id)
                ->max('sequence_order') ?? 0;

            AnimeChainEntry::create([
                'chain_id' => $chain->id,
                'anime_id' => $relatedEntry->anime_id,
                'sequence_order' => $maxSequenceOrder + 1,
            ]);

            AnidbAnime::where('id', $relatedEntry->anime_id)->update(['map_id' => $chain->map_id]);

            DB::commit();

            return response()->json(['message' => "Related entry with anime id {$relatedEntry->anime_id} moved to {$chain->name} successfully"], 200);
        } catch (\Throwable $th) {
            DB::rollBack();
            $this->logError($th);

            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function moveFromRelatedToRelated(AnimeRelatedEntry $relatedEntry, AnimeMap $animeMap)
    {
        if ($relatedEntry->map_id === $animeMap->id) {
            return response()->json(['message' => 'You cannot move a related entry item within the same anime map'], 403);
        }

        DB::beginTransaction();

        try {

            $mapFromRelated = AnimeMap::find($relatedEntry->map_id);

            $mapFromRelatedChainEntriesCount = $mapFromRelated->chainEntries()->count();
            $mapFromRelatedRelatedEntriesCount = $mapFromRelated->relatedEntries()->count();

            if ($mapFromRelatedChainEntriesCount === 0 && $mapFromRelatedRelatedEntriesCount === 1) {
                $mapFromRelated->delete();

                AnimeRelatedEntry::create([
                    'map_id' => $animeMap->id,
                    'anime_id' => $relatedEntry->anime_id,
                ]);

                DB::commit();

                return response()->json([
                    'message' => "Anime id {$relatedEntry->anime_id} moved to Map ID: {$animeMap->id} and previous map is deleted as it had no more entries",
                    'redirect' => true,
                    'redirectMapId' => $animeMap->id,
                ]);
            }

            $relatedEntry->delete();

            AnimeRelatedEntry::create([
                'map_id' => $animeMap->id,
                'anime_id' => $relatedEntry->anime_id,
            ]);

            DB::commit();

            return response()->json([
                'message' => "Anime id {$relatedEntry->anime_id} moved to Map ID: {$animeMap->id} and previous map is deleted as it had no more entries",
            ]);

        } catch (\Throwable $th) {
            DB::rollBack();
            $this->logError($th);

            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    public function moveFromRelatedToNewChain(AnimeRelatedEntry $relatedEntry, AnimeMap $animeMap, Request $request)
    {
        $validated = $request->validate(['chain_name' => ['required', 'string', 'min:1']]);

        $chainName = $validated['chain_name'];

        DB::beginTransaction();

        try {
            $mapFromRelated = AnimeMap::find($relatedEntry->map_id);
            $mapFromRelatedChainEntriesCount = $mapFromRelated->chainEntries()->count();
            $mapFromRelatedRelatedEntriesCount = $mapFromRelated->relatedEntries()->count();

            $isRelatedEntryMapIdAndMoveChainMapIdSame = $relatedEntry->map_id === $animeMap->id;

            if ($mapFromRelatedChainEntriesCount === 0 && $mapFromRelatedRelatedEntriesCount === 1 && $isRelatedEntryMapIdAndMoveChainMapIdSame === false) {
                $mapFromRelated->delete();

                $maxImportanceOrder = AnimePrequelSequelChain::where('map_id', $animeMap->id)
                    ->orderBy('importance_order', 'desc')
                    ->value('importance_order') ?? 0;

                $chain = AnimePrequelSequelChain::create([
                    'map_id' => $animeMap->id,
                    'name' => $chainName,
                    'importance_order' => $maxImportanceOrder + 1,
                ]);

                AnimeChainEntry::create([
                    'chain_id' => $chain->id,
                    'anime_id' => $relatedEntry->anime_id,
                    'sequence_order' => 1,
                ]);

                AnidbAnime::where('id', $relatedEntry->anime_id)->update(['map_id' => $chain->map_id]);

                DB::commit();

                return response()->json([
                    'message' => "Anime with id {$relatedEntry->anime_id} moved to new chain {$chain->name} and previous map is deleted as it has no more entries",
                    'redirect' => true,
                    'redirectMapId' => $chain->map_id,
                ]);
            }

            $relatedEntry->delete();

            $maxImportanceOrder = AnimePrequelSequelChain::where('map_id', $animeMap->id)
                ->orderBy('importance_order', 'desc')
                ->value('importance_order') ?? 0;

            $chain = AnimePrequelSequelChain::create([
                'map_id' => $animeMap->id,
                'name' => $chainName,
                'importance_order' => $maxImportanceOrder + 1,
            ]);

            AnimeChainEntry::create([
                'chain_id' => $chain->id,
                'anime_id' => $relatedEntry->anime_id,
                'sequence_order' => 1,
            ]);

            AnidbAnime::where('id', $relatedEntry->anime_id)->update(['map_id' => $chain->map_id]);

            DB::commit();

            return response()->json([
                'message' => "Anime with id {$relatedEntry->anime_id} moved to new chain {$chain->name} in map id: {$chain->map_id}.",
                'refresh' => true,
            ]);
        } catch (\Throwable $th) {
            DB::rollBack();
            $this->logError($th);

            return response()->json(['message' => 'Internal Server Error'], 500);
        }
    }

    private function logError(\Throwable $th)
    {
        $this->logger->error($th->getMessage());
        $this->logger->error($th->getTraceAsString());
    }
}
