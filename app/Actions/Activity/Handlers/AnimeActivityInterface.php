<?php

namespace App\Actions\Activity\Handlers;

use App\Models\UserActivity;
use Illuminate\Database\Eloquent\Model;

interface AnimeActivityInterface extends ActivityHandlerInterface
{
    public function getAnimeTitle(Model $subject): ?string;

    public function getAnimeId(Model $subject): ?int;
}
