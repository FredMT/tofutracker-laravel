<?php

namespace App\Services;

use Illuminate\Http\Response;
use Illuminate\Support\Facades\Http;
use Illuminate\Http\JsonResponse;

class AnimeService
{
    public function __construct(
        private readonly TvdbService $tvdbService
    ) {}


    public function getOrganizedSeasons(int $tvdbId): JsonResponse
    {
        try {
            // Cache TVDB episodes for 15 minutes
            $tvdbEpisodes = cache()->remember('tvdb_episodes_' . $tvdbId, now()->addMinutes(15), function () use ($tvdbId) {
                return $this->tvdbService->getEpisodes($tvdbId);
            });

            // Cache anime mappings for 3 hours
            $animeMappings = cache()->remember('anime_mappings_' . $tvdbId, now()->addHours(3), function () use ($tvdbId) {
                return $this->fetchAnimeMappings($tvdbId);
            });

            $seasons = $this->processAnimeMappings($animeMappings, $tvdbEpisodes);
            $seasons = $this->sortSeasons($seasons);
            [$mainSeasons, $specialSeasons] = $this->separateSeasons($seasons);

            return response()->json([
                'main_seasons' => $mainSeasons,
                'special_seasons' => $specialSeasons
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to organize seasons',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function fetchAnimeMappings(int $tvdbId): array
    {
        $response = $this->getAnimeByTvdbId($tvdbId);
        return json_decode($response->getContent(), true);
    }

    public function getAnimeByTvdbId(int $tvdbId): JsonResponse
    {
        try {
            $response = Http::get('https://raw.githubusercontent.com/Anime-Lists/anime-lists/master/anime-list-full.xml');

            if (!$response->successful()) {
                return response()->json([
                    'error' => 'Failed to fetch anime list'
                ], Response::HTTP_BAD_GATEWAY);
            }

            $xml = simplexml_load_string($response->body());


            $animeList = [];
            foreach ($xml->anime as $anime) {
                if ((string)$anime['tvdbid'] === (string)$tvdbId) {
                    $animeList[] = $this->parseAnimeElement($anime);
                }
            }

            if (empty($animeList)) {
                return response()->json([
                    'error' => 'No anime found with the provided TVDB ID'
                ], Response::HTTP_NOT_FOUND);
            }

            return response()->json($animeList);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'An error occurred while processing your request',
                'message' => $e->getMessage()
            ], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function parseAnimeElement(\SimpleXMLElement $element): array
    {
        $data = [];

        // Get all attributes
        foreach ($element->attributes() as $key => $value) {
            $this->setAttribute($data, $key, $value);
        }

        // Get all child elements
        foreach ($element->children() as $child) {
            $childName = $child->getName();

            if ($childName === 'mapping-list') {
                $data['mapping_list'] = [];
                foreach ($child->mapping as $mapping) {
                    $mappingData = [];
                    foreach ($mapping->attributes() as $key => $value) {
                        $this->setAttribute($mappingData, $key, $value);
                    }
                    if ((string)$mapping !== '') {
                        $mappingData['value'] = (string)$mapping;
                    }
                    $data['mapping_list'][] = $mappingData;
                }
            } elseif ($child->children()->count() > 0) {
                // Handle nested elements
                $nestedData = [];
                foreach ($child->children() as $nestedChild) {
                    $nestedName = $nestedChild->getName();
                    $nestedData[$nestedName] = (string)$nestedChild;
                }
                $data[$childName] = $nestedData;
            } else {
                // Handle regular child elements
                $data[$childName] = (string)$child;
            }
        }

        return $data;
    }

    private function processAnimeMappings(array $animeMappings, array $tvdbEpisodes): array
    {
        $seasons = [];

        foreach ($animeMappings as $anime) {
            $seasonData = $this->initializeSeasonData($anime);

            if (isset($anime['mapping_list'])) {
                foreach ($anime['mapping_list'] as $mapping) {
                    $this->processMapping($mapping, $seasonData, $tvdbEpisodes);
                }
            }

            $this->handleDefaultSeasonEpisodes($anime, $seasonData, $tvdbEpisodes, $animeMappings);

            $this->sortEpisodes($seasonData);

            if (!empty($seasonData['main_episodes']) || !empty($seasonData['special_episodes'])) {
                $seasons[] = $seasonData;
            }
        }

        return $seasons;
    }

    private function sortSeasons(array $seasons): array
    {
        usort($seasons, function ($a, $b) {
            $aSeasonNum = $this->getMinSeasonNumber($a);
            $bSeasonNum = $this->getMinSeasonNumber($b);

            if ($aSeasonNum === $bSeasonNum) {
                return ($a['episodeoffset'] ?? 0) <=> ($b['episodeoffset'] ?? 0)
                    ?: ($a['anidbid'] <=> $b['anidbid']);
            }

            return $aSeasonNum <=> $bSeasonNum;
        });

        return $seasons;
    }

    private function getMinSeasonNumber(array $seasonData): int
    {
        $allEpisodes = array_merge(
            $seasonData['main_episodes'],
            $seasonData['special_episodes']
        );

        if (empty($allEpisodes)) {
            return $seasonData['defaulttvdbseason'] === "a" ? -1 : (int)$seasonData['defaulttvdbseason'];
        }

        return min(array_map(fn($episode) => $episode['tvdb_episode']->seasonNumber, $allEpisodes));
    }

    private function handleDefaultSeasonEpisodes(array $anime, array &$seasonData, array $tvdbEpisodes, array $animeMappings): void
    {
        if ($anime['defaulttvdbseason'] === 0) {
            return;
        }

        $seasonNumber = $anime['defaulttvdbseason'];
        $offset = $anime['episodeoffset'] ?? 0;

        $defaultSeasonEpisodes = collect($tvdbEpisodes)
            ->filter(fn($episode) => $episode->seasonNumber === $seasonNumber);

        foreach ($defaultSeasonEpisodes as $episode) {
            if ($offset > 0 && $episode->number <= $offset) {
                continue;
            }

            $nextSeason = collect($animeMappings)->first(function ($nextAnime) use ($anime, $seasonNumber) {
                return $nextAnime['defaulttvdbseason'] === $seasonNumber
                    && $nextAnime['anidbid'] > $anime['anidbid']
                    && isset($nextAnime['episodeoffset']);
            });

            if ($nextSeason && $episode->number > $nextSeason['episodeoffset']) {
                continue;
            }

            if ($this->isEpisodeAlreadyMapped($episode, $seasonData)) {
                continue;
            }

            $seasonData['main_episodes'][] = [
                'anidb_episode' => $episode->number - $offset,
                'tvdb_episode' => $episode,
            ];
        }
    }


    private function isEpisodeAlreadyMapped($episode, array $seasonData): bool
    {
        foreach (['main_episodes', 'special_episodes'] as $category) {
            foreach ($seasonData[$category] as $mappedEpisode) {
                if (
                    $mappedEpisode['tvdb_episode']->number === $episode->number &&
                    $mappedEpisode['tvdb_episode']->seasonNumber === $episode->seasonNumber
                ) {
                    return true;
                }
            }
        }
        return false;
    }

    private function sortEpisodes(array &$seasonData): void
    {
        usort(
            $seasonData['main_episodes'],
            fn($a, $b) => ($a['tvdb_episode']->seasonNumber <=> $b['tvdb_episode']->seasonNumber) ?: ($a['tvdb_episode']->number <=> $b['tvdb_episode']->number)
        );

        usort(
            $seasonData['special_episodes'],
            fn($a, $b) => ($a['tvdb_episode']->seasonNumber <=> $b['tvdb_episode']->seasonNumber) ?: ($a['tvdb_episode']->number <=> $b['tvdb_episode']->number)
        );
    }

    private function processMapping(array $mapping, array &$seasonData, array $tvdbEpisodes): void
    {
        if (isset($mapping['value'])) {
            $this->processDirectMapping($mapping, $seasonData, $tvdbEpisodes);
        } elseif (isset($mapping['start'])) {
            $this->processRangeMapping($mapping, $seasonData, $tvdbEpisodes);
        }
    }


    private function processDirectMapping(array $mapping, array &$seasonData, array $tvdbEpisodes): void
    {
        $mappingPairs = $this->parseMappingValue($mapping['value']);

        foreach ($mappingPairs as $anidbEp => $tvdbEp) {
            if ($tvdbEp === 0) {
                continue;
            }

            $tvdbEpisode = $this->findTvdbEpisode($tvdbEpisodes, $mapping['tvdbseason'], $tvdbEp);
            if (!$tvdbEpisode) {
                continue;
            }

            $this->addEpisodeToSeason($seasonData, $mapping['anidbseason'], $anidbEp, $tvdbEpisode);
        }
    }

    private function processRangeMapping(array $mapping, array &$seasonData, array $tvdbEpisodes): void
    {
        $start = (int)$mapping['start'];
        $offset = isset($mapping['offset']) ? (int)$mapping['offset'] : 0;
        $end = isset($mapping['end']) ? (int)$mapping['end'] : $this->determineEndEpisode($mapping, $tvdbEpisodes);

        for ($anidbEp = $start; $anidbEp <= $end; $anidbEp++) {
            $tvdbEp = $anidbEp + $offset;
            $tvdbEpisode = $this->findTvdbEpisode($tvdbEpisodes, $mapping['tvdbseason'], $tvdbEp);

            if (!$tvdbEpisode) {
                continue;
            }

            $this->addEpisodeToSeason($seasonData, $mapping['anidbseason'], $anidbEp, $tvdbEpisode);
        }
    }

    private function determineEndEpisode(array $mapping, array $tvdbEpisodes): int
    {
        return collect($tvdbEpisodes)
            ->filter(fn($episode) => $episode->seasonNumber === $mapping['tvdbseason'])
            ->max('number') - ($mapping['offset'] ?? 0);
    }

    private function findTvdbEpisode(array $tvdbEpisodes, int $seasonNumber, int $episodeNumber)
    {
        return collect($tvdbEpisodes)->first(function ($episode) use ($seasonNumber, $episodeNumber) {
            return $episode->seasonNumber === $seasonNumber && $episode->number === $episodeNumber;
        });
    }

    private function addEpisodeToSeason(array &$seasonData, int $anidbseason, int $anidbEp, $tvdbEpisode): void
    {
        $episodeData = [
            'anidb_episode' => $anidbEp,
            'tvdb_episode' => $tvdbEpisode,
        ];

        if ($anidbseason === 0) {
            $seasonData['special_episodes'][] = $episodeData;
        } else {
            $seasonData['main_episodes'][] = $episodeData;
        }
    }

    private function parseMappingValue(string $value): array
    {
        $pairs = [];
        $mappings = explode(';', trim($value, ';'));

        foreach ($mappings as $mapping) {
            if (empty($mapping)) {
                continue;
            }
            [$anidbEp, $tvdbEp] = explode('-', $mapping);
            $pairs[(int)$anidbEp] = (int)$tvdbEp;
        }

        return $pairs;
    }

    private function initializeSeasonData(array $anime): array
    {
        return [
            'anidbid' => $anime['anidbid'],
            'name' => $anime['name'],
            'defaulttvdbseason' => $anime['defaulttvdbseason'],
            'episodeoffset' => $anime['episodeoffset'] ?? 0,
            'main_episodes' => [],
            'special_episodes' => []
        ];
    }

    private function setAttribute(array &$data, string $key, mixed $value): void
    {
        $strValue = (string)$value;

        // Try to convert numeric strings to appropriate number types
        if (is_numeric($strValue)) {
            if (str_contains($strValue, '.')) {
                $data[$key] = (float)$strValue;
            } else {
                $data[$key] = (int)$strValue;
            }
            // Handle boolean-like strings
        } elseif (strtolower($strValue) === 'true') {
            $data[$key] = true;
        } elseif (strtolower($strValue) === 'false') {
            $data[$key] = false;
            // Handle special case for 'movie' value
        } elseif ($key === 'tvdbid' && $strValue === 'movie') {
            $data[$key] = 'movie';
        } else {
            $data[$key] = $strValue;
        }
    }

    private function separateSeasons(array $seasons): array
    {
        $mainSeasons = [];
        $specialSeasons = [];

        foreach ($seasons as $season) {
            $seasonNumbers = array_unique(array_merge(
                array_map(fn($ep) => $ep['tvdb_episode']->seasonNumber, $season['main_episodes']),
                array_map(fn($ep) => $ep['tvdb_episode']->seasonNumber, $season['special_episodes'])
            ));

            if (empty($seasonNumbers) || (count($seasonNumbers) === 1 && $seasonNumbers[0] === 0)) {
                $specialSeasons[] = $season;
            } else {
                $mainSeasons[] = $season;
            }
        }

        $this->sortMainSeasons($mainSeasons);
        $this->sortSpecialSeasons($specialSeasons);

        return [$mainSeasons, $specialSeasons];
    }


    private function sortMainSeasons(array &$mainSeasons): void
    {
        usort($mainSeasons, function ($a, $b) {
            $aDefault = $a['defaulttvdbseason'] === "a" ? -1 : (int)$a['defaulttvdbseason'];
            $bDefault = $b['defaulttvdbseason'] === "a" ? -1 : (int)$b['defaulttvdbseason'];

            if ($aDefault !== $bDefault) {
                return $aDefault <=> $bDefault;
            }

            return ($a['episodeoffset'] ?? 0) <=> ($b['episodeoffset'] ?? 0)
                ?: ($a['anidbid'] <=> $b['anidbid']);
        });
    }

    private function sortSpecialSeasons(array &$specialSeasons): void
    {
        usort($specialSeasons, fn($a, $b) => $a['anidbid'] <=> $b['anidbid']);
    }
}
