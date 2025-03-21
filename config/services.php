<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
    'tmdb' => [
        'token' => env('TMDB_TOKEN'),
        'key' => env('TMDB_KEY'),
    ],
    'tvdb' => [
        'token' => env('TVDB_TOKEN'),
    ],
    'anidb' => [
        'local_port' => env('ANIDB_LOCAL_PORT', 4321),
        'client_name' => env('ANIDB_CLIENT_NAME', 'sprung'),
    ],
    'animeschedule' => [
        'bearer' => env('ANIME_SCHEDULE_BEARER'),
    ],
    'trakt' => [
        'trakt_api_key' => env('TRAKT_API_KEY'),
        'trakt_api_version' => env('TRAKT_API_VERSION'),
    ]
];
