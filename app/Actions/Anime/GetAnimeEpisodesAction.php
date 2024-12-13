<?php

namespace App\Actions\Anime;

use App\Models\TvdbAnimeEpisode;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Http;
use SimpleXMLElement;

class GetAnimeEpisodesAction
{
    private const XML_URL = 'https://raw.githubusercontent.com/Anime-Lists/anime-lists/master/anime-list-full.xml';

    private int $currentAnidbId;

    public function execute(int $anidbId): array
    {
        $this->currentAnidbId = $anidbId;
        $animeMapping = $this->getAnimeMapping($anidbId);
        if (!$animeMapping) {
            return [
                'success' => false,
                'message' => 'Anime not found'
            ];
        }

        $tvdbId = $animeMapping['tvdbid'];

        // Get all episodes from database
        $allEpisodes = TvdbAnimeEpisode::query()
            ->where('series_id', $tvdbId)
            ->orderBy('season_number')
            ->orderBy('number')
            ->get();

        $mainEpisodes = collect();
        $specialEpisodes = collect();

        // Process special episode mappings first
        foreach ($animeMapping['mappings'] as $mapping) {
            if ($mapping['anidbseason'] === 0) {
                $this->processSpecialMappings($mapping, $allEpisodes, $specialEpisodes);
            }
        }

        // Process main episode mappings
        foreach ($animeMapping['mappings'] as $mapping) {
            if ($mapping['anidbseason'] === 1) {
                $this->processMainMappings($mapping, $allEpisodes, $mainEpisodes);
            }
        }

        // Process default season episodes if not already mapped
        if ($animeMapping['defaulttvdbseason'] !== '0') {
            $this->processDefaultSeasonEpisodes(
                (int)$animeMapping['defaulttvdbseason'],
                (int)$animeMapping['episodeoffset'],
                $allEpisodes,
                $mainEpisodes
            );
        }

        // Sort main episodes by anidb_episode before returning
        $mainEpisodes = $mainEpisodes->sortBy('anidb_episode');
        $specialEpisodes = $specialEpisodes->sortBy('anidb_episode');

        return [
            'main_episodes' => $mainEpisodes->values()->all(),
            'special_episodes' => $specialEpisodes->values()->all()
        ];
    }

    private function processSpecialMappings(array $mapping, Collection $allEpisodes, Collection &$specialEpisodes): void
    {
        if (isset($mapping['episodes'])) {
            foreach ($mapping['episodes'] as $episodeMap) {
                $anidbEp = $episodeMap['anidb'];
                foreach ($episodeMap['tvdb'] as $tvdbEpNum) {
                    $episode = $allEpisodes->first(function ($ep) use ($mapping, $tvdbEpNum) {
                        return $ep->season_number === $mapping['tvdbseason']
                            && $ep->number === $tvdbEpNum;
                    });

                    if ($episode) {
                        $specialEpisodes->push([
                            'anidb_episode' => $anidbEp,
                            'episode' => $episode
                        ]);
                    }
                }
            }
        }
    }

    private function processMainMappings(array $mapping, Collection $allEpisodes, Collection &$mainEpisodes): void
    {
        if (isset($mapping['start'])) {
            $start = $mapping['start'];
            $end = $mapping['end'];
            $offset = $mapping['offset'] ?? 0;

            for ($anidbEp = $start; $anidbEp <= $end; $anidbEp++) {
                $tvdbEpNum = $anidbEp + $offset;

                $episode = $allEpisodes->first(function ($ep) use ($mapping, $tvdbEpNum) {
                    return $ep->season_number === $mapping['tvdbseason']
                        && $ep->number === $tvdbEpNum;
                });

                if ($episode) {
                    $mainEpisodes->push([
                        'anidb_episode' => $anidbEp,
                        'episode' => $episode
                    ]);
                }
            }
        }
    }

    private function processDefaultSeasonEpisodes(
        int $defaultSeason,
        int $offset,
        Collection $allEpisodes,
        Collection &$mainEpisodes
    ): void {
        $seasonEpisodes = $allEpisodes->filter(function ($episode) use ($defaultSeason) {
            return $episode->season_number === $defaultSeason;
        });

        // Get the next mapping with same defaulttvdbseason and higher anidbid
        $nextOffset = $this->getNextOffset($defaultSeason);

        foreach ($seasonEpisodes as $episode) {
            // Skip if episode is already mapped
            if ($mainEpisodes->contains('episode.id', $episode->id)) {
                continue;
            }

            // Skip episodes before offset
            if ($offset > 0 && $episode->number <= $offset) {
                continue;
            }

            // Skip episodes that belong to next mapping
            if ($nextOffset && $episode->number > $nextOffset) {
                continue;
            }

            $mainEpisodes->push([
                'anidb_episode' => $episode->number - $offset,
                'episode' => $episode
            ]);
        }
    }

    private function getNextOffset(int $defaultSeason): ?int
    {
        $xml = $this->fetchXml();
        $currentAnidbId = $this->currentAnidbId;

        foreach ($xml->anime as $anime) {
            if (
                (string)$anime['defaulttvdbseason'] === (string)$defaultSeason
                && (int)$anime['anidbid'] > $currentAnidbId
                && isset($anime['episodeoffset'])
            ) {
                return (int)$anime['episodeoffset'];
            }
        }

        return null;
    }

    private function getAnimeMapping(int $anidbId): ?array
    {
        $xml = $this->fetchXml();
        $animeElement = $this->findAnimeElement($xml, $anidbId);

        if (!$animeElement) {
            return null;
        }

        return [
            'anidbid' => (int)$animeElement['anidbid'],
            'tvdbid' => (string)$animeElement['tvdbid'],
            'name' => (string)$animeElement->name,
            'defaulttvdbseason' => (string)$animeElement['defaulttvdbseason'],
            'episodeoffset' => (string)$animeElement['episodeoffset'] ?: '0',
            'mappings' => $this->extractMappings($animeElement),
        ];
    }

    /**
     * Fetch and parse the XML file
     */
    private function fetchXml(): SimpleXMLElement
    {
        $response = Http::get(self::XML_URL);

        if (!$response->successful()) {
            throw new \RuntimeException('Failed to fetch anime list XML');
        }

        return simplexml_load_string($response->body());
    }

    /**
     * Find the anime element with matching AniDB ID
     */
    private function findAnimeElement(SimpleXMLElement $xml, int $anidbId): ?SimpleXMLElement
    {
        foreach ($xml->anime as $anime) {
            if ((int)$anime['anidbid'] === $anidbId) {
                return $anime;
            }
        }
        return null;
    }

    /**
     * Parse the mapping data from an anime element
     */
    private function parseMapping(SimpleXMLElement $anime): array
    {
        $result = [
            'success' => true,
            'anidbid' => (int)$anime['anidbid'],
            'tvdbid' => (string)$anime['tvdbid'],
            'name' => (string)$anime->name,
            'defaulttvdbseason' => (string)$anime['defaulttvdbseason'],
            'episodeoffset' => (string)$anime['episodeoffset'] ?: '0',
            'mappings' => [],
            'supplemental' => []
        ];

        // Parse mapping list if exists
        if (isset($anime->{'mapping-list'})) {
            foreach ($anime->{'mapping-list'}->mapping as $mapping) {
                $mappingData = [
                    'anidbseason' => (int)$mapping['anidbseason'],
                    'tvdbseason' => (int)$mapping['tvdbseason'],
                ];

                // Parse individual episode mappings
                if ((string)$mapping) {
                    $mappingData['episodes'] = $this->parseEpisodeMappings((string)$mapping);
                }

                // Add offset mapping if exists
                if (isset($mapping['offset'])) {
                    $mappingData['offset'] = (int)$mapping['offset'];
                }
                if (isset($mapping['start'])) {
                    $mappingData['start'] = (int)$mapping['start'];
                }
                if (isset($mapping['end'])) {
                    $mappingData['end'] = (int)$mapping['end'];
                }

                $result['mappings'][] = $mappingData;
            }
        }

        // Parse supplemental info if exists
        if (isset($anime->{'supplemental-info'})) {
            foreach ($anime->{'supplemental-info'}->children() as $key => $value) {
                $result['supplemental'][$key] = (string)$value;
            }
        }

        return $result;
    }

    /**
     * Parse individual episode mappings from a mapping string
     */
    private function parseEpisodeMappings(string $mappingStr): array
    {
        $mappings = [];

        // Remove starting/ending semicolons and split
        $mappingStr = trim($mappingStr, ';');
        $pairs = explode(';', $mappingStr);

        foreach ($pairs as $pair) {
            if (empty($pair)) continue;

            // Split into source and target episodes
            [$anidb, $tvdb] = explode('-', $pair);

            // Handle multiple target episodes (e.g., "1-2+3")
            $tvdbEpisodes = explode('+', $tvdb);

            $mappings[] = [
                'anidb' => (int)$anidb,
                'tvdb' => array_map('intval', $tvdbEpisodes)
            ];
        }

        return $mappings;
    }

    private function extractMappings(SimpleXMLElement $anime): array
    {
        $mappings = [];

        if (isset($anime->{'mapping-list'})) {
            foreach ($anime->{'mapping-list'}->mapping as $mapping) {
                $mappingData = [
                    'anidbseason' => (int)$mapping['anidbseason'],
                    'tvdbseason' => (int)$mapping['tvdbseason'],
                ];

                if ((string)$mapping) {
                    $mappingData['episodes'] = $this->parseEpisodeMappings((string)$mapping);
                }

                if (isset($mapping['start'])) {
                    $mappingData['start'] = (int)$mapping['start'];
                    $mappingData['end'] = (int)$mapping['end'];
                    if (isset($mapping['offset'])) {
                        $mappingData['offset'] = (int)$mapping['offset'];
                    }
                }

                $mappings[] = $mappingData;
            }
        }

        return $mappings;
    }
}
