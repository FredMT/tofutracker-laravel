<?php

namespace App\Services;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;
use App\Models\AnidbAnime;
use App\Models\AnidbCharacter;
use App\Models\AnidbSeiyuu;
use Illuminate\Support\Facades\DB;

class AnidbService
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
        '48' => 'primevideo'
    ];
    /**
     * Get anime data from local JSON file by ID
     */
    public function getAnimeById(string $id): ?array
    {
        try {
            $path = storage_path('app/anidb/anime.json');
            if (!File::exists($path)) {
                Log::error('AniDB JSON file not found at: ' . $path);
                return null;
            }
            $jsonContent = File::get($path);
            $animeData = json_decode($jsonContent, true);
            if (isset($animeData['_id']['$oid'])) {
                return $animeData;
            }
            return null;
        } catch (\Exception $e) {
            Log::error('Error reading AniDB JSON file: ' . $e->getMessage());
            return null;
        }
    }
    /**
     * Parse anime data to match database schema
     */
    public function parseAnimeData(array $rawData): array
    {
        try {
            $anime = $rawData['anime'] ?? null;
            if (!$anime) {
                throw new \Exception('Invalid anime data structure');
            }

            $animeId = $anime['attrs']['id'];
            if (!$animeId) {
                throw new \Exception('Missing anime ID');
            }

            // Get permanent rating data
            $rating = $anime['ratings'][0]['permanent'][0]['name'] ?? 0;
            $ratingCount = $anime['ratings'][0]['permanent'][0]['attrs']['count'] ?? 0;

            // Parse titles
            $titles = $anime['titles'][0]['title'] ?? [];

            return [
                'anime' => [
                    'id' => (int)$animeId,
                    'type' => $anime['type'][0] ?? null,
                    'episode_count' => (int)($anime['episodecount'][0] ?? 0),
                    'startdate' => $anime['startdate'][0] ?? null,
                    'enddate' => $anime['enddate'][0] ?? null,
                    'title_main' => $this->findMainTitle($titles),
                    'title_en' => $this->findTitle($titles, 'en', 'official'),
                    'title_ja' => $this->findTitle($titles, 'ja', 'official'),
                    'title_ko' => $this->findTitle($titles, 'ko', 'official'),
                    'title_zh' => $this->findTitle($titles, 'zh-Hans', 'official'),
                    'homepage' => $anime['url'][0] ?? null,
                    'description' => $anime['description'][0] ?? null,
                    'rating' => (float)$rating,
                    'rating_count' => (int)$ratingCount,
                    'picture' => $anime['picture'][0] ?? null,
                ],
                'characters' => $this->parseCharacters($anime['characters'][0]['character'] ?? []),
                'episodes' => $this->parseEpisodes($anime['episodes'][0]['episode'] ?? []),
                'related_anime' => $this->parseRelatedAnime($anime['relatedanime'][0]['anime'] ?? []),
                'similar_anime' => $this->parseSimilarAnime($anime['similaranime'][0]['anime'] ?? []),
                'creators' => $this->parseCreators($anime['creators'][0]['name'] ?? []),
                'external_links' => $this->parseExternalLinks($anime['resources'][0]['resource'] ?? [])
            ];
        } catch (\Exception $e) {
            Log::error('Error parsing anime data', [
                'error' => $e->getMessage(),
                'anime_id' => $anime['attrs']['id'] ?? 'unknown'
            ]);
            throw $e;
        }
    }
    private function findMainTitle(array $titles): ?string
    {
        if (empty($titles)) {
            return null;
        }

        foreach ($titles as $title) {
            if (isset($title['attrs']['type']) && $title['attrs']['type'] === 'main') {
                return $title['name'] ?? null;
            }
        }
        return null;
    }
    private function findTitle(array $titles, string $lang, string $type): ?string
    {
        if (empty($titles)) {
            return null;
        }

        foreach ($titles as $title) {
            if (
                isset($title['attrs']) &&
                ($title['attrs']['xml:lang'] ?? '') === $lang &&
                ($title['attrs']['type'] ?? '') === $type
            ) {
                return $title['name'] ?? null;
            }
        }
        return null;
    }
    private function parseCharacters(array $characters): array
    {
        return array_map(function ($character) {
            return [
                'character_id' => $character['attrs']['id'] ?? null, // Changed from 'id' to 'character_id'
                'character_type' => $character['attrs']['type'] ?? null,
                'name' => $character['name'][0] ?? null,
                'gender' => $character['gender'][0] ?? null,
                'description' => $character['description'][0] ?? null,
                'picture' => $character['picture'][0] ?? null,
                'rating' => (float)($character['rating'][0]['name'] ?? 0),
                'rating_votes' => (int)($character['rating'][0]['attrs']['votes'] ?? 0),
                'seiyuus' => array_map(function ($seiyuu) {
                    return [
                        'seiyuu_id' => $seiyuu['attrs']['id'] ?? null, // Changed from 'id' to 'seiyuu_id'
                        'name' => $seiyuu['name'] ?? null,
                        'picture' => $seiyuu['attrs']['picture'] ?? null,
                    ];
                }, $character['seiyuu'] ?? []),
            ];
        }, $characters);
    }
    private function parseEpisodes(array $episodes): array
    {
        return array_map(function ($episode) {
            $type = $episode['epno'][0]['attrs']['type'] ?? '1';
            // Get the prefix based on episode type
            $prefix = match ($type) {
                '2' => 'S',
                '3' => 'C',
                '4' => 'T',
                '5' => 'P',
                '6' => 'O',
                default => ''
            };
            return [
                'episode_id' => $episode['attrs']['id'] ?? null,
                'episode_number' => $episode['epno'][0]['name'] ?? null,
                'type' => $type,
                'prefix' => $prefix,
                'length' => (int)($episode['length'][0] ?? 0),
                'airdate' => $episode['airdate'][0] ?? null,
                'title_en' => $this->findEpisodeTitle($episode['title'] ?? [], 'en'),
                'title_ja' => $this->findEpisodeTitle($episode['title'] ?? [], 'ja'),
                'summary' => $episode['summary'][0] ?? null,
                'rating' => $episode['rating'][0]['name'] ?? null,
                'rating_votes' => (int)($episode['rating'][0]['attrs']['votes'] ?? 0),
                'resource_type' => $episode['resources'][0]['resource'][0]['attrs']['type'] ?? null,
                'resource_identifier' => $episode['resources'][0]['resource'][0]['externalentity'][0]['identifier'][0] ?? null,
            ];
        }, $episodes);
    }
    private function findEpisodeTitle(array $titles, string $lang): ?string
    {
        foreach ($titles as $title) {
            if (($title['attrs']['xml:lang'] ?? '') === $lang) {
                return $title['name'];
            }
        }
        return null;
    }
    private function parseRelatedAnime(array $related): array
    {
        return array_map(function ($anime) {
            return [
                'related_anime_id' => $anime['attrs']['id'] ?? null,
                'name' => $anime['name'] ?? null,
                'relation_type' => $anime['attrs']['type'] ?? null,
            ];
        }, $related);
    }
    private function parseSimilarAnime(array $similar): array
    {
        return array_map(function ($anime) {
            return [
                'similar_anime_id' => $anime['attrs']['id'] ?? null,
                'name' => $anime['name'] ?? null,
            ];
        }, $similar);
    }
    private function parseCreators(array $creators): array
    {
        return array_map(function ($creator) {
            return [
                'creator_id' => $creator['attrs']['id'] ?? null,
                'name' => $creator['name'] ?? null,
                'role' => $creator['attrs']['type'] ?? null,
            ];
        }, $creators);
    }
    private function parseExternalLinks(array $resources): array
    {
        $links = [];
        foreach ($resources as $resource) {
            $type = $resource['attrs']['type'] ?? null;
            // Only process known external ID types
            if (!isset(self::EXTERNAL_ID_TYPES[$type])) {
                continue;
            }
            // Handle multiple identifiers for the same type
            foreach ($resource['externalentity'] as $entity) {
                $identifier = $entity['identifier'][0] ?? null;
                if ($identifier) {
                    $links[] = [
                        'type' => self::EXTERNAL_ID_TYPES[$type],
                        'identifier' => $identifier,
                    ];
                }
            }
        }
        return $links;
    }

    public function storeAnimeData(array $rawData): void
    {
        DB::transaction(function () use ($rawData) {
            Log::info('Parsing anime data', ['id' => $rawData['anime']['attrs']['id'] ?? null]);
            $parsedData = $this->parseAnimeData($rawData);

            // Create or update the anime record
            $anime = AnidbAnime::updateOrCreate(
                ['id' => $parsedData['anime']['id']],
                $parsedData['anime']
            );

            Log::info('Created/Updated anime record', ['id' => $anime->id]);

            // Store related data
            $this->processCharacters($anime, $parsedData['characters']);
            $this->processEpisodes($anime, $parsedData['episodes']);
            $this->processRelatedAnime($anime, $parsedData['related_anime']);
            $this->processSimilarAnime($anime, $parsedData['similar_anime']);
            $this->processCreators($anime, $parsedData['creators']);
            $this->processExternalLinks($anime, $parsedData['external_links']);
        });
    }

    private function processCharacters(AnidbAnime $anime, array $characters): void
    {
        foreach ($characters as $characterData) {
            try {
                $seiyuus = $characterData['seiyuus'] ?? [];
                unset($characterData['seiyuus']);

                // Create or update character
                $character = $anime->characters()->updateOrCreate(
                    ['character_id' => $characterData['character_id']],
                    $characterData
                );

                // Process seiyuus for this character
                $this->processSeiyuus($character, $seiyuus);
            } catch (\Exception $e) {
                Log::error('Error processing character', [
                    'character_id' => $characterData['character_id'] ?? 'unknown',
                    'error' => $e->getMessage()
                ]);
                continue;
            }
        }
    }

    private function processSeiyuus(AnidbCharacter $character, array $seiyuus): void
    {
        $seiyuuIds = [];

        foreach ($seiyuus as $seiyuuData) {
            try {
                if (empty($seiyuuData['seiyuu_id']) || empty($seiyuuData['name'])) {
                    Log::warning('Skipping invalid seiyuu data', [
                        'seiyuu_data' => $seiyuuData,
                        'character_id' => $character->id
                    ]);
                    continue;
                }

                $seiyuu = AnidbSeiyuu::updateOrCreate(
                    ['seiyuu_id' => $seiyuuData['seiyuu_id']],
                    $seiyuuData
                );

                $seiyuuIds[] = $seiyuu->id;
            } catch (\Exception $e) {
                Log::error('Error processing seiyuu', [
                    'seiyuu_data' => $seiyuuData,
                    'character_id' => $character->id,
                    'error' => $e->getMessage()
                ]);
                continue;
            }
        }

        if (!empty($seiyuuIds)) {
            try {
                $character->seiyuus()->sync($seiyuuIds);
            } catch (\Exception $e) {
                Log::error('Error syncing seiyuus for character', [
                    'character_id' => $character->id,
                    'seiyuu_ids' => $seiyuuIds,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    private function processEpisodes(AnidbAnime $anime, array $episodes): void
    {
        foreach ($episodes as $episodeData) {
            try {
                $anime->episodes()->updateOrCreate(
                    ['episode_id' => $episodeData['episode_id']],
                    $episodeData
                );
            } catch (\Exception $e) {
                Log::error('Error processing episode', [
                    'episode_id' => $episodeData['episode_id'] ?? 'unknown',
                    'anime_id' => $anime->id,
                    'error' => $e->getMessage()
                ]);
                continue;
            }
        }
    }

    private function processRelatedAnime(AnidbAnime $anime, array $relatedAnime): void
    {
        foreach ($relatedAnime as $relatedData) {
            try {
                $anime->relatedAnime()->updateOrCreate(
                    ['related_anime_id' => $relatedData['related_anime_id']],
                    $relatedData
                );
            } catch (\Exception $e) {
                Log::error('Error processing related anime', [
                    'related_anime_id' => $relatedData['related_anime_id'] ?? 'unknown',
                    'anime_id' => $anime->id,
                    'error' => $e->getMessage()
                ]);
                continue;
            }
        }
    }

    private function processSimilarAnime(AnidbAnime $anime, array $similarAnime): void
    {
        foreach ($similarAnime as $similarData) {
            try {
                $anime->similarAnime()->updateOrCreate(
                    ['similar_anime_id' => $similarData['similar_anime_id']],
                    $similarData
                );
            } catch (\Exception $e) {
                Log::error('Error processing similar anime', [
                    'similar_anime_id' => $similarData['similar_anime_id'] ?? 'unknown',
                    'anime_id' => $anime->id,
                    'error' => $e->getMessage()
                ]);
                continue;
            }
        }
    }

    private function processCreators(AnidbAnime $anime, array $creators): void
    {
        foreach ($creators as $creatorData) {
            try {
                $anime->creators()->updateOrCreate(
                    ['creator_id' => $creatorData['creator_id']],
                    $creatorData
                );
            } catch (\Exception $e) {
                Log::error('Error processing creator', [
                    'creator_id' => $creatorData['creator_id'] ?? 'unknown',
                    'anime_id' => $anime->id,
                    'error' => $e->getMessage()
                ]);
                continue;
            }
        }
    }

    private function processExternalLinks(AnidbAnime $anime, array $links): void
    {
        foreach ($links as $linkData) {
            try {
                $anime->externalLinks()->updateOrCreate(
                    [
                        'type' => $linkData['type'],
                        'identifier' => $linkData['identifier']
                    ],
                    $linkData
                );
            } catch (\Exception $e) {
                Log::error('Error processing external link', [
                    'type' => $linkData['type'] ?? 'unknown',
                    'anime_id' => $anime->id,
                    'error' => $e->getMessage()
                ]);
                continue;
            }
        }
    }
}
