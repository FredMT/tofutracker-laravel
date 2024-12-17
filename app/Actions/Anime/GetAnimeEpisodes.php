<?php

namespace App\Actions\Anime;

use App\Models\AnidbAnime;
use App\Jobs\SyncTvdbAnimeData;
use App\Models\AnidbEpisode;
use App\Services\TvdbService;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;
use SimpleXMLElement;
use Exception;

class GetAnimeEpisodes
{
    public function __construct(
        private readonly AnimeEpisodeMapper $mapper,
        private readonly Client $client
    ) {}

    public function execute(int $anidbid): array
    {
        return Cache::remember("anime_episodes_{$anidbid}", now()->addSeconds(1), function () use ($anidbid) {
            try {
                // First try to get episodes from XML mapping
                $animeRecord = $this->getAnimeRecord($anidbid);
                $anime = $this->fetchAnimeFromXml($anidbid);
                $tvdbId = $this->validateTvdbId($anime, $anidbid);

                $mapping = $this->mapper->mapEpisodes($anime, $animeRecord->episode_count);

                SyncTvdbAnimeData::dispatch($tvdbId);
                return $this->enhanceWithEpisodeData($mapping, $tvdbId);
            } catch (\Exception $e) {
                Log::info('Falling back to database episodes', ['anidb_id' => $anidbid]);
                return $this->getEpisodesFromDatabase($anidbid);
            }
        });
    }

    private function getEpisodesFromDatabase(int $anidbid): array
    {
        $episodes = AnidbEpisode::where('anime_id', $anidbid)
            ->orderBy('episode_number')
            ->get();

        $mainEpisodes = [];
        $specialEpisodes = [];

        foreach ($episodes as $episode) {
            $episodeData = [
                'season' => $episode->type === '1' ? 1 : 0,
                'episode' => (int) $episode->episode_number,
                'id' => $episode->episode_id,
                'name' => $episode->title_en ?? $episode->title_ja,
                'aired' => $episode->airdate,
                'runtime' => $episode->length,
                'overview' => $episode->summary,
                'image' => null,
                'absolute_number' => (int) $episode->episode_number
            ];

            if ($episode->type === '1') {
                $mainEpisodes[$episode->episode_number] = $episodeData;
            } else {
                $specialEpisodes[$episode->episode_number] = $episodeData;
            }
        }

        return [
            'mainEpisodes' => $mainEpisodes,
            'specialEpisodes' => $specialEpisodes
        ];
    }

    private function getAnimeRecord(int $anidbid): AnidbAnime
    {
        $animeRecord = AnidbAnime::find($anidbid);

        if (!$animeRecord) {
            throw new Exception('Anime not found in database');
        }

        return $animeRecord;
    }

    private function fetchAnimeFromXml(int $anidbid): SimpleXMLElement
    {
        try {
            $xml = Cache::remember('anime_list_xml_content', now()->addHours(2), function () {
                $xmlUrl = 'https://raw.githubusercontent.com/Anime-Lists/anime-lists/refs/heads/master/anime-list-full.xml';
                $response = $this->client->get($xmlUrl);

                if ($response->getStatusCode() !== 200) {
                    throw new Exception('Failed to retrieve anime list XML. Status code: ' . $response->getStatusCode());
                }

                return $response->getBody()->getContents();
            });

            libxml_use_internal_errors(true);
            $xmlObject = new SimpleXMLElement($xml);
            libxml_use_internal_errors(false);

            foreach ($xmlObject->anime as $animeElement) {
                if ((int) $animeElement['anidbid'] === $anidbid) {
                    return $animeElement;
                }
            }

            throw new Exception("Anime with anidbid {$anidbid} not found in mapping list.");
        } catch (Exception $e) {
            Log::warning('Anime not found in XML', ['searched_anidbid' => $anidbid]);
            throw $e;
        }
    }

    private function validateTvdbId(SimpleXMLElement $anime, int $anidbid): int
    {
        $tvdbId = (int) $anime['tvdbid'];
        if (!$tvdbId > 0) {
            throw new Exception("Anime with anidbid {$anidbid} has an invalid TVDB ID.");
        }
        return $tvdbId;
    }

    private function enhanceWithEpisodeData(array $mapping, int $tvdbId): array
    {
        $cacheKey = "anime_mapping_{$tvdbId}_";

        $tvdbService = app(TvdbService::class);
        $episodes = $tvdbService->getEpisodes($tvdbId);

        if (empty($episodes)) {
            return $mapping;
        }

        return Cache::remember($cacheKey, now()->addSeconds(1), function () use ($episodes, $mapping) {
            // Create episode lookup from API response (optimized)
            $episodeLookup = [];
            foreach ($episodes as $episode) {
                $key = "{$episode->seasonNumber}_{$episode->number}";
                $episodeLookup[$key] = $episode;
            }

            $enhancedMapping = [
                'mainEpisodes' => [],
                'specialEpisodes' => []
            ];

            // Process main episodes and special episodes together
            foreach (['mainEpisodes', 'specialEpisodes'] as $episodeType) {
                foreach ($mapping[$episodeType] as $key => $episodeMap) {
                    $lookupKey = "{$episodeMap['season']}_{$episodeMap['episode']}";

                    if (isset($episodeLookup[$lookupKey])) {
                        $tvdbEpisode = $episodeLookup[$lookupKey];
                        $enhancedMapping[$episodeType][$key] = array_merge($episodeMap, [
                            'name' => $tvdbEpisode->name,
                            'overview' => $tvdbEpisode->overview,
                            'aired' => $tvdbEpisode->aired,
                            'runtime' => $tvdbEpisode->runtime,
                            'image' => $tvdbEpisode->image,
                            'tvdb_id' => $tvdbEpisode->id,
                        ]);
                    } else {
                        $enhancedMapping[$episodeType][$key] = $episodeMap;
                    }
                }
            }

            Log::info($enhancedMapping);
            return $enhancedMapping;
        });
    }
}
