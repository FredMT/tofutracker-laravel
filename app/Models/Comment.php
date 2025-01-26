<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Staudenmeir\LaravelAdjacencyList\Eloquent\HasRecursiveRelationships;

class Comment extends Model
{
    use HasRecursiveRelationships;

    protected $with = ['user', 'votes'];

    protected $appends = ['points', 'time_ago'];

    protected $fillable = ['body', 'parent_id', 'user_id', 'deleted_at'];

    protected $casts = [
        'deleted_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class);
    }

    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }

    public function children()
    {
        return $this->hasManyOfDescendantsAndSelf(self::class);
    }

    public function getPointsAttribute()
    {
        return $this->votes->sum('value');
    }

    public function getTimeAgoAttribute(): string
    {
        return $this->created_at->diffForHumans(now(), CarbonInterface::DIFF_RELATIVE_TO_NOW, true);
    }

    public function getBodyAttribute($value)
    {
        return $this->user_id ? $value : '[deleted]';
    }
}
