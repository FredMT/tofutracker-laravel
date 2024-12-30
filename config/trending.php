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
        31910, // Naruto Shippuden
        37854, // One Piece
        60572, // Pokemon
        12971, // Dragon Ball Z
        236994, // Dragon Ball DAIMA
        62715, // Dragon Ball Super
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
