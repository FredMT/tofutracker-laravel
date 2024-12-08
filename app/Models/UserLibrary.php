<?php

namespace App\Models;

use App\Enums\WatchStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Builder;

class UserLibrary extends Model
{
    protected $table = 'user_library';
    protected $fillable = [
        'user_id',
        'media_id',
        'media_type',
        'status',
        'rating',
        'is_private',
    ];

    protected $casts = [
        'status' => WatchStatus::class,
        'rating' => 'integer',
        'is_private' => 'boolean',
    ];

    /**
     * Get the user that owns the library entry.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope to only include public entries or entries owned by the current user.
     */
    public function scopeVisibleTo(Builder $query, ?User $user = null): void
    {
        $query->where(function (Builder $query) use ($user) {
            $query->where('is_private', false)
                ->when($user, function (Builder $query) use ($user) {
                    $query->orWhere('user_id', $user->id);
                });
        });
    }

    /**
     * Scope to only include entries of a specific media type.
     */
    public function scopeOfType(Builder $query, string $type): void
    {
        $query->where('media_type', $type);
    }

    /**
     * Scope to only include movie entries.
     */
    public function scopeMovies(Builder $query): void
    {
        $query->ofType('movie');
    }
}
