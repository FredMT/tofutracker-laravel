<?php

namespace App\Actions\ShowsPage;

use App\Models\TvShow;
use Carbon\Carbon;
use Illuminate\Support\Arr;
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

    private array $showsById = [];

    private array $providersWithShowsRaw = [];

    private array $processedMergeMap = [];

    private array $mainProviderIdsFromConfig = [];

    private array $orderedMainProviderIds = [];

    public function __construct()
    {
        $this->excludedGenreIds = Config::get('genres.excluded_tv_ids', [99, 10751, 10762, 10763, 10764, 10766, 10767, 10770]);
    }

    public function execute(string $countryCode = 'US'): array
    {
        try {
            if (! $this->fetchAndProcessInitialShows()) {
                return [];
            }

            $providerDataRaw = $this->fetchProviderData($countryCode);
            if ($providerDataRaw->isEmpty()) {
                Log::info('No providers found for filtered shows.', ['country' => $countryCode, 'action' => __CLASS__]);

                return [];
            }

            $this->groupShowsByProvider($providerDataRaw);

            $this->preprocessConfigAndMergeProviders();

            return $this->finalizeProviderList();

        } catch (\Illuminate\Database\QueryException $ex) {
            Log::error('DB Error in FetchAndGroupShowsAction: '.$ex->getMessage(), ['exception' => $ex, 'sql' => $ex->getSql() ?? 'N/A', 'bindings' => $ex->getBindings() ?? []]);

            return [];
        } catch (\Throwable $ex) {
            Log::error('General Error in FetchAndGroupShowsAction: '.$ex->getMessage(), ['exception' => $ex]);

            return [];
        }
    }

    private function fetchAndProcessInitialShows(): bool
    {
        $genrePlaceholders = implode(',', array_fill(0, count($this->excludedGenreIds), '?'));
        $sqlShows = <<<SQL
        WITH top_popular_shows AS (
            SELECT id, data, popularity, vote_average, vote_count
            FROM tv_shows
            WHERE popularity IS NOT NULL AND vote_count > ? ORDER BY popularity DESC LIMIT ?
        )
        SELECT tps.id, tps.data, tps.popularity, tps.vote_average, tps.vote_count
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
        $bindingsShows = array_merge([$this->minVoteCount, $this->initialLimit, $this->animeMapType, $this->contentType], $this->excludedGenreIds);

        $showsResult = DB::select($sqlShows, $bindingsShows);
        if (empty($showsResult)) {
            Log::info('No initial shows found from DB.', ['action' => __CLASS__]);

            return false;
        }

        foreach ($showsResult as $show) {
            $jsonData = json_decode($show->data ?? '{}', true);
            $posterPath = Arr::get($jsonData, 'poster_path');
            if (empty($posterPath)) {
                continue;
            }

            $firstAirDateStr = Arr::get($jsonData, 'first_air_date');
            $lastAirDateStr = Arr::get($jsonData, 'last_air_date');
            $yearString = $this->calculateYearString($firstAirDateStr, $lastAirDateStr, $show->id);
            $rating = $show->vote_average !== null ? round((float) $show->vote_average, 1) : null;

            $this->showsById[$show->id] = ['id' => $show->id, 'name' => Arr::get($jsonData, 'name'), 'poster' => $posterPath,
                'rating' => $rating, 'year' => $yearString, 'popularity' => $show->popularity,
            ];
        }

        if (empty($this->showsById)) {
            Log::info('No shows remaining after poster filtering.', ['action' => __CLASS__]);

            return false;
        }

        Log::info('Shows processed/filtered.', ['count' => count($this->showsById), 'action' => __CLASS__]);

        return true;
    }

    private function fetchProviderData(string $countryCode): \Illuminate\Support\Collection
    {
        $showIds = array_keys($this->showsById);
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

    private function groupShowsByProvider(\Illuminate\Support\Collection $providerDataRaw): void
    {
        $this->providersWithShowsRaw = [];
        foreach ($providerDataRaw as $providerEntry) {
            $providerId = $providerEntry->provider_id;
            $showId = $providerEntry->content_id;
            if (! isset($this->showsById[$showId])) {
                continue;
            }
            if (! isset($this->providersWithShowsRaw[$providerId])) {
                $this->providersWithShowsRaw[$providerId] = ['provider_id' => $providerId, 'provider_name' => $providerEntry->provider_name,
                    'provider_logo_path' => $providerEntry->provider_logo_path, 'provider_type' => $this->providerType,
                    'shows' => [], 'show_ids' => [],
                ];
            }
            if (! isset($this->providersWithShowsRaw[$providerId]['show_ids'][$showId])) {
                $this->providersWithShowsRaw[$providerId]['shows'][] = $this->showsById[$showId];
                $this->providersWithShowsRaw[$providerId]['show_ids'][$showId] = true;
            }
        }
        Log::info('Initial provider grouping complete.', ['count' => count($this->providersWithShowsRaw), 'action' => __CLASS__]);
    }

    private function preprocessConfigAndMergeProviders(): void
    {
        $this->processedMergeMap = [];
        $this->mainProviderIdsFromConfig = [];
        $this->orderedMainProviderIds = [];

        $rawMergeMapConfig = Config::get('providers.merge_map', []);
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

            $this->processedMergeMap[$mainId] = $relatedIds;
            $this->mainProviderIdsFromConfig[$mainId] = true;
            $this->orderedMainProviderIds[] = $mainId;
        }
        Log::debug('Provider config map processed.', ['main_ids_count' => count($this->mainProviderIdsFromConfig), 'action' => __CLASS__]);

        foreach ($this->processedMergeMap as $mainProviderId => $relatedProviderIds) {
            if (empty($relatedProviderIds)) {
                continue;
            }
            if (! isset($this->providersWithShowsRaw[$mainProviderId])) {
                continue;
            }
            foreach ($relatedProviderIds as $relatedProviderId) {
                if (isset($this->providersWithShowsRaw[$relatedProviderId])) {
                    foreach ($this->providersWithShowsRaw[$relatedProviderId]['shows'] as $showToMerge) {
                        $showIdToMerge = $showToMerge['id'];
                        if (! isset($this->providersWithShowsRaw[$mainProviderId]['show_ids'][$showIdToMerge])) {
                            $this->providersWithShowsRaw[$mainProviderId]['shows'][] = $showToMerge;
                            $this->providersWithShowsRaw[$mainProviderId]['show_ids'][$showIdToMerge] = true;
                        }
                    }
                    unset($this->providersWithShowsRaw[$relatedProviderId]);
                }
            }
        }
        Log::info('Provider merging complete.', ['count_after_merge' => count($this->providersWithShowsRaw), 'action' => __CLASS__]);
    }

    private function finalizeProviderList(): array
    {
        $processedProviders = [];
        foreach ($this->providersWithShowsRaw as $providerId => $providerData) {
            if (! isset($this->mainProviderIdsFromConfig[$providerId])) {
                continue;
            }

            usort($providerData['shows'], fn ($a, $b) => ($b['popularity'] ?? 0) <=> ($a['popularity'] ?? 0));

            $currentShowCount = count($providerData['shows']);
            if ($currentShowCount < $this->maxShowsPerProvider) {
                $neededCount = $this->maxShowsPerProvider - $currentShowCount;
                $existingShowIds = array_column($providerData['shows'], 'id');

                $fillShows = $this->fetchFillShows(
                    $providerId,
                    $this->contentType, $providerData['country_code'] ?? 'US', $this->providerType, $this->minVoteCount, $existingShowIds,
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

            unset($providerData['show_ids'], $providerData['provider_type']);

            if (! empty($providerData['shows'])) {
                $processedProviders[$providerId] = $providerData;
            }
        }

        $finalProvidersList = [];
        foreach ($this->orderedMainProviderIds as $mainId) {
            if (isset($processedProviders[$mainId])) {
                $finalProvidersList[] = $processedProviders[$mainId];
            }
        }

        Log::info('Final provider list created and ordered.', ['final_count' => count($finalProvidersList), 'action' => __CLASS__]);

        return $finalProvidersList;
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
                ts.data,
                ts.vote_average
                -- ts.popularity -- Only needed if re-sorting combined list later
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

                $jsonData = json_decode($show->data ?? '{}', true);
                $posterPath = Arr::get($jsonData, 'poster_path');
                if (empty($posterPath)) {
                    continue;
                }

                $firstAirDateStr = Arr::get($jsonData, 'first_air_date');
                $lastAirDateStr = Arr::get($jsonData, 'last_air_date');
                $yearString = $this->calculateYearString($firstAirDateStr, $lastAirDateStr, $show->id);
                $rating = $show->vote_average !== null ? round((float) $show->vote_average, 1) : null;

                $processedFillShows[] = [
                    'id' => $show->id,
                    'name' => Arr::get($jsonData, 'name'),
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
