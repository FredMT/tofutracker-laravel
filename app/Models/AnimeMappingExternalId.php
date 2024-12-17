<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AnimeMappingExternalId extends Model
{
    protected $guarded = ['id'];
    protected $table = 'anime_mapping_external_ids';
    protected $hidden = ['id', 'created_at', 'updated_at'];

    protected $casts = [
        'anisearch_id' => 'integer',
        'anidb_id' => 'integer',
        'kitsu_id' => 'integer',
        'mal_id' => 'integer',
        'anilist_id' => 'integer',
        'livechart_id' => 'integer',
        'thetvdb_id' => 'integer',
        'themoviedb_id' => 'integer',
    ];


    public function anidbAnime(): BelongsTo
    {
        return $this->belongsTo(AnidbAnime::class, 'anidb_id');
    }
}
