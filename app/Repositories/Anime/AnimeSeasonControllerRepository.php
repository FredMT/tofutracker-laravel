<?php

namespace App\Repositories\Anime;

use App\Models\Anidb\AnidbAnime;
use App\Models\Anime\AnimeChainEntry;
use App\Models\Anime\AnimeMap;
use App\Models\Anime\AnimeMappingExternalId;
use App\Models\Anime\AnimeRelatedEntry;
use App\Models\UserAnime\UserAnime;
use App\Services\TmdbService;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Auth;

class AnimeSeasonControllerRepository
{
    public function __construct(private TmdbService $tmdbService)
    {
        $this->tmdbService = $tmdbService;
    }

    public function verifySeasonRelationship(int $accessId, int $seasonId): bool
    {
        $hasRelatedEntry = AnimeMap::where('id', $accessId)
            ->whereHas('relatedEntries', function ($query) use ($seasonId) {
                $query->where('anime_id', $seasonId);
            })
            ->exists();

        $hasChainEntry = AnimeMap::where('id', $accessId)
            ->whereHas('chains.entries', function ($query) use ($seasonId) {
                $query->where('anime_id', $seasonId);
            })
            ->exists();

        return $hasRelatedEntry || $hasChainEntry;
    }

    public function getAnimeType(int $seasonId): ?string
    {
        return AnidbAnime::where('id', $seasonId)->value('type');
    }

    public function getAnimeWithRelations(int $seasonId): AnidbAnime
    {
        $anime = AnidbAnime::with([
            'characters.seiyuus',
            'relatedAnime.relatedEntry',
            'relatedAnime.chainEntry.chain',
            'relatedAnime.relatedAnime',
            'similarAnime.relatedEntry',
            'similarAnime.chainEntry.chain',
            'similarAnime.similarAnime',
            'creators',
            'externalLinks',
        ])->findOrFail($seasonId);

        $anime->setAttribute('mapped_episodes', $anime->mappedEpisodes());

        return $anime;
    }

    public function getExternalIds(int $seasonId): ?AnimeMappingExternalId
    {
        return AnimeMappingExternalId::where('anidb_id', $seasonId)
            ->select([
                'mal_id',
                'themoviedb_id',
                'thetvdb_id',
                'livechart_id',
                'anime_planet_id',
                'imdb_id',
            ])
            ->first();
    }

    public function getTmdbImages(int $seasonId): ?array
    {
        return $this->tmdbService->getBackdropAndLogoForAnidbId($seasonId);
    }

    public function getUserAnime(int $seasonId): ?UserAnime
    {
        return UserAnime::with('episodes')
            ->whereHas('collection', function ($query) {
                $query->whereHas('userLibrary', function ($query) {
                    $query->where('user_id', Auth::id());
                });
            })
            ->where('anidb_id', $seasonId)
            ->select(['id', 'watch_status', 'rating'])
            ->first();
    }

    public function getChainEntry(int $seasonId): ?AnimeChainEntry
    {
        return AnimeChainEntry::with(['chain', 'anime'])
            ->whereHas('anime', function ($query) use ($seasonId) {
                $query->where('id', $seasonId);
            })
            ->first();
    }

    public function getChainEntries(int $chainId): Collection
    {
        return AnimeChainEntry::with(['anime'])
            ->where('chain_id', $chainId)
            ->orderBy('sequence_order')
            ->get();
    }

    public function getRelatedEntry(int $seasonId): ?AnimeRelatedEntry
    {
        return AnimeRelatedEntry::with(['anime'])
            ->where('anime_id', $seasonId)
            ->first();
    }

    public function getRelatedEntries(int $accessId): Collection
    {
        return AnimeRelatedEntry::with(['anime'])
            ->where('map_id', $accessId)
            ->get();
    }

    public function getAnimeMap(int $accessId): ?AnimeMap
    {
        return AnimeMap::find($accessId);
    }

    public function formatDate(?string $date): ?string
    {
        if (empty($date) || $date === '1970-01-01T00:00:00.000000Z') {
            return null;
        }

        try {
            return Carbon::parse($date)->format('jS F, Y');
        } catch (\Exception $e) {
            return null;
        }
    }
}
