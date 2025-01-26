<?php

namespace App\Models\UserCustomList;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class UserCustomList extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'description',
        'banner_image',
        'banner_type',
        'private_note',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
        'banner_type' => 'string',
    ];

    protected $hidden = [
        'user_id',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(UserCustomListItem::class, 'custom_list_id')->orderBy('sort_order');
    }
}
