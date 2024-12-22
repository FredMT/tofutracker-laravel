<?php

namespace App\Exceptions\Tvdb;

class TvdbSyncException extends \Exception
{
    public const SEASON_NOT_FOUND = 'SEASON_NOT_FOUND';
    public const UPDATE_NOT_NEEDED = 'UPDATE_NOT_NEEDED';
    public const NO_NEW_UPDATES = 'NO_NEW_UPDATES';
}
