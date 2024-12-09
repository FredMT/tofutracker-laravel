<?php

namespace App\Enums;

enum WatchStatus: string
{
    case COMPLETED = 'COMPLETED';
    case PLANNING = 'PLANNING';
    case REWATCHING = 'REWATCHING';
    case WATCHING = 'WATCHING';
    case ONHOLD = 'ONHOLD';
    case DROPPED = 'DROPPED';
}
