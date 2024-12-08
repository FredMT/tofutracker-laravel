<?php

namespace App\Models;

use App\Enums\WatchStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserLibrary extends Model
{
    protected $table = 'user_library';
    protected $fillable = [
        'user_id',
        'media_id',
        'media_type',
        'status',
        'rating',
    ];

    protected $casts = [
        'status' => WatchStatus::class,
        'rating' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
