<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Ignored IDs
    |--------------------------------------------------------------------------
    |
    | List of TMDB IDs that should be ignored when fetching trending items
    |
    */
    'ignored_ids' => [
        // Add IDs to ignore here
        46260, // Naruto
        37854, // One Piece
        60572, // Pokemon
        12971 // Dragon Ball Z
    ],

    /*
    |--------------------------------------------------------------------------
    | Cache Duration
    |--------------------------------------------------------------------------
    |
    | How long to cache the trending results (in minutes)
    |
    */
    'cache_duration' => 1440, // 24 hours
];
