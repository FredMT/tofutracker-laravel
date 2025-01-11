<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class UserCustomListItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function customList(): BelongsTo
    {
        return $this->belongsTo(UserCustomList::class, 'custom_list_id');
    }

    public function listable(): MorphTo
    {
        return $this->morphTo();
    }
}
