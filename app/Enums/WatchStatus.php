<?php

namespace App\Enums;

enum WatchStatus: string
{
    case COMPLETED = 'completed';
    case PLANNING = 'planning';
    case REWATCHING = 'rewatching';
    case WATCHING = 'watching';
    case ONHOLD = 'onhold';
    case DROPPED = 'dropped';
}
