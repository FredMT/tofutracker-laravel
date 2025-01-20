<?php

namespace App\Actions\Anime;

use SimpleXMLElement;

class AnimeEpisodeMapper
{
    public function mapEpisodes(SimpleXMLElement $anime, int $episodeCount): array
    {
        $tvdbSeason = (string) $anime->attributes()['defaulttvdbseason'];
        $episodeOffset = (int) ($anime->attributes()['episodeoffset'] ?? 0);
        $mappingList = $anime->{'mapping-list'}?->mapping;

        $mainEpisodes = [];
        $specialEpisodes = [];

        // Handle Special Episodes
        if ($mappingList) {
            foreach ($mappingList as $mapping) {
                $anidbSeason = (int) $mapping->attributes()['anidbseason'];
                $tvdbSpecialSeason = (int) $mapping->attributes()['tvdbseason'];
                $individualMappings = (string) $mapping;

                if ($anidbSeason === 0) { // Special Seasons
                    if (! empty($individualMappings)) {
                        $mappings = explode(';', trim($individualMappings, ';'));
                        foreach ($mappings as $map) {
                            [$anidbEp, $tvdbEp] = explode('-', $map);
                            $specialEpisodes[(int) $anidbEp] = [
                                'season' => $tvdbSpecialSeason,
                                'episode' => (int) $tvdbEp,
                            ];
                        }
                    }
                }
            }
        }

        // Handle Main Episodes for "a" defaulttvdbseason
        if ($tvdbSeason !== 'a') {
            $tvdbSeason = (int) $tvdbSeason;
            for ($i = 1; $i <= $episodeCount; $i++) {
                $mainEpisodes[$i] = [
                    'season' => $tvdbSeason,
                    'episode' => $i + $episodeOffset,
                ];
            }
        }

        if ($mappingList) {
            foreach ($mappingList as $mapping) {
                $anidbSeason = (int) $mapping->attributes()['anidbseason'];
                $tvdbMainSeason = (int) $mapping->attributes()['tvdbseason'];
                $start = (int) ($mapping->attributes()['start'] ?? 0);
                $end = (int) ($mapping->attributes()['end'] ?? 0);
                $offset = (int) ($mapping->attributes()['offset'] ?? 0);
                $individualMappings = (string) $mapping;

                if ($anidbSeason === 1) { // Main Episodes
                    if (! empty($individualMappings)) {
                        $mappings = explode(';', trim($individualMappings, ';'));
                        foreach ($mappings as $map) {
                            if (empty($map)) {
                                continue;
                            }

                            [$anidbEp, $tvdbEp] = explode('-', $map);
                            // If tvdbEp is 0, skip this mapping
                            if ((int) $tvdbEp === 0) {
                                continue;
                            }

                            // Check if this TVDB episode already exists in mainEpisodes
                            $tvdbEpisodeExists = false;
                            foreach ($mainEpisodes as $existingEpisode) {
                                if (
                                    $existingEpisode['season'] === $tvdbMainSeason &&
                                    $existingEpisode['episode'] === (int) $tvdbEp
                                ) {
                                    $tvdbEpisodeExists = true;
                                    break;
                                }
                            }

                            // Only add if this TVDB episode hasn't been mapped yet
                            if (! $tvdbEpisodeExists) {
                                $mainEpisodes[(int) $anidbEp] = [
                                    'season' => $tvdbMainSeason,
                                    'episode' => (int) $tvdbEp,
                                ];
                            }
                        }
                    } elseif ($start > 0) { // Handle ranges with start and optional end
                        $loopEnd = ($end > 0) ? $end : $episodeCount; // Use $episodeCount if end is not set
                        for ($i = $start; $i <= $loopEnd; $i++) {
                            if (isset($mainEpisodes[$i])) {
                                $mainEpisodes[$i] = [
                                    'season' => $tvdbMainSeason,
                                    'episode' => $i + $offset,
                                ];
                            } else {
                                $mainEpisodes[$i] = [
                                    'season' => $tvdbMainSeason,
                                    'episode' => $i + $offset,
                                ];
                            }
                        }
                    }
                }
            }
        }

        // Handle Default Mapping
        if ($tvdbSeason === 'a') {
            if (empty($mainEpisodes)) { // Check if $mainEpisodes is empty
                for ($i = 1; $i <= $episodeCount; $i++) {
                    $mainEpisodes[$i] = [
                        'season' => 1, // Default season is always 1 when defaulttvdbseason is 'a'
                        'episode' => $i,
                    ];
                }
            } else {
                $minAnidbEp = min(array_keys($mainEpisodes));
                if ($minAnidbEp > 1) {
                    for ($i = 1; $i < $minAnidbEp; $i++) { // Corrected loop condition
                        if (! isset($mainEpisodes[$i])) {
                            $mainEpisodes[$i] = [
                                'season' => 1,
                                'episode' => $i,
                            ];
                        }
                    }
                }
            }
        }

        ksort($mainEpisodes);

        return [
            'mainEpisodes' => $mainEpisodes,
            'specialEpisodes' => $specialEpisodes,
        ];
    }
}
