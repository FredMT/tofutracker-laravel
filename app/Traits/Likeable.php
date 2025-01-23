<?php

namespace App\Traits;

use App\Models\Like;
use Illuminate\Database\Eloquent\Relations\MorphMany;

trait Likeable
{
    public function likes(): MorphMany
    {
        return $this->morphMany(Like::class, 'likeable');
    }

    public function isLikedBy(int $userId): bool
    {
        return $this->likes()->where('user_id', $userId)->exists();
    }

    public function toggleLike(int $userId): bool
    {
        return Like::toggle($this, $userId);
    }

    public function likesCount(): int
    {
        return $this->likes()->count();
    }
}
