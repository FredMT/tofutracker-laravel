<?php

namespace App\Models\Anidb;

use App\Actions\Anime\GetAnimeEpisodes;
use App\Models\Anime\AnimeChainEntry;
use App\Models\Anime\AnimeMap;
use App\Models\Anime\AnimeRelatedEntry;
use App\Models\Comment;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Kiritokatklian\LaravelColorPalette\Facades\ColorPalette;
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
        'picture',
        'map_id',
    ];

    protected $casts = [
        'startdate' => 'date',
        'enddate' => 'date',
        'rating' => 'decimal:2',
        'rating_count' => 'integer',
        'episode_count' => 'integer',
    ];

    protected function title(): Attribute
    {
        return Attribute::get(
            fn () => $this->title_main
        );
    }

    public function poster(): Attribute
    {
        return Attribute::get(function () {
            return $this->picture;
        });
    }

    public function backdrop(): Attribute
    {
        return Attribute::get(function () {
            $map = AnimeMap::find($this->map_id);

            return $map?->backdrop ?? null;
        });
    }

    public function overview(): Attribute
    {
        return Attribute::get(function () {
            $map = AnimeMap::find($this->map_id);

            return $map?->overview ?? null;
        });
    }

    public function runtime(): Attribute
    {
        return Attribute::get(function () {
            return $this->episodes()
                ->where('type', 1)
                ->sum('length');
        });
    }

    public function characters(): HasMany
    {
        return $this->hasMany(AnidbCharacter::class, 'anime_id');
    }

    public function year(): Attribute
    {
        return Attribute::get(function () {
            return $this->startdate?->year;
        });
    }

    public function yearRange(): Attribute
    {
        return Attribute::get(function () {
            $map = AnimeMap::find($this->map_id);
            $tmdbModel = $map?->getTmdbModel();

            return $tmdbModel?->yearRange ?? null;
        });
    }

    public function rating(): Attribute
    {
        return Attribute::get(function () {
            return $this->getRawOriginal('rating');
        });
    }

    public function voteAverage(): Attribute
    {
        return Attribute::get(function () {
            return $this->getRawOriginal('rating');
        });
    }

    public function tmdbRating(): Attribute
    {
        return Attribute::get(function () {
            $map = AnimeMap::find($this->map_id);
            $tmdbModel = $map?->getTmdbModel();

            return $tmdbModel?->vote_average ?? null;
        });
    }

    public function genres()
    {
        $map = AnimeMap::find($this->map_id);
        $tmdbModel = $map?->getTmdbModel();

        return $tmdbModel?->genres() ?? collect();
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

    public function mainCharacters(): Attribute
    {
        return Attribute::get(function () {
            return $this->characters()
                ->where('character_type', 'main character in')
                ->whereNotNull('picture')
                ->where('name', '!=', "\n")
                ->whereHas('seiyuus', function ($query) {
                    $query->whereNotNull('picture');
                })
                ->get();
        });
    }

    public function otherCharacters(): Attribute
    {
        return Attribute::get(function () {
            return $this->characters()
                ->where('character_type', '!=', 'main character in')
                ->whereNotNull('picture')
                ->where('name', '!=', "\n")
                ->whereHas('seiyuus', function ($query) {
                    $query->whereNotNull('picture');
                })
                ->get();
        });
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

    public function comments(): MorphMany
    {
        return $this->morphMany(Comment::class, 'commentable');
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(AnidbTag::class, 'anidb_anime_tags', 'anidb_id', 'tag_id');
    }

    public function mainEpisodes(): array
    {
        try {
            $episodes = $this->mappedEpisodes();

            return $episodes['mainEpisodes'] ?? [];
        } catch (\Exception $e) {
            logger()->error('Failed to get main episodes for anime: '.$this->id);
            logger()->error($e->getMessage());

            return [];
        }
    }

    public function map(): Attribute
    {
        return Attribute::get(function () {
            return $this->map_id;
        });
    }

    public function specialEpisodes(): array
    {
        try {
            $episodes = $this->mappedEpisodes();

            return $episodes['specialEpisodes'] ?? [];
        } catch (\Exception $e) {
            logger()->error('Failed to get special episodes for anime: '.$this->id);
            logger()->error($e->getMessage());

            return [];
        }
    }

    public function getColorPalette()
    {
        $cacheKey = "anime_map.{$this->map}.color_palette";
        $cacheTTL = seconds_until('first sunday next month at 8 am');

        if (cache()->has($cacheKey)) {
            return cache()->get($cacheKey);
        }

        $backdrop = AnimeMap::find($this->map_id)->backdrop;

        if (empty($backdrop)) {
            return null;
        } else {
            $backdrop = 'https://image.tmdb.org/t/p/original'.$backdrop;
        }

        $colorPalette = ColorPalette::getPalette($backdrop);
        cache()->put($cacheKey, $colorPalette, $cacheTTL);

        return $colorPalette;
    }

    public function logo(): Attribute
    {
        return Attribute::get(function () {
            $map = AnimeMap::find($this->map_id);

            return $map->getTmdbModel()->highestVotedLogoPath ?? null;
        });
    }
}
