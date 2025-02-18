<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vote extends Model
{
    protected $fillable = ['value', 'user_id', 'comment_id'];

    public function comment()
    {
        return $this->belongsTo(Comment::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public static function getTotalScore(int $commentId): int
    {
        return static::where('comment_id', $commentId)->sum('value');
    }
}
