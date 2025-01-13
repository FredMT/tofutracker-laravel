<?php

namespace App\Services;

use SimpleXMLElement;

class AnidbXmlService
{
    private const EXTERNAL_ID_TYPES = [
        '1' => 'animenewsnetwork',
        '2' => 'myanimelist',
        '6' => 'wikipedia_en',
        '7' => 'wikipedia_ja',
        '23' => 'twitter',
        '26' => 'youtube',
        '28' => 'crunchyroll',
        '32' => 'amazon_dp',
        '33' => 'baidu',
        '34' => 'tencent_video',
        '39' => 'douban',
        '41' => 'netflix',
        '42' => 'hidive',
        '43' => 'imdb',
        '44' => 'tmdb',
        '45' => 'funimation',
        '48' => 'primevideo',
    ];

    public function parseAnimeXml(string $xmlContent): array
    {
        try {
            $xml = new SimpleXMLElement($xmlContent);

            // Get ratings from the permanent rating
            $rating = 0;
            $ratingCount = 0;
            if (isset($xml->ratings->permanent)) {
                $rating = (float) ($xml->ratings->permanent ?? 0);
                $ratingCount = (int) ($xml->ratings->permanent['count'] ?? 0);
            }

            $data = [
                'anime' => [
                    'id' => (string) $xml['id'],
                    'type' => (string) ($xml->type ?? ''),
                    'episode_count' => (int) ($xml->episodecount ?? 0),
                    'startdate' => (string) ($xml->startdate ?? ''),
                    'enddate' => (string) ($xml->enddate ?? ''),
                    'title_main' => $this->findMainTitle($xml->titles),
                    'title_en' => $this->findTitle($xml->titles, 'en', 'official'),
                    'title_ja' => $this->findTitle($xml->titles, 'ja', 'official'),
                    'title_ko' => $this->findTitle($xml->titles, 'ko', 'official'),
                    'title_zh' => $this->findTitle($xml->titles, 'zh-Hans', 'official'),
                    'homepage' => (string) ($xml->url ?? ''),
                    'description' => (string) ($xml->description ?? ''),
                    'rating' => $rating,
                    'rating_count' => $ratingCount,
                    'picture' => (string) ($xml->picture ?? ''),
                ],
                'episodes' => isset($xml->episodes) ? $this->parseEpisodes($xml->episodes->episode ?? []) : [],
                'characters' => isset($xml->characters) ? $this->parseCharacters($xml->characters->character ?? []) : [],
                'related_anime' => isset($xml->relatedanime) ? $this->parseRelatedAnime($xml->relatedanime->anime ?? []) : [],
                'similar_anime' => isset($xml->similaranime) ? $this->parseSimilarAnime($xml->similaranime->anime ?? []) : [],
                'creators' => isset($xml->creators) ? $this->parseCreators($xml->creators->name ?? []) : [],
                'external_links' => isset($xml->resources) ? $this->parseExternalLinks($xml->resources->resource ?? []) : [],
            ];

            return $data;
        } catch (\Exception $e) {
            logger()->error('Error parsing anime XML: '.$e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            throw $e;
        }
    }

    private function findTitle(?SimpleXMLElement $titles, string $lang, string $type): ?string
    {
        if (! $titles) {
            return null;
        }

        // Register the XML namespace
        $titles->registerXPathNamespace('xml', 'http://www.w3.org/XML/1998/namespace');

        // Use XPath to find the title with the correct language and type
        $xpath = sprintf('//title[@xml:lang="%s" and @type="%s"]', $lang, $type);
        $result = $titles->xpath($xpath);

        return ! empty($result) ? (string) $result[0] : null;
    }

    private function findMainTitle(?SimpleXMLElement $titles): ?string
    {
        if (! $titles) {
            return null;
        }

        // Register the XML namespace
        $titles->registerXPathNamespace('xml', 'http://www.w3.org/XML/1998/namespace');

        // Use XPath to find the title with type="main"
        $result = $titles->xpath('//title[@type="main"]');

        return ! empty($result) ? (string) $result[0] : null;
    }

    private function parseEpisodes(?SimpleXMLElement $episodes): array
    {
        if (! $episodes) {
            return [];
        }

        $parsedEpisodes = [];
        foreach ($episodes as $episode) {
            $type = (string) ($episode->epno['type'] ?? '1');
            $prefix = match ($type) {
                '2' => 'S',
                '3' => 'C',
                '4' => 'T',
                '5' => 'P',
                '6' => 'O',
                default => ''
            };

            $parsedEpisodes[] = [
                'episode_id' => (string) ($episode['id'] ?? ''),
                'episode_number' => (string) ($episode->epno ?? ''),
                'type' => $type,
                'prefix' => $prefix,
                'length' => (int) ($episode->length ?? 0),
                'airdate' => (string) ($episode->airdate ?? ''),
                'title_en' => $this->findEpisodeTitle($episode->title ?? [], 'en'),
                'title_ja' => $this->findEpisodeTitle($episode->title ?? [], 'ja'),
                'summary' => (string) ($episode->summary ?? ''),
                'rating' => (float) ($episode->rating ?? 0),
                'rating_votes' => (int) ($episode->rating['votes'] ?? 0),
                'resource_type' => (string) ($episode->resources->resource['type'] ?? ''),
                'resource_identifier' => (string) ($episode->resources->resource->externalentity->identifier ?? ''),
            ];
        }

        return $parsedEpisodes;
    }

    private function parseCharacters(?SimpleXMLElement $characters): array
    {
        if (! $characters) {
            return [];
        }

        $parsedCharacters = [];
        foreach ($characters as $character) {
            $characterData = [
                'character_id' => (string) ($character['id'] ?? ''),
                'character_type' => (string) ($character['type'] ?? ''),
                'name' => (string) ($character->name ?? ''),
                'gender' => (string) ($character->gender ?? ''),
                'description' => (string) ($character->description ?? ''),
                'picture' => (string) ($character->picture ?? ''),
                'rating' => (float) ($character->rating ?? 0),
                'rating_votes' => (int) ($character->rating['votes'] ?? 0),
                'seiyuus' => [],
            ];

            if (isset($character->seiyuu)) {
                foreach ($character->seiyuu as $seiyuu) {
                    $characterData['seiyuus'][] = [
                        'seiyuu_id' => (string) ($seiyuu['id'] ?? ''),
                        'name' => (string) ($seiyuu ?? ''),
                        'picture' => (string) ($seiyuu['picture'] ?? ''),
                    ];
                }
            }
            $parsedCharacters[] = $characterData;
        }

        return $parsedCharacters;
    }

    private function parseRelatedAnime(?SimpleXMLElement $related): array
    {
        if (! $related) {
            return [];
        }

        $parsedRelated = [];
        foreach ($related as $anime) {
            $parsedRelated[] = [
                'related_anime_id' => (string) ($anime['id'] ?? ''),
                'name' => (string) ($anime ?? ''),
                'relation_type' => (string) ($anime['type'] ?? ''),
            ];
        }

        return $parsedRelated;
    }

    private function parseSimilarAnime(?SimpleXMLElement $similar): array
    {
        if (! $similar) {
            return [];
        }

        $parsedSimilar = [];
        foreach ($similar as $anime) {
            $parsedSimilar[] = [
                'similar_anime_id' => (string) ($anime['id'] ?? ''),
                'name' => (string) ($anime ?? ''),
            ];
        }

        return $parsedSimilar;
    }

    private function parseCreators(?SimpleXMLElement $creators): array
    {
        if (! $creators) {
            return [];
        }

        $parsedCreators = [];
        foreach ($creators as $creator) {
            $parsedCreators[] = [
                'creator_id' => (string) ($creator['id'] ?? ''),
                'name' => (string) ($creator ?? ''),
                'role' => (string) ($creator['type'] ?? ''),
            ];
        }

        return $parsedCreators;
    }

    private function parseExternalLinks(?SimpleXMLElement $resources): array
    {
        if (! $resources) {
            return [];
        }

        $links = [];
        foreach ($resources as $resource) {
            $type = (string) ($resource['type'] ?? '');
            if (! isset(self::EXTERNAL_ID_TYPES[$type])) {
                continue;
            }

            if (isset($resource->externalentity)) {
                foreach ($resource->externalentity as $entity) {
                    $identifier = (string) ($entity->identifier ?? '');
                    if ($identifier) {
                        $links[] = [
                            'type' => self::EXTERNAL_ID_TYPES[$type],
                            'identifier' => $identifier,
                        ];
                    }
                }
            }
        }

        return $links;
    }

    private function findEpisodeTitle(?SimpleXMLElement $titles, string $lang): ?string
    {
        if (! $titles) {
            return null;
        }

        foreach ($titles as $title) {
            if ((string) ($title['xml:lang'] ?? '') === $lang) {
                return (string) $title;
            }
        }

        return null;
    }
}
