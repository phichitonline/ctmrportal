<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Wazuh Server REST API & OpenSearch Dashboard Configuration
    |--------------------------------------------------------------------------
    |
    | Supports connecting to both:
    | 1. Wazuh Dashboard (OpenSearch Dashboards v2.19.1) at https://ctmr.ppho.go.th (Port 443)
    |    for live 24h Alert Aggregations (wazuh-alerts-*) and proxied API calls.
    | 2. Wazuh Manager REST API at https://ctmr.ppho.go.th:55000 (Port 55000)
    |    for direct JWT-authenticated Agent status and node inventory.
    |
    */

    'dashboard_url' => env('WAZUH_DASHBOARD_URL', 'https://ctmr.ppho.go.th'),

    'dashboard_username' => env('WAZUH_DASHBOARD_USER', env('WAZUH_API_USER', 'admin')),

    'dashboard_password' => env('WAZUH_DASHBOARD_PASSWORD', env('WAZUH_API_PASSWORD', '')),

    'api_url' => env('WAZUH_API_URL', 'https://ctmr.ppho.go.th:55000'),

    'username' => env('WAZUH_API_USER', 'wazuh-wui'),

    'password' => env('WAZUH_API_PASSWORD', ''),

    'verify_ssl' => env('WAZUH_VERIFY_SSL', false),

    'timeout' => env('WAZUH_API_TIMEOUT', 8), // seconds

    'cache_ttl' => env('WAZUH_CACHE_TTL', 60), // seconds
];
