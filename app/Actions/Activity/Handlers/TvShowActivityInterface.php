<?php

namespace App\Actions\Activity\Handlers;

use Illuminate\Database\Eloquent\Model;

interface TvShowActivityInterface extends ActivityHandlerInterface
{
    public function getTvShowTitle(Model $subject): ?string;

    public function getTvShowId(Model $subject): ?int;
}
