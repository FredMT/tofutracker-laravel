<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Library extends Model
{
    public function movie()
    {
        return $this->belongsTo(Movie::class, 'media_id');
    }
}
