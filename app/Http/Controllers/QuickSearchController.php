<?php

namespace App\Http\Controllers;

use App\Actions\Anime\GetAnimeTypeAction;
use App\Models\AnimeMap;
use App\Services\TmdbService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Validator;

class QuickSearchController extends Controller
{
    private TmdbService $tmdbService;

    private GetAnimeTypeAction $getAnimeTypeAction;

    public function __construct(TmdbService $tmdbService, GetAnimeTypeAction $getAnimeTypeAction)
    {
        $this->tmdbService = $tmdbService;
        $this->getAnimeTypeAction = $getAnimeTypeAction;
    }

    public function __invoke(Request $request): JsonResponse
    {
        if (! $request->has('q') || empty($request->query('q'))) {
            return response()->json([
                'results' => [],
            ]);
        }

        $validator = Validator::make($request->all(), [
            'q' => ['required', 'string', 'min:2', 'max:100', 'regex:/^[\p{L}\p{N}\s\-\'\.,]+$/u'],
            'max_results' => ['sometimes', 'integer', 'min:1', 'max:20'],
        ], [
            'q.regex' => 'The search query can only contain letters, numbers, spaces, and basic punctuation.',
        ]);

        if ($validator->fails()) {
            return back()->with([
                'results' => [],
                'errors' => $validator->errors(),
            ], 422);
        }

        try {
            $searchResults = $this->tmdbService->search($request->query('q'), 1);
            $genreMap = Config::get('genres');
            $maxResults = $request->query('max_results', 4);

            $animeMappings = AnimeMap::where(function ($query) use ($searchResults) {
                $tmdbIds = collect($searchResults['results'])
                    ->pluck('id')
                    ->toArray();
                $query->whereIn('most_common_tmdb_id', $tmdbIds);
            })
                ->get()
                ->keyBy('most_common_tmdb_id');

            $results = collect($searchResults['results'])
                ->filter(fn ($item) => $item['media_type'] !== 'person')
                ->take($maxResults)
                ->map(function ($item) use ($genreMap, $animeMappings) {
                    $animeMapping = $animeMappings->get($item['id']);
                    $isAnime = $animeMapping !== null;

                    $result = [
                        'id' => $isAnime ? $animeMapping->id : $item['id'],
                        'title' => $item['title'] ?? $item['name'] ?? '',
                        'media_type' => $isAnime ? 'anime' : $item['media_type'],
                        'year' => isset($item['release_date'])
                            ? substr($item['release_date'], 0, 4)
                            : (isset($item['first_air_date'])
                                ? substr($item['first_air_date'], 0, 4)
                                : null),
                        'poster_path' => $item['poster_path'],
                        'genres' => isset($item['genre_ids'])
                            ? array_values(array_filter(
                                array_map(fn ($id) => $genreMap[$id] ?? null, $item['genre_ids'])
                            ))
                            : [],
                    ];

                    if ($isAnime) {
                        $result['anime_type'] = $this->getAnimeTypeAction->execute($animeMapping->id);
                    }

                    return $result;
                });

            return response()->json([
                'results' => $results,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'results' => [],
                'error' => 'An error occurred while processing your search',
            ], 500);
        }
    }
}
