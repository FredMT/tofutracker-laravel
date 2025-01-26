<?php

namespace App\Models\UserCustomList;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

class UserCustomListItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'sort_order',
        'custom_list_id',
        'listable_type',
        'listable_id',
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
