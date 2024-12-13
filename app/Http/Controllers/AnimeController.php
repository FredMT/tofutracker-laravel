<?php

namespace App\Http\Controllers;

use App\Actions\Anime\GetMostCommonTmdbId;

class AnimeController extends Controller
{
    private GetMostCommonTmdbId $getMostCommonTmdbId;

    public function __construct(GetMostCommonTmdbId $getMostCommonTmdbId)
    {
        $this->getMostCommonTmdbId = $getMostCommonTmdbId;
    }

    public function getMostCommonTmdbId($accessId)
    {
        return $this->getMostCommonTmdbId->execute($accessId);
    }
}
