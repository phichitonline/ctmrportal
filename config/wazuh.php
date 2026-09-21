<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Wazuh Server REST API Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for communicating with the Wazuh API server at
    | https://ctmr.ppho.go.th:55000 for live agent status and security alerts.
    |
    */

    'api_url' => env('WAZUH_API_URL', 'https://ctmr.ppho.go.th:55000'),

    'username' => env('WAZUH_API_USER', 'wazuh'),

    'password' => env('WAZUH_API_PASSWORD', ''),

    'verify_ssl' => env('WAZUH_VERIFY_SSL', false),

    'timeout' => env('WAZUH_API_TIMEOUT', 6), // seconds

    'cache_ttl' => env('WAZUH_CACHE_TTL', 60), // seconds
];
