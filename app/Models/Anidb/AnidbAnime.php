<?php

namespace App\Models\Anidb;

use App\Actions\Anime\GetAnimeEpisodes;
use App\Models\Anime\AnimeChainEntry;
use App\Models\Anime\AnimeMap;
use App\Models\Anime\AnimeMappingExternalId;
use App\Models\Anime\AnimeRelatedEntry;
use App\Models\Comment;
use App\Models\Movie;
use App\Models\TvShow;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Znck\Eloquent\Relations\BelongsToThrough;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Kiritokatklian\LaravelColorPalette\Facades\ColorPalette;

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

    public function genres(): Attribute
    {
        return Attribute::get(function () {
            try {
                $mapId = $this->map_id;
                if ($mapId) {
                    $map = AnimeMap::find($mapId);

                    return $map ? $map->genres : collect();
                }
            } catch (\Exception $e) {
                return collect();
            }

            return collect();
        });
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

    public function getColorPalette(): array
    {
        $backdrop = 'https://picsum.photos/200/300';

        $externalIds = AnimeMappingExternalId::where('anidb_id', $this->id)->first();
        if ($externalIds && $externalIds->themoviedb_id) {
            $type = $this->type === 'Movie' ? 'movie' : 'tv';
            
            if ($type === 'Movie') {
                $movie = Movie::find($externalIds->themoviedb_id);
                if ($movie) {
                    $backdrop = $movie->backdrop;
                    logger()->info("Movie $backdrop");
                }
            } else {
                $tvShow = TvShow::find($externalIds->themoviedb_id);
                if ($tvShow) {
                    $backdrop = $tvShow->backdrop;
                    logger()->info("Tv $backdrop");
                }
            }

            if (!empty($backdrop)) {
                $backdrop = 'https://image.tmdb.org/t/p/original'.$backdrop;
            }
        }

        return ColorPalette::getPalette($backdrop);
    }

    public function logo(): Attribute
    {
        return Attribute::get(function () {
            $map = AnimeMap::find($this->map_id);
            return $map->getTmdbModel()->highestVotedLogoPath ?? null;
        });
    }
}
