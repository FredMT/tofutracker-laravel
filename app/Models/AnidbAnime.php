<?php

namespace App\Models;

use App\Actions\Anime\GetAnimeEpisodes;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Znck\Eloquent\Relations\BelongsToThrough;

class AnidbAnime extends Model
{
    use \Znck\Eloquent\Traits\BelongsToThrough;
    protected $table = 'anidb_anime';
    protected $hidden = ['created_at', 'updated_at'];

    protected $fillable = [
        'id',
        'type',
        'episode_count',
        'startdate',
        'enddate',
        'title_main',
        'title_en',
        'title_ja',
        'title_ko',
        'title_zh',
        'homepage',
        'description',
        'rating',
        'rating_count',
        'picture'
    ];

    protected $casts = [
        'startdate' => 'date',
        'enddate' => 'date',
        'rating' => 'decimal:2',
        'rating_count' => 'integer',
        'episode_count' => 'integer'
    ];

    protected function title(): Attribute
    {
        return Attribute::get(
            fn() => $this->title_main
        );
    }

    public function poster(): Attribute
    {
        return Attribute::get(function () {
            return $this->picture;
        });
    }

    public function characters(): HasMany
    {
        return $this->hasMany(AnidbCharacter::class, 'anime_id');
    }

    public function episodes(): HasMany
    {
        return $this->hasMany(AnidbEpisode::class, 'anime_id');
    }

    public function relatedAnime(): HasMany
    {
        return $this->hasMany(AnidbRelatedAnime::class, 'anime_id');
    }

    public function similarAnime(): HasMany
    {
        return $this->hasMany(AnidbSimilarAnime::class, 'anime_id');
    }

    public function creators(): HasMany
    {
        return $this->hasMany(AnidbCreator::class, 'anime_id');
    }

    public function externalLinks(): HasMany
    {
        return $this->hasMany(AnidbExternalLink::class, 'anime_id');
    }

    public function mappedEpisodes()
    {
        return app(GetAnimeEpisodes::class)->execute($this->id);
    }

    public function relatedEntries(): HasMany
    {
        return $this->hasMany(AnimeRelatedEntry::class, 'anime_id');
    }

    public function chainEntries(): HasMany
    {
        return $this->hasMany(AnimeChainEntry::class, 'anime_id');
    }

    public function relatedEntryMap(): BelongsToThrough
    {
        return $this->belongsToThrough(
            AnimeMap::class,
            AnimeRelatedEntry::class,
            null,
            '',
            [AnimeRelatedEntry::class => 'anime_id']
        );
    }

    private function getMapId($anidbId)
    {
        $mapId = AnimeChainEntry::where('anime_id', $anidbId)
            ->join('anime_prequel_sequel_chains', 'anime_chain_entries.chain_id', '=', 'anime_prequel_sequel_chains.id')
            ->value('anime_prequel_sequel_chains.map_id');

        if ($mapId) {
            return $mapId;
        }

        $mapId = AnimeRelatedEntry::where('anime_id', $anidbId)->value('map_id');

        if ($mapId) {
            return $mapId;
        }

        throw new \Exception("Map ID not found for Anidb ID: " . $anidbId);
    }

    public function map()
    {
        return AnimeMap::query()
            ->where(function ($query) {
                // Through anime_chain_entries
                $query->whereExists(function ($subquery) {
                    $subquery->from('anime_prequel_sequel_chains')
                        ->join('anime_chain_entries', 'anime_chain_entries.chain_id', '=', 'anime_prequel_sequel_chains.id')
                        ->whereColumn('anime_prequel_sequel_chains.map_id', '=', 'anime_maps.id')
                        ->where('anime_chain_entries.anime_id', '=', $this->id);
                })
                    // Through anime_related_entries
                    ->orWhereExists(function ($subquery) {
                        $subquery->from('anime_related_entries')
                            ->whereColumn('anime_related_entries.map_id', '=', 'anime_maps.id')
                            ->where('anime_related_entries.anime_id', '=', $this->id);
                    });
            })
            ->select('anime_maps.id as map_id')
            ->value('map_id');
    }
}
