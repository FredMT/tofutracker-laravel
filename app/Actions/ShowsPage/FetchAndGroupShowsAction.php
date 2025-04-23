<?php

namespace App\Actions\ShowsPage;

use App\Models\TvShow;
use Carbon\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class FetchAndGroupShowsAction
{
    private int $maxShowsPerProvider = 20;

    private int $minVoteCount = 50;

    private int $initialLimit = 500;

    private array $excludedGenreIds;

    private string $contentType = TvShow::class;

    private string $animeMapType = 'tv';

    private string $providerType = 'flatrate';

    public function __construct()
    {
        $this->excludedGenreIds = Config::get('genres.excluded_tv_ids', [99, 10751, 10762, 10763, 10764, 10766, 10767, 10770]);
    }

    public function execute(string $countryCode = 'US'): array
    {
        try {
            $showsById = $this->fetchAndProcessInitialShows();
            if (empty($showsById)) {
                return [];
            }

            logger(json_encode($showsById));

            $providerDataRaw = $this->fetchProviderData($countryCode, $showsById);
            if ($providerDataRaw->isEmpty()) {
                Log::info('No providers found for filtered shows.', ['country' => $countryCode, 'action' => __CLASS__]);

                return [];
            }

            $providersWithShowsRaw = $this->groupShowsByProvider($providerDataRaw, $showsById);
            $mergeConfig = $this->processMergeConfig();
            $providersWithShowsRaw = $this->mergeProviders($providersWithShowsRaw, $mergeConfig['processedMergeMap']);
            $finalProvidersList = $this->buildFinalProviderList(
                $providersWithShowsRaw,
                $mergeConfig['mainProviderIdsFromConfig'],
                $mergeConfig['orderedMainProviderIds']
            );

            return $finalProvidersList;
        } catch (\Illuminate\Database\QueryException $ex) {
            Log::error('DB Error in FetchAndGroupShowsAction: '.$ex->getMessage(), ['exception' => $ex, 'sql' => $ex->getSql() ?? 'N/A', 'bindings' => $ex->getBindings() ?? []]);

            return [];
        } catch (\Throwable $ex) {
            Log::error('General Error in FetchAndGroupShowsAction: '.$ex->getMessage(), ['exception' => $ex]);

            return [];
        }
    }

    private function fetchAndProcessInitialShows(): array
    {
        $genrePlaceholders = implode(',', array_fill(0, count($this->excludedGenreIds), '?'));
        $sqlShows = <<<SQL
        WITH top_popular_shows AS (
            SELECT id, data, popularity, vote_average, vote_count
            FROM tv_shows
            WHERE popularity IS NOT NULL AND vote_count > ? ORDER BY popularity DESC LIMIT ?
        )
        SELECT 
            tps.id, 
            tps.popularity, 
            tps.vote_average, 
            tps.vote_count,
            tps.data->>'name' as name,
            tps.data->>'poster_path' as poster_path,
            tps.data->>'first_air_date' as first_air_date,
            tps.data->>'last_air_date' as last_air_date
        FROM top_popular_shows tps
        WHERE
            NOT EXISTS (SELECT 1 FROM anime_maps am WHERE am.most_common_tmdb_id = tps.id AND am.tmdb_type = ?)
        AND NOT EXISTS (SELECT 1 FROM anime_mapping_external_ids amei WHERE amei.themoviedb_id = tps.id)
        AND NOT EXISTS (
                SELECT 1 FROM tmdb_content_genres tcg
                WHERE tcg.content_id = tps.id AND tcg.content_type = ?
                AND tcg.genre_id IN ({$genrePlaceholders})
            );
        SQL;
        $bindingsShows = array_merge([
            $this->minVoteCount,
            $this->initialLimit,
            $this->animeMapType,
            $this->contentType,
        ], $this->excludedGenreIds);

        $showsResult = DB::select($sqlShows, $bindingsShows);
        if (empty($showsResult)) {
            Log::info('No initial shows found from DB.', ['action' => __CLASS__]);

            return [];
        }

        $showsById = $this->processShowResultsWithDirectData($showsResult);
        if (empty($showsById)) {
            Log::info('No shows remaining after poster filtering.', ['action' => __CLASS__]);

            return [];
        }
        Log::info('Shows processed/filtered.', ['count' => count($showsById), 'action' => __CLASS__]);

        return $showsById;
    }

    private function processShowResultsWithDirectData(array $showsResult): array
    {
        $showsById = [];
        foreach ($showsResult as $show) {
            if (empty($show->poster_path)) {
                continue;
            }
            $yearString = $this->calculateYearString($show->first_air_date, $show->last_air_date, $show->id);
            $rating = $show->vote_average !== null ? round((float) $show->vote_average, 1) : null;
            $showsById[$show->id] = [
                'id' => $show->id,
                'name' => $show->name,
                'poster' => $show->poster_path,
                'rating' => $rating,
                'year' => $yearString,
                'popularity' => $show->popularity,
            ];
        }

        return $showsById;
    }

    private function fetchProviderData(string $countryCode, array $showsById): Collection
    {
        $showIds = array_keys($showsById);
        $providerDataRaw = DB::table('tmdb_content_providers as tcp')
            ->join('tmdb_providers as tp', 'tcp.provider_id', '=', 'tp.id')
            ->where('tcp.content_type', $this->contentType)
            ->where('tcp.country_code', $countryCode)
            ->where('tcp.provider_type', $this->providerType)
            ->whereIn('tcp.content_id', $showIds)
            ->select('tcp.content_id', 'tcp.provider_id', 'tp.name as provider_name', 'tp.logo_path as provider_logo_path')
            ->get();
        Log::info('Provider data fetched.', ['count' => $providerDataRaw->count(), 'country' => $countryCode, 'action' => __CLASS__]);

        return $providerDataRaw;
    }

    private function groupShowsByProvider(Collection $providerDataRaw, array $showsById): array
    {
        $providersWithShowsRaw = [];
        foreach ($providerDataRaw as $providerEntry) {
            $providerId = $providerEntry->provider_id;
            $showId = $providerEntry->content_id;
            if (! isset($showsById[$showId])) {
                continue;
            }
            if (! isset($providersWithShowsRaw[$providerId])) {
                $providersWithShowsRaw[$providerId] = [
                    'provider_id' => $providerId,
                    'provider_name' => $providerEntry->provider_name,
                    'provider_type' => $this->providerType,
                    'shows' => [],
                    'show_ids' => [],
                ];
            }
            if (! isset($providersWithShowsRaw[$providerId]['show_ids'][$showId])) {
                $providersWithShowsRaw[$providerId]['shows'][] = $showsById[$showId];
                $providersWithShowsRaw[$providerId]['show_ids'][$showId] = true;
            }
        }
        Log::info('Initial provider grouping complete.', ['count' => count($providersWithShowsRaw), 'action' => __CLASS__]);

        return $providersWithShowsRaw;
    }

    private function processMergeConfig(): array
    {
        $processedMergeMap = [];
        $mainProviderIdsFromConfig = [];
        $orderedMainProviderIds = [];
        $rawMergeMapConfig = \Illuminate\Support\Facades\Config::get('providers.merge_map', []);
        foreach ($rawMergeMapConfig as $key => $value) {
            $mainId = null;
            $relatedIds = [];
            if (is_int($key) && is_array($value)) {
                $mainId = $key;
                $relatedIds = $value;
            } elseif (is_int($value) && is_numeric($key)) {
                $mainId = $value;
            } else {
                Log::warning('Skipping invalid config entry.', ['key' => $key, 'value' => $value]);

                continue;
            }
            if (! is_int($mainId) || $mainId <= 0) {
                Log::warning('Invalid main ID in config.', ['id' => $mainId]);

                continue;
            }
            $processedMergeMap[$mainId] = $relatedIds;
            $mainProviderIdsFromConfig[$mainId] = true;
            $orderedMainProviderIds[] = $mainId;
        }
        Log::debug('Provider config map processed.', ['main_ids_count' => count($mainProviderIdsFromConfig), 'action' => __CLASS__]);

        return [
            'processedMergeMap' => $processedMergeMap,
            'mainProviderIdsFromConfig' => $mainProviderIdsFromConfig,
            'orderedMainProviderIds' => $orderedMainProviderIds,
        ];
    }

    private function mergeProviders(array $providersWithShowsRaw, array $processedMergeMap): array
    {
        foreach ($processedMergeMap as $mainProviderId => $relatedProviderIds) {
            if (empty($relatedProviderIds)) {
                continue;
            }
            if (! isset($providersWithShowsRaw[$mainProviderId])) {
                continue;
            }
            foreach ($relatedProviderIds as $relatedProviderId) {
                if (isset($providersWithShowsRaw[$relatedProviderId])) {
                    foreach ($providersWithShowsRaw[$relatedProviderId]['shows'] as $showToMerge) {
                        $showIdToMerge = $showToMerge['id'];
                        if (! isset($providersWithShowsRaw[$mainProviderId]['show_ids'][$showIdToMerge])) {
                            $providersWithShowsRaw[$mainProviderId]['shows'][] = $showToMerge;
                            $providersWithShowsRaw[$mainProviderId]['show_ids'][$showIdToMerge] = true;
                        }
                    }
                    unset($providersWithShowsRaw[$relatedProviderId]);
                }
            }
        }
        Log::info('Provider merging complete.', ['count_after_merge' => count($providersWithShowsRaw), 'action' => __CLASS__]);

        return $providersWithShowsRaw;
    }

    private function buildFinalProviderList(array $providersWithShowsRaw, array $mainProviderIdsFromConfig, array $orderedMainProviderIds): array
    {
        $processedProviders = [];
        foreach ($providersWithShowsRaw as $providerId => $providerData) {
            if (! isset($mainProviderIdsFromConfig[$providerId])) {
                continue;
            }
            $providerData['shows'] = $this->sortAndFillProviderShows($providerData);
            unset($providerData['show_ids'], $providerData['provider_type']);
            if (! empty($providerData['shows'])) {
                $processedProviders[$providerId] = $providerData;
            }
        }
        $finalProvidersList = [];
        foreach ($orderedMainProviderIds as $mainId) {
            if (isset($processedProviders[$mainId])) {
                $finalProvidersList[] = $processedProviders[$mainId];
            }
        }
        Log::info('Final provider list created and ordered.', ['final_count' => count($finalProvidersList), 'action' => __CLASS__]);

        return $finalProvidersList;
    }

    private function sortAndFillProviderShows(array $providerData): array
    {
        usort($providerData['shows'], fn ($a, $b) => ($b['popularity'] ?? 0) <=> ($a['popularity'] ?? 0));
        $currentShowCount = count($providerData['shows']);
        if ($currentShowCount < $this->maxShowsPerProvider) {
            $neededCount = $this->maxShowsPerProvider - $currentShowCount;
            $existingShowIds = array_column($providerData['shows'], 'id');
            $fillShows = $this->fetchFillShows(
                $providerData['provider_id'],
                $this->contentType,
                $providerData['country_code'] ?? 'US',
                $this->providerType,
                $this->minVoteCount,
                $existingShowIds,
                $neededCount
            );
            if (! empty($fillShows)) {
                $providerData['shows'] = array_merge($providerData['shows'], $fillShows);
            }
        }
        $providerData['shows'] = array_slice($providerData['shows'], 0, $this->maxShowsPerProvider);
        foreach ($providerData['shows'] as $index => $show) {
            unset($providerData['shows'][$index]['popularity']);
        }

        return $providerData['shows'];
    }

    private function fetchFillShows(
        int $providerId,
        string $contentType,
        string $countryCode,
        string $providerType,
        int $minVoteCount,
        array $excludeShowIds,
        int $limit
    ): array {
        if ($limit <= 0) {
            return [];
        }

        $excludePlaceholders = '';
        $bindings = [
            $providerId,
            $contentType,
            $countryCode,
            $providerType,
            $minVoteCount,
        ];

        if (! empty($excludeShowIds)) {
            $excludePlaceholders = implode(',', array_fill(0, count($excludeShowIds), '?'));
            $bindings = array_merge($bindings, $excludeShowIds);
        }

        $bindings[] = $limit;

        $sqlFill = '
            SELECT
                ts.id,
                ts.data->>\'name\' as name,
                ts.data->>\'poster_path\' as poster_path,
                ts.data->>\'first_air_date\' as first_air_date,
                ts.data->>\'last_air_date\' as last_air_date,
                ts.vote_average,
                ts.popularity
            FROM tmdb_content_providers tcp
            JOIN tv_shows ts ON tcp.content_id = ts.id
            WHERE tcp.provider_id = ?
              AND tcp.content_type = ?
              AND tcp.country_code = ?
              AND tcp.provider_type = ?
              AND ts.vote_count >= ?
        ';

        if (! empty($excludeShowIds)) {
            $sqlFill .= " AND ts.id NOT IN ({$excludePlaceholders})";
        }

        $sqlFill .= '
            ORDER BY ts.popularity DESC
            LIMIT ?
        ';

        try {
            $fillResults = DB::select($sqlFill, $bindings);
            $processedFillShows = [];
            foreach ($fillResults as $show) {
                $posterPath = $show->poster_path;
                if (empty($posterPath)) {
                    continue;
                }
                $firstAirDateStr = $show->first_air_date;
                $lastAirDateStr = $show->last_air_date;
                $yearString = $this->calculateYearString($firstAirDateStr, $lastAirDateStr, $show->id);
                $rating = $show->vote_average !== null ? round((float) $show->vote_average, 1) : null;
                $processedFillShows[] = [
                    'id' => $show->id,
                    'name' => $show->name,
                    'poster' => $posterPath,
                    'rating' => $rating,
                    'year' => $yearString,
                ];
            }

            return $processedFillShows;
        } catch (\Illuminate\Database\QueryException $ex) {
            Log::error('DB Error fetching fill shows: '.$ex->getMessage(), ['provider_id' => $providerId, 'sql' => $sqlFill, 'bindings' => $bindings, 'exception' => $ex]);

            return [];
        } catch (\Throwable $ex) {
            Log::error('General error fetching fill shows: '.$ex->getMessage(), ['provider_id' => $providerId, 'exception' => $ex]);

            return [];
        }
    }

    private function calculateYearString(?string $firstAirDateStr, ?string $lastAirDateStr, int $showId): ?string
    {
        $firstYear = null;
        $lastYear = null;
        try {
            if (! empty($firstAirDateStr)) {
                $firstYear = Carbon::parse($firstAirDateStr)->year;
            }
            if (! empty($lastAirDateStr)) {
                $lastYear = Carbon::parse($lastAirDateStr)->year;
            }

            if ($firstYear && $lastYear) {
                return ($firstYear === $lastYear) ? (string) $firstYear : "{$firstYear}-{$lastYear}";
            } elseif ($firstYear) {
                return (string) $firstYear;
            }

            return null;
        } catch (\Exception $e) {
            Log::warning('Could not parse air dates for year string (helper).', ['show_id' => $showId, 'first' => $firstAirDateStr, 'last' => $lastAirDateStr, 'error' => $e->getMessage()]);

            return null;
        }
    }
}
