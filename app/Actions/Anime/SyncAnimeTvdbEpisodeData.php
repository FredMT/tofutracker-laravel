<?php

namespace App\Actions\Anime;

use App\Jobs\SyncAnimeEpisodeMappings;
use App\Jobs\SyncTvdbAnimeData;
use App\Models\Anidb\AnidbAnime;
use App\Services\TvdbService;
use Exception;
use GuzzleHttp\Client;
use Illuminate\Support\Facades\Bus;
use Illuminate\Support\Facades\Cache;
use SimpleXMLElement;

class SyncAnimeTvdbEpisodeData
{
    public function __construct(
        private readonly AnimeEpisodeMapper $mapper,
        private readonly Client $client
    ) {}

    public function execute(int $anidbid): void
    {
        try {
            $animeRecord = $this->getAnimeRecord($anidbid);
            $anime = $this->fetchAnimeFromXml($anidbid);
            $tvdbId = $this->validateTvdbId($anime, $anidbid);

            $mapping = $this->mapper->mapEpisodes($anime, $animeRecord->episode_count);
            $enhancedMapping = $this->enhanceWithEpisodeData($mapping, $tvdbId);

            Bus::chain([
                new SyncTvdbAnimeData($tvdbId),
                new SyncAnimeEpisodeMappings($anidbid, $tvdbId, $enhancedMapping),
            ])->dispatch();

            logger()->info('Successfully synced TVDB episode data', ['anidb_id' => $anidbid]);
        } catch (\Exception $e) {
            logger()->error('Failed to sync TVDB episode data', ['anidb_id' => $anidbid]);
            logger()->error($e->getMessage());
            logger()->error($e->getTraceAsString());
        }
    }

    private function getAnimeRecord(int $anidbid): AnidbAnime
    {
        $animeRecord = AnidbAnime::find($anidbid);

        if (! $animeRecord) {
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
                    throw new Exception('Failed to retrieve anime list XML. Status code: '.$response->getStatusCode());
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
            logger()->warning('Anime not found in XML', ['searched_anidbid' => $anidbid]);
            throw new Exception("Anime with anidbid {$anidbid} not found in mapping list.");
        }
    }

    private function validateTvdbId(SimpleXMLElement $anime, int $anidbid): int
    {
        $tvdbId = (int) $anime['tvdbid'];
        if (! $tvdbId > 0) {
            throw new Exception("Anime with anidbid {$anidbid} has an invalid TVDB ID.");
        }

        return $tvdbId;
    }

    private function enhanceWithEpisodeData(array $mapping, int $tvdbId): array
    {
        $tvdbService = app(TvdbService::class);
        $episodes = $tvdbService->getEpisodes($tvdbId);

        if (empty($episodes)) {
            return $mapping;
        }

        // Create episode lookup from API response (optimized)
        $episodeLookup = [];
        foreach ($episodes as $episode) {
            $key = "{$episode->seasonNumber}_{$episode->number}";
            $episodeLookup[$key] = $episode;
        }

        $enhancedMapping = [
            'mainEpisodes' => [],
            'specialEpisodes' => [],
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

        return $enhancedMapping;
    }
}
