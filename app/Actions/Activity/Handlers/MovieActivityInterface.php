<?php

namespace App\Actions\Activity\Handlers;

use Illuminate\Database\Eloquent\Model;

interface MovieActivityInterface extends ActivityHandlerInterface
{
    public function getMovieTitle(Model $subject): ?string;

    public function getMovieId(Model $subject): ?int;
}
