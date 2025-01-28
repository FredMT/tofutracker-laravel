<?php

namespace App\Models;

use App\Models\UserAnime\UserAnimeCollection;
use App\Models\UserCustomList\UserCustomList;
use App\Models\UserMovie\UserMovie;
use App\Models\UserTv\UserTvShow;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'username',
        'email',
        'password',
        'bio',
        'avatar',
        'banner',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Get the user's library.
     */
    public function library(): HasOne
    {
        return $this->hasOne(UserLibrary::class);
    }

    public function movies(): HasMany
    {
        return $this->hasMany(UserMovie::class);
    }

    public function shows(): HasMany
    {
        return $this->hasMany(UserTvShow::class);
    }

    public function animeCollections(): HasManyThrough
    {
        return $this->hasManyThrough(
            UserAnimeCollection::class,
            UserLibrary::class,
            'user_id',
            'user_library_id',
            'id',
            'id'
        )->whereHas('userLibrary', function ($query) {
            $query->where('type', 'anime');
        });
    }

    public function activities(): HasMany
    {
        return $this->hasMany(UserActivity::class);
    }

    public function customLists(): HasMany
    {
        return $this->hasMany(UserCustomList::class);
    }
}
