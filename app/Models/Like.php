<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Support\Facades\Gate;

class Like extends Model
{
    protected $fillable = [
        'user_id',
        'likeable_id',
        'likeable_type',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function likeable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Toggle like status for a model instance
     *
     * @param Model $model The model to toggle like for
     * @param int $userId The user ID who is toggling the like
     * @return bool True if liked, false if unliked
     * @throws \Illuminate\Auth\Access\AuthorizationException
     */
    public static function toggle(Model $model, int $userId): bool
    {
        Gate::authorize('toggle', self::class);

        $like = static::where('likeable_id', $model->id)
            ->where('likeable_type', get_class($model))
            ->where('user_id', $userId)
            ->first();

        if ($like) {
            $like->delete();
            return false;
        }

        static::create([
            'user_id' => $userId,
            'likeable_id' => $model->id,
            'likeable_type' => get_class($model),
        ]);

        return true;
    }
}
