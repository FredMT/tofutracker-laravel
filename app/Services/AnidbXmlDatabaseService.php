<?php

namespace App\Services;

use App\Models\AnidbAnime;
use App\Models\AnidbCharacter;
use App\Models\AnidbSeiyuu;
use Illuminate\Support\Facades\DB;

class AnidbXmlDatabaseService
{
    private AnidbXmlService $xmlService;

    public function __construct(AnidbXmlService $xmlService)
    {
        $this->xmlService = $xmlService;
    }

    public function processXmlContent(string $xmlContent): void
    {
        try {


            $parsedData = $this->xmlService->parseAnimeXml($xmlContent);

            DB::beginTransaction();

            // Create or update anime record
            $anime = $this->processAnime($parsedData['anime']);

            // Process related data
            $this->processCharacters($anime, $parsedData['characters']);
            $this->processEpisodes($anime, $parsedData['episodes']);
            $this->processRelatedAnime($anime, $parsedData['related_anime']);
            $this->processSimilarAnime($anime, $parsedData['similar_anime']);
            $this->processCreators($anime, $parsedData['creators']);
            $this->processExternalLinks($anime, $parsedData['external_links']);

            DB::commit();
            logger()->info('Successfully processed anime XML', ['anime_id' => $anime->id]);
        } catch (\Exception $e) {
            DB::rollBack();
            logger()->error('Error processing anime XML', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    private function processAnime(array $data): AnidbAnime
    {
        try {
            return AnidbAnime::updateOrCreate(
                ['id' => $data['id']],
                [
                    'type' => $data['type'],
                    'episode_count' => $data['episode_count'],
                    'startdate' => (isset($data['startdate']) && trim($data['startdate']) !== '') ? $data['startdate'] : null,
                    'enddate' => (isset($data['enddate']) && trim($data['enddate']) !== '') ? $data['enddate'] : null,
                    'title_main' => $data['title_main'],
                    'title_en' => $data['title_en'] ?? null,
                    'title_ja' => $data['title_ja'] ?? null,
                    'title_ko' => $data['title_ko'] ?? null,
                    'title_zh' => $data['title_zh'] ?? null,
                    'homepage' => $data['homepage'],
                    'description' => $data['description'],
                    'rating' => $data['rating'],
                    'rating_count' => $data['rating_count'],
                    'picture' => $data['picture']
                ]
            );
        } catch (\Exception $e) {
            logger()->error('Error processing anime record', [
                'data' => $data,
                'error' => $e->getMessage()
            ]);
            throw $e;
        }
    }

    private function processCharacters(AnidbAnime $anime, array $characters): void
    {
        foreach ($characters as $characterData) {
            try {
                // Create or update character
                $character = $anime->characters()->updateOrCreate(
                    ['character_id' => $characterData['character_id']],
                    [
                        'character_type' => $characterData['character_type'],
                        'name' => $characterData['name'],
                        'gender' => $characterData['gender'],
                        'description' => $characterData['description'],
                        'picture' => $characterData['picture'],
                        'rating' => $characterData['rating'],
                        'rating_votes' => $characterData['rating_votes']
                    ]
                );

                // Process seiyuus for this character
                $this->processSeiyuus($character, $characterData['seiyuus'] ?? []);
            } catch (\Exception $e) {
                logger()->error('Error processing character', [
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
                    logger()->warning('Skipping invalid seiyuu data', [
                        'seiyuu_data' => $seiyuuData,
                        'character_id' => $character->id
                    ]);
                    continue;
                }

                $seiyuu = AnidbSeiyuu::updateOrCreate(
                    ['seiyuu_id' => $seiyuuData['seiyuu_id']],
                    [
                        'name' => $seiyuuData['name'],
                        'picture' => $seiyuuData['picture'] ?? null
                    ]
                );

                $seiyuuIds[] = $seiyuu->id;
            } catch (\Exception $e) {
                logger()->error('Error processing seiyuu', [
                    'seiyuu_data' => $seiyuuData,
                    'character_id' => $character->id,
                    'error' => $e->getMessage()
                ]);
                continue;
            }
        }

        // Sync seiyuus for this character
        if (!empty($seiyuuIds)) {
            try {
                $character->seiyuus()->sync($seiyuuIds);
            } catch (\Exception $e) {
                logger()->error('Error syncing seiyuus for character', [
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
                    [
                        'episode_number' => $episodeData['episode_number'],
                        'type' => $episodeData['type'],
                        'prefix' => $episodeData['prefix'],
                        'length' => $episodeData['length'],
                        'airdate' => (isset($data['airdate']) && trim($data['airdate']) !== '') ? $data['airdate'] : null,
                        'title_en' => $episodeData['title_en'],
                        'title_ja' => $episodeData['title_ja'],
                        'summary' => $episodeData['summary'],
                        'rating' => $episodeData['rating'],
                        'rating_votes' => $episodeData['rating_votes'],
                        'resource_type' => $episodeData['resource_type'],
                        'resource_identifier' => $episodeData['resource_identifier']
                    ]
                );
            } catch (\Exception $e) {
                logger()->error('Error processing episode', [
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
                    [
                        'name' => $relatedData['name'],
                        'relation_type' => $relatedData['relation_type']
                    ]
                );
            } catch (\Exception $e) {
                logger()->error('Error processing related anime', [
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
                    [
                        'name' => $similarData['name']
                    ]
                );
            } catch (\Exception $e) {
                logger()->error('Error processing similar anime', [
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
                    [
                        'name' => $creatorData['name'],
                        'role' => $creatorData['role']
                    ]
                );
            } catch (\Exception $e) {
                logger()->error('Error processing creator', [
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
                if (!in_array($linkData['type'], $this->getAllowedExternalLinkTypes())) {
                    logger()->warning('Skipping invalid external link type', [
                        'type' => $linkData['type'],
                        'anime_id' => $anime->id
                    ]);
                    continue;
                }

                $anime->externalLinks()->updateOrCreate(
                    [
                        'type' => $linkData['type'],
                        'identifier' => $linkData['identifier']
                    ],
                );
            } catch (\Exception $e) {
                logger()->error('Error processing external link', [
                    'type' => $linkData['type'] ?? 'unknown',
                    'anime_id' => $anime->id,
                    'error' => $e->getMessage()
                ]);
                continue;
            }
        }
    }

    private function getAllowedExternalLinkTypes(): array
    {
        return [
            'animenewsnetwork',
            'myanimelist',
            'wikipedia_en',
            'wikipedia_ja',
            'twitter',
            'youtube',
            'crunchyroll',
            'amazon_dp',
            'baidu',
            'tencent_video',
            'douban',
            'netflix',
            'hidive',
            'imdb',
            'tmdb',
            'funimation',
            'primevideo'
        ];
    }
}
