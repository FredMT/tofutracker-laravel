<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

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
     * Get the user's library entries.
     */
    public function library(): HasMany
    {
        return $this->hasMany(UserLibrary::class);
    }


    /**
     * Get all movies in the user's library.
     */
    public function movies(): HasManyThrough
    {
        return $this->hasManyThrough(
            Movie::class,
            UserLibrary::class,
            'user_id', // Foreign key on UserLibrary table
            'id',      // Foreign key on Movie table
            'id',      // Local key on User table
            'media_id' // Local key on UserLibrary table
        )->where('media_type', 'movie');
    }
}
