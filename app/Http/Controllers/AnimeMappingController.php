<?php

namespace App\Http\Controllers;

use App\Actions\Anime\AnimeEpisodeMapper;
use App\Http\Controllers\Controller;
use App\Jobs\SyncTvdbAnimeData;
use App\Models\AnidbAnime;
use App\Models\AnimeEpisodeMapping;
use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use SimpleXMLElement;
use App\Models\TvdbAnimeSeason;

class AnimeMappingController extends Controller
{
    public function mapAnimeEpisodes(Request $request, AnimeEpisodeMapper $mapper)
    {
        $anidbid = $request->validate([
            'anidbid' => 'required|integer|min:1',
        ])['anidbid'];

        // Fetch the anime record and episode count
        $animeRecord = AnidbAnime::find($anidbid);

        if (!$animeRecord) {
            return response()->json(['error' => 'Anime not found in database'], 404);
        }

        if ($animeRecord->type === 'Movie') {
            return response()->json(['error' => 'This anime is a movie'], 400);
        }

        $episodeCount = $animeRecord->episode_count;

        $xmlUrl = 'https://raw.githubusercontent.com/Anime-Lists/anime-lists/refs/heads/master/anime-list-full.xml';
        $client = new Client();

        try {
            $response = $client->get($xmlUrl);

            if (!$response->getStatusCode() === 200) {
                return response()->json(['error' => 'Failed to retrieve anime list XML. Status code: ' . $response->getStatusCode()], 500);
            }

            $xml = $response->getBody()->getContents();
            libxml_use_internal_errors(true);
            $xmlObject = new SimpleXMLElement($xml);

            if ($xmlObject === false) {
                $errors = libxml_get_errors();
                libxml_clear_errors();

                $errorMessage = "XML Parsing Error: ";
                foreach ($errors as $error) {
                    $errorMessage .= $error->message . " Line: " . $error->line . "; ";
                }
                return response()->json(['error' => $errorMessage], 500);
            }

            libxml_use_internal_errors(false);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to retrieve anime list XML.'], 500);
        }

        $anime = null;
        $searchId = (int) $anidbid;


        foreach ($xmlObject->anime as $animeElement) {
            $currentId = (int) $animeElement['anidbid'];


            if ($currentId === $searchId) {
                $anime = $animeElement;
                break;
            }
        }

        if (!$anime) {
            Log::warning('Anime not found in XML', ['searched_anidbid' => $searchId]);
            return response()->json(['error' => 'Anime with anidbid ' . $anidbid . ' not found in mapping list.'], 404);
        }

        // Check for non-numeric or zero TVDB ID
        $tvdbId = $anime['tvdbid'];
        if (!(int)$tvdbId > 0) {
            return response()->json(['error' => 'Anime with anidbid ' . $anidbid . ' has an invalid TVDB ID.'], 400);
        }

        // Get the basic mapping using the episode count from database
        $mapping = $mapper->mapEpisodes($anime, $episodeCount);

        // Enhance the mapping with actual episode data
        $enhancedMapping = $this->enhanceWithEpisodeData($mapping, (int)$tvdbId);

        return response()->json($enhancedMapping);
    }

    protected function enhanceWithEpisodeData(array $mapping, int $tvdbId): array
    {
        $cacheKey = "anime_mapping_{$tvdbId}_" . md5(json_encode($mapping));

        $season = TvdbAnimeSeason::with('episodes')->find($tvdbId);

        // Retry fetching the season data a few times
        $maxRetries = 3;
        $retryDelay = 2; // seconds

        while (!$season && $maxRetries > 0) {
            SyncTvdbAnimeData::dispatchSync($tvdbId);
            $season = TvdbAnimeSeason::with('episodes')->find($tvdbId);
            $maxRetries--;
            if ($maxRetries > 0) {
                sleep($retryDelay);
            }
        }

        if (!$season) {
            return $mapping;
        }

        // Determine cache duration based on status
        $cacheDuration = $season->exists && $season->status_name === 'Ended'
            ? now()->addMonth()
            : now()->addMinutes(30);

        return cache()->remember($cacheKey, $cacheDuration, function () use ($season, $mapping, $tvdbId) {
            // Create a lookup map for episodes
            $episodeLookup = $season->episodes->groupBy(function ($episode) {
                return "{$episode->season_number}_{$episode->number}";
            })->all();

            $enhancedMapping = [
                'mainEpisodes' => [],
                'specialEpisodes' => []
            ];

            // Process main episodes
            $mainEpisodes = array_filter($mapping['mainEpisodes'], fn($info) => $info['episode'] !== 0);
            foreach ($mainEpisodes as $anidbNumber => $tvdbInfo) {
                $key = "{$tvdbInfo['season']}_{$tvdbInfo['episode']}";
                $episode = $episodeLookup[$key][0] ?? null;

                $enhancedMapping['mainEpisodes'][$anidbNumber] = $episode ? [
                    'season' => $tvdbInfo['season'],
                    'episode' => $tvdbInfo['episode'],
                    'details' => [
                        'id' => $episode->id,
                        'name' => $episode->name,
                        'aired' => $episode->aired,
                        'runtime' => $episode->runtime,
                        'overview' => $episode->overview,
                        'image' => $episode->image,
                        'absolute_number' => $episode->absolute_number,
                    ]
                ] : $tvdbInfo;

                // Store mapping in database
                AnimeEpisodeMapping::updateOrCreate([
                    'anidb_id' => $anidbNumber,
                    'tvdb_series_id' => $tvdbId,
                    'is_special' => false,
                ], [
                    'anidb_episode_number' => $anidbNumber,
                    'tvdb_season_number' => $tvdbInfo['season'],
                    'tvdb_episode_number' => $tvdbInfo['episode'],
                    'tvdb_episode_id' => $episode->id,
                ]);
            }

            // Process special episodes
            $specialEpisodes = array_filter($mapping['specialEpisodes'], fn($info) => $info['episode'] !== 0);
            foreach ($specialEpisodes as $anidbNumber => $tvdbInfo) {
                $key = "{$tvdbInfo['season']}_{$tvdbInfo['episode']}";
                $episode = $episodeLookup[$key][0] ?? null;

                $enhancedMapping['specialEpisodes'][$anidbNumber] = $episode ? [
                    'season' => $tvdbInfo['season'],
                    'episode' => $tvdbInfo['episode'],
                    'details' => [
                        'id' => $episode->id,
                        'name' => $episode->name,
                        'aired' => $episode->aired,
                        'runtime' => $episode->runtime,
                        'overview' => $episode->overview,
                        'image' => $episode->image,
                        'absolute_number' => $episode->absolute_number,
                    ]
                ] : $tvdbInfo;

                // Store mapping in database
                AnimeEpisodeMapping::updateOrCreate([
                    'anidb_id' => $anidbNumber,
                    'tvdb_series_id' => $tvdbId,
                    'is_special' => true,
                ], [
                    'tvdb_season_number' => $tvdbInfo['season'],
                    'tvdb_episode_number' => $tvdbInfo['episode'],
                    'tvdb_episode_id' => $episode->id,
                ]);
            }

            return $enhancedMapping;
        });
    }
}
