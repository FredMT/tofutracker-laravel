<?php

namespace App\Models;

use App\Enums\MediaType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserLibrary extends Model
{
    protected $fillable = [
        'user_id',
        'type'
    ];

    protected $casts = [
        'type' => MediaType::class
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function movies(): HasMany
    {
        return $this->hasMany(UserMovie::class);
    }
}
