<?php

namespace App\Http\Controllers;

use App\Jobs\UpdateOrCreateTvData;
use App\Models\TvShow;
use App\Services\TmdbService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Cache;
use Inertia\Response;

class TvController extends Controller
{
    public function __construct(
        private readonly TmdbService $tmdbService
    ) {}

    public function show(Request $request, string $id): Response
    {

        $user = $request->user();
        $userLibraryData = $user?->library()
            ->where('media_id', $id)
            ->where('media_type', 'tv')
            ->first();

        $cacheKey = "tv.{$id}";

        if (Cache::has($cacheKey)) {

            return Inertia::render('Content', [
                'tv' => Cache::get($cacheKey),
                'user_library' => $userLibraryData,
                'type' => 'tv'
            ]);
        }

        $existingTvShow = TvShow::find($id);
        if ($existingTvShow) {
            if ($existingTvShow->updated_at->lt(now()->subHours(6))) {
                UpdateOrCreateTvData::dispatch($id);
            }

            Cache::put($cacheKey, $existingTvShow->filteredData, now()->addHours(6));

            return Inertia::render('Content', [
                'tv' => $existingTvShow->filteredData,
                'user_library' =>
                $userLibraryData,
                'type' => 'tv'
            ]);
        }

        $tvShow = $this->fetchAndStoreTvShow($id);
        Cache::put($cacheKey, $tvShow->filteredData, now()->addHours(6));

        return Inertia::render('Content', [
            'tv' => Cache::get($cacheKey),
            'user_library' => fn() => $userLibraryData,
            'type' => 'tv'
        ]);
    }

    public function details(Request $request, string $id)
    {
        $user = $request->user();
        $userLibraryData = $user?->library()
            ->where('media_id', $id)
            ->where('media_type', 'tv')
            ->first();

        $cacheKey = "tv.{$id}";

        if (Cache::has($cacheKey)) {
            return response()->json([
                'tv' => Cache::get($cacheKey),
                'user_library' => $userLibraryData,
                'type' => 'tv'
            ]);
        }

        $existingTvShow = TvShow::find($id);
        if ($existingTvShow) {
            if ($existingTvShow->updated_at->lt(now()->subHours(6))) {
                UpdateOrCreateTvData::dispatch($id);
            }

            Cache::put($cacheKey, $existingTvShow->filteredData, now()->addHours(6));

            return response()->json([
                'tv' => $existingTvShow->filteredData,
                'user_library' => $userLibraryData,
                'type' => 'tv'
            ]);
        }

        $tvShow = $this->fetchAndStoreTvShow($id);
        Cache::put($cacheKey, $tvShow->filteredData, now()->addHours(6));

        return response()->json([
            'tv' => Cache::get($cacheKey),
            'user_library' => $userLibraryData,
            'type' => 'tv'
        ]);
    }

    private function fetchAndStoreTvShow(string $id): TvShow
    {
        $response = $this->tmdbService->getTv($id);

        if (isset($response['data']['success']) && $response['data']['success'] === false) {
            abort(404, $response['data']['status_message'] ?? 'Movie not found');
        }

        $tvData = $response['data'];
        $etag = $response['etag'] ?? null;

        return TvShow::create([
            'id' => $id,
            'data' => $tvData,
            'etag' => $etag
        ]);
    }
}
