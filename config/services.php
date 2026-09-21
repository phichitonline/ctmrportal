<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'moph' => [
        'client_id' => env('MOPH_CLIENT_ID', '0194e132-099e-7e9b-b25c-a927c7e35d83'),
        'redirect_uri' => env('MOPH_REDIRECT_URI', 'https://provider.tphcp.go.th/callback'),
        'state_callback' => env('MOPH_STATE_CALLBACK', 'https://hosinfo.tphcp.go.th/auth/moph/callback'),
    ],

    'sso' => [
        'shared_secret' => env('SSO_SHARED_SECRET', ''),
    ],

];
