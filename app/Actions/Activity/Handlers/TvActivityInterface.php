<?php

namespace App\Actions\Activity\Handlers;

use App\Models\UserActivity;
use Illuminate\Database\Eloquent\Model;

interface TvActivityInterface extends ActivityHandlerInterface
{
    public function getTvShowTitle(Model $subject): ?string;

    public function getTvShowId(Model $subject): ?int;
}
