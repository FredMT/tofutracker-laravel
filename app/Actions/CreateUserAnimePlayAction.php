<?php

namespace App\Actions;

use App\Models\UserAnimePlay;
use Illuminate\Database\Eloquent\Model;

class CreateUserAnimePlayAction
{
    public function execute(Model $playable, ?\DateTime $watchedAt = null): UserAnimePlay
    {
        return UserAnimePlay::create([
            'playable_id' => $playable->id,
            'playable_type' => $playable::class,
            'watched_at' => $watchedAt ?? now()
        ]);
    }

    public function executeMultiple(array $playables, ?\DateTime $watchedAt = null): void
    {
        foreach ($playables as $playable) {
            $this->execute($playable, $watchedAt);
        }
    }
}
