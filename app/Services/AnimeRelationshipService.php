<?php

namespace App\Services;

use App\Models\AnidbAnime;
use App\Models\AnimeMap;
use Illuminate\Support\Facades\Log;

class AnimeRelationshipService
{
    private array $visitedIds = [];
    private array $prequelSequelChains = [];
    private array $otherRelatedIds = [];
    private array $processedChainIds = [];
    private array $relationshipMap = [];
    private int $requestCount = 0;
    private const MAX_REQUESTS = 10;

    /**
     * Get all recursively related anime IDs for a given anime ID, grouped by relation type
     * Returns the response with the most total IDs found
     */
    public function getRelatedAnimeIds(int $animeId, array &$processedIds = [], int $depth = 0): array
    {
        Log::info("Processing ID: " . $animeId);

        // First check if this ID exists in any existing map's data
        $existingMaps = AnimeMap::all();
        foreach ($existingMaps as $map) {
            // Check prequel_sequel_chains first
            $chainIds = [];
            foreach ($map->data['prequel_sequel_chains'] as $chain) {
                $chainIds = array_merge($chainIds, $chain);
                if (in_array($animeId, $chain)) {
                    Log::info("Found ID in prequel/sequel chain");
                    return array_merge(['source_id' => $animeId], $map->data);
                }
            }

            // If we haven't found it in any chain but it's in other_related_ids
            if (in_array($animeId, $map->data['other_related_ids'])) {
                Log::info("Found ID in other_related_ids");
                return array_merge(['source_id' => $animeId], $map->data);
            }
        }

        if (in_array($animeId, $processedIds) || $depth > 2 || $this->requestCount >= self::MAX_REQUESTS) {
            return [];
        }

        $processedIds[] = $animeId;
        $this->requestCount++;

        // Reset instance variables
        $this->visitedIds = [];
        $this->prequelSequelChains = [];
        $this->otherRelatedIds = [];
        $this->processedChainIds = [];
        $this->relationshipMap = [];

        // Build initial relationship map
        $this->buildRelationshipMap($animeId);
        $rootId = $this->findRootPrequel($animeId);
        Log::info("Root ID found: " . $rootId);

        // Process from root
        $this->visitedIds = [$rootId];
        $this->findAllRelatedIds($rootId, false);

        foreach ($this->visitedIds as $id) {
            if (!in_array($id, $this->processedChainIds)) {
                $this->buildCompleteChain($id);
            }
        }

        $chainIds = [];
        foreach ($this->prequelSequelChains as $chain) {
            $chainIds = array_merge($chainIds, $chain);
        }
        $chainIds = array_unique($chainIds);

        // Only process recursive calls for chain IDs
        $allResults = [];
        foreach ($chainIds as $chainId) {
            if ($chainId !== $animeId && !in_array($chainId, $processedIds)) {
                $result = $this->getRelatedAnimeIds($chainId, $processedIds, $depth + 1);
                if (!empty($result)) {
                    $allResults[] = $result;
                }
            }
        }

        $currentResult = [
            'prequel_sequel_chains' => array_values($this->prequelSequelChains),
            'other_related_ids' => array_values(array_diff(array_unique($this->otherRelatedIds), $chainIds))
        ];

        if (empty($allResults)) {
            if ($depth === 0) {  // Only store if we're at the root level
                $lastMap = AnimeMap::orderBy('access_id', 'desc')->first();
                $nextAccessId = $lastMap ? $lastMap->access_id + 1 : 100;

                Log::info("Creating new map with access_id: " . $nextAccessId);
                AnimeMap::create([
                    'access_id' => $nextAccessId,
                    'data' => $currentResult
                ]);
            }
            return array_merge(['source_id' => $animeId], $currentResult);
        }

        // Find the result with the most data
        $bestResult = $this->getResultWithMostIds($allResults);

        // Only store at depth 0 and only store once
        if ($depth === 0 && !empty($bestResult)) {
            $lastMap = AnimeMap::orderBy('access_id', 'desc')->first();
            $nextAccessId = $lastMap ? $lastMap->access_id + 1 : 100;

            Log::info("Creating new map with access_id: " . $nextAccessId);
            AnimeMap::create([
                'access_id' => $nextAccessId,
                'data' => [
                    'prequel_sequel_chains' => $bestResult['prequel_sequel_chains'],
                    'other_related_ids' => $bestResult['other_related_ids']
                ]
            ]);
        }

        return array_merge(['source_id' => $animeId], $bestResult);
    }

    /**
     * Build complete relationship map for all connected anime
     */
    private function buildRelationshipMap(int $animeId): void
    {
        if (isset($this->relationshipMap[$animeId])) {
            return;
        }

        $relations = AnidbAnime::find($animeId)
            ->relatedAnime()
            ->select(['related_anime_id', 'relation_type'])
            ->get();

        $this->relationshipMap[$animeId] = [];

        foreach ($relations as $relation) {
            $this->relationshipMap[$animeId][] = [
                'id' => $relation->related_anime_id,
                'type' => $relation->relation_type
            ];

            // Don't traverse "Other" relationships
            if (strtolower($relation->relation_type) !== 'other') {
                $this->buildRelationshipMap($relation->related_anime_id);
            }
        }
    }

    /**
     * Find the root prequel by analyzing the relationship map
     */
    private function findRootPrequel(int $animeId): int
    {
        $potentialRoots = $this->findPotentialRoots($animeId);

        if (empty($potentialRoots)) {
            return $animeId;
        }

        // If there's only one potential root, return it
        if (count($potentialRoots) === 1) {
            return $potentialRoots[0];
        }

        // Find the root with the longest prequel-sequel chain
        $longestChainLength = 0;
        $rootWithLongestChain = $animeId;

        foreach ($potentialRoots as $rootId) {
            $chainLength = $this->calculateChainLength($rootId);
            if ($chainLength > $longestChainLength) {
                $longestChainLength = $chainLength;
                $rootWithLongestChain = $rootId;
            }
        }

        // If no prequel-sequel chains found, look for Parent Story
        if ($longestChainLength === 0) {
            foreach ($potentialRoots as $rootId) {
                if ($this->isParentStory($rootId, $animeId)) {
                    return $rootId;
                }
            }
        }

        return $rootWithLongestChain;
    }

    /**
     * Find all potential root prequels from the relationship map
     */
    private function findPotentialRoots(int $animeId, array $visited = []): array
    {
        $visited[] = $animeId;
        $roots = [];

        if (!isset($this->relationshipMap[$animeId])) {
            return [$animeId];
        }

        $hasPrequel = false;
        foreach ($this->relationshipMap[$animeId] as $relation) {
            if (in_array($relation['id'], $visited)) {
                continue;
            }

            if (strtolower($relation['type']) === 'prequel') {
                $hasPrequel = true;
                $roots = array_merge($roots, $this->findPotentialRoots($relation['id'], $visited));
            }
        }

        // If no prequels found, this might be a root
        if (!$hasPrequel) {
            $roots[] = $animeId;
        }

        return array_unique($roots);
    }

    /**
     * Calculate the length of prequel-sequel chain starting from given ID
     */
    private function calculateChainLength(int $startId): int
    {
        $visited = [$startId];
        $length = 1;
        $currentId = $startId;

        // Count sequels
        while (true) {
            $hasSequel = false;
            foreach ($this->relationshipMap[$currentId] ?? [] as $relation) {
                if (strtolower($relation['type']) === 'sequel' && !in_array($relation['id'], $visited)) {
                    $visited[] = $relation['id'];
                    $currentId = $relation['id'];
                    $length++;
                    $hasSequel = true;
                    break;
                }
            }
            if (!$hasSequel) break;
        }

        return $length;
    }

    /**
     * Check if given ID is a Parent Story of another ID
     */
    private function isParentStory(int $potentialParentId, int $childId): bool
    {
        foreach ($this->relationshipMap[$potentialParentId] ?? [] as $relation) {
            if ($relation['id'] === $childId && strtolower($relation['type']) === 'parent story') {
                return true;
            }
        }
        return false;
    }

    /**
     * Build complete prequel/sequel chain by traversing both up and down
     */
    private function buildCompleteChain(int $animeId): void
    {
        $chain = [];
        $processedIds = [];
        $idsToProcess = [$animeId];

        // First, traverse up to find all prequels
        while (!empty($idsToProcess)) {
            $currentId = array_shift($idsToProcess);
            if (in_array($currentId, $processedIds)) continue;

            $prequels = AnidbAnime::find($currentId)
                ->relatedAnime()
                ->where('relation_type', 'Prequel')
                ->get();

            foreach ($prequels as $prequel) {
                if (
                    !in_array($prequel->related_anime_id, $processedIds) &&
                    !in_array($prequel->related_anime_id, $this->processedChainIds)
                ) {
                    array_unshift($chain, $prequel->related_anime_id);
                    $idsToProcess[] = $prequel->related_anime_id;
                }
            }
            $processedIds[] = $currentId;
        }

        // Add the source ID if not already in chain
        if (!in_array($animeId, $chain)) {
            $chain[] = $animeId;
        }

        // Reset for sequel traversal
        $processedIds = [];
        $idsToProcess = [$animeId];

        // Then traverse down to find all sequels
        while (!empty($idsToProcess)) {
            $currentId = array_shift($idsToProcess);
            if (in_array($currentId, $processedIds)) continue;

            $sequels = AnidbAnime::find($currentId)
                ->relatedAnime()
                ->where('relation_type', 'Sequel')
                ->get();

            foreach ($sequels as $sequel) {
                if (
                    !in_array($sequel->related_anime_id, $processedIds) &&
                    !in_array($sequel->related_anime_id, $this->processedChainIds)
                ) {
                    $chain[] = $sequel->related_anime_id;
                    $idsToProcess[] = $sequel->related_anime_id;
                }
            }
            $processedIds[] = $currentId;
        }

        if (count($chain) > 1) {
            $this->prequelSequelChains[] = $chain;
            // Mark all IDs in this chain as processed
            foreach ($chain as $id) {
                $this->processedChainIds[] = $id;
            }
        }
    }

    /**
     * Find all related IDs first
     */
    private function findAllRelatedIds(int $animeId, bool $isSameSettingPath): void
    {
        foreach ($this->relationshipMap[$animeId] ?? [] as $relation) {
            if (in_array($relation['id'], $this->visitedIds)) {
                continue;
            }

            $this->visitedIds[] = $relation['id'];
            $relationType = strtolower($relation['type']);

            // Add all non-prequel/sequel relations to other_related_ids
            if (!in_array($relationType, ['prequel', 'sequel'])) {
                $this->otherRelatedIds[] = $relation['id'];
            }

            // Don't traverse "Other" relationships but continue for everything else
            if ($relationType !== 'other') {
                $this->findAllRelatedIds($relation['id'], $isSameSettingPath);
            }
        }
    }

    /**
     * Find the result with the most data
     */
    private function getResultWithMostIds(array $results): array
    {
        $maxDataCount = 0;
        $bestResult = [];

        foreach ($results as $result) {
            $dataCount = count($result['prequel_sequel_chains']) + count($result['other_related_ids']);
            if ($dataCount > $maxDataCount) {
                $maxDataCount = $dataCount;
                $bestResult = $result;
            }
        }

        return $bestResult;
    }
}
