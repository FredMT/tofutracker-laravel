<?php

namespace App\Http\Controllers;

use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use SimpleXMLElement;
use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeMap;
use Illuminate\Support\Facades\DB;

class AnimeGenresController extends Controller
{
    public function show(): JsonResponse
    {
        try {
            $validAnidbIds = Cache::remember('valid_anidb_ids', now()->addDay(), function () {
                $xmlUrl = 'https://raw.githubusercontent.com/Anime-Lists/anime-lists/refs/heads/master/anime-list-full.xml';
                $response = Http::get($xmlUrl);

                if (!$response->successful()) {
                    throw new Exception('Failed to retrieve anime list XML. Status code: ' . $response->status());
                }

                $xml = new SimpleXMLElement($response->body());
                $validIds = [];

                foreach ($xml->anime as $anime) {
                    $attributes = $anime->attributes();
                    $tvdbId = (string)$attributes->tvdbid;
                    
                    if ($tvdbId !== 'hentai') {
                        $validIds[] = (int)$attributes->anidbid;
                    }
                }

                return $validIds;
            });

            return response()->json([
                'success' => true,
                'message' => 'Valid AniDB IDs retrieved successfully',
                'data' => $validAnidbIds
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function topRatedByTags(): JsonResponse
    {
        try {
            $validAnidbIds = Cache::get('valid_anidb_ids', []);
            
            // Constants for Bayesian average
            $C = 7.0; // Prior count (weight)
            $m = 7.0; // Prior mean (default rating)
            
            $tagIds = [2853, 2858, 2869, 2043];
            $excludeTagIds = [2841, 2750];
            $startDate = '2015-01-01';

            $topAnime = AnidbAnime::query()
                ->whereIn('id', $validAnidbIds)
                ->whereHas('tags', function($query) use ($tagIds) {
                    $query->whereIn('anidb_tags.id', $tagIds);
                }, '=', count($tagIds))
                ->whereDoesntHave('tags', function($query) use ($excludeTagIds) {
                    $query->whereIn('anidb_tags.id', $excludeTagIds);
                })
                ->whereNotNull('rating')
                ->whereNotNull('rating_count')
                ->whereNotNull('startdate')
                ->whereNotNull('map_id')
                ->where('startdate', '>=', $startDate)
                ->select([
                    'anidb_anime.*',
                    DB::raw("((rating_count * rating) + ($C * $m)) / (rating_count + $C) as bayesian_average")
                ])
                ->orderByDesc('bayesian_average')
                ->limit(1000)
                ->get()
                ->unique('map_id')
                ->values();

            // Get the map IDs from the filtered anime
            $mapIds = $topAnime->pluck('map_id');

            // Fetch and return only the AnimeMap data
            $tmdbData = AnimeMap::whereIn('id', $mapIds)
                ->get()
                ->map(function ($map) {
                    return [
                        'map_id' => $map->id,
                        'title' => $map->title,
                        'poster' => $map->poster,
                        'trailer' => $map->trailer,
                        'rating' => $map->rating,
                        'overview' => $map->overview,
                        'tmdb_type' => $map->tmdb_type,
                    ];
                });

            return response()->json([
                'success' => true,
                'message' => 'Top rated anime TMDB data retrieved successfully',
                'data' => $tmdbData
            ]);

        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage()
            ], 500);
        }
    }
}
