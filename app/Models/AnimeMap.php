<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;

class AnimeMap extends Model
{
    use HasUuids;

    protected $fillable = ['access_id', 'data', 'most_common_tmdb_id'];

    protected $casts = [
        'data' => 'array'
    ];
}
