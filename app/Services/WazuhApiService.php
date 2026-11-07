<?php

namespace App\Services;

use App\Http\Controllers\UserController;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WazuhApiService
{
    protected string $dashboardUrl;
    protected string $dashboardUsername;
    protected string $dashboardPassword;
    protected string $baseUrl;
    protected string $username;
    protected string $password;
    protected bool $verifySsl;
    protected int $timeout;
    protected int $cacheTtl;

    /**
     * Exact mapping between the 13 Phichit Hospital codes (001-013) and their 5-digit MOPH Hospcodes
     * used in Wazuh Agent groups (e.g., AA0000052, EA0010726, EA0011456).
     */
    protected static array $hospitalHospcodeMap = [
        '001' => '00052', // สำนักงานสาธารณสุขจังหวัดพิจิตร
        '002' => '10726', // โรงพยาบาลพิจิตร
        '003' => '11456', // รพ.สมเด็จพระยุพราชตะพานหิน
        '004' => '11260', // โรงพยาบาลบางมูลนาก
        '005' => '11261', // โรงพยาบาลโพทะเล
        '006' => '11263', // โรงพยาบาลทับคล้อ
        '007' => '11259', // โรงพยาบาลโพธิ์ประทับช้าง
        '008' => '11262', // โรงพยาบาลสามง่าม
        '009' => '11631', // โรงพยาบาลวชิรบารมี
        '010' => '11258', // โรงพยาบาลวังทรายพูน
        '011' => '27978', // โรงพยาบาลสากเหล็ก
        '012' => '27979', // โรงพยาบาลบึงนาราง
        '013' => '27980', // โรงพยาบาลดงเจริญ
    ];

    /**
     * Known 5-digit MOPH Hospcodes for external / Regional Health 3 (เขตสุขภาพที่ 3) & PCU agencies
     * connected to the shared CTMR Wazuh server (https://ctmr.ppho.go.th).
     */
    protected static array $externalAgencyDirectory = [
        // อุทัยธานี (Uthai Thani)
        '00047' => ['name' => 'สำนักงานสาธารณสุขจังหวัดอุทัยธานี', 'province' => 'จ.อุทัยธานี', 'type' => 'Provincial Health Office'],
        '10720' => ['name' => 'โรงพยาบาลอุทัยธานี', 'province' => 'จ.อุทัยธานี', 'type' => 'General Hospital (รพท.)'],
        '11221' => ['name' => 'โรงพยาบาลหนองฉาง', 'province' => 'จ.อุทัยธานี', 'type' => 'Community Hospital (รพช.)'],
        '11222' => ['name' => 'โรงพยาบาลสว่างอารมณ์', 'province' => 'จ.อุทัยธานี', 'type' => 'Community Hospital (รพช.)'],
        '11223' => ['name' => 'โรงพยาบาลหนองขาหย่าง', 'province' => 'จ.อุทัยธานี', 'type' => 'Community Hospital (รพช.)'],
        '11225' => ['name' => 'โรงพยาบาลบ้านไร่', 'province' => 'จ.อุทัยธานี', 'type' => 'Community Hospital (รพช.)'],
        '11226' => ['name' => 'โรงพยาบาลลานสัก', 'province' => 'จ.อุทัยธานี', 'type' => 'Community Hospital (รพช.)'],
        '11227' => ['name' => 'โรงพยาบาลทัพทัน', 'province' => 'จ.อุทัยธานี', 'type' => 'Community Hospital (รพช.)'],

        // นครสวรรค์ (Nakhon Sawan)
        '10719' => ['name' => 'โรงพยาบาลสวรรค์ประชารักษ์', 'province' => 'จ.นครสวรรค์', 'type' => 'Regional Hospital (รพศ.)'],
        '11209' => ['name' => 'โรงพยาบาลโกรกพระ', 'province' => 'จ.นครสวรรค์', 'type' => 'Community Hospital (รพช.)'],
        '11210' => ['name' => 'โรงพยาบาลชุมแสง', 'province' => 'จ.นครสวรรค์', 'type' => 'Community Hospital (รพช.)'],
        '11211' => ['name' => 'โรงพยาบาลหนองบัว', 'province' => 'จ.นครสวรรค์', 'type' => 'Community Hospital (รพช.)'],
        '11212' => ['name' => 'โรงพยาบาลบรรพตพิสัย', 'province' => 'จ.นครสวรรค์', 'type' => 'Community Hospital (รพช.)'],
        '11213' => ['name' => 'โรงพยาบาลเก้าเลี้ยว', 'province' => 'จ.นครสวรรค์', 'type' => 'Community Hospital (รพช.)'],
        '11214' => ['name' => 'โรงพยาบาลตาคลี', 'province' => 'จ.นครสวรรค์', 'type' => 'Community Hospital (รพช.)'],
        '11217' => ['name' => 'โรงพยาบาลไพศาลี', 'province' => 'จ.นครสวรรค์', 'type' => 'Community Hospital (รพช.)'],
        '11219' => ['name' => 'โรงพยาบาลตากฟ้า', 'province' => 'จ.นครสวรรค์', 'type' => 'Community Hospital (รพช.)'],
        '14135' => ['name' => 'โรงพยาบาลบึงเสนาท', 'province' => 'จ.นครสวรรค์', 'type' => 'Community Hospital (รพช.)'],

        // ชัยนาท (Chai Nat)
        '10694' => ['name' => 'โรงพยาบาลชัยนาทนเรนทร', 'province' => 'จ.ชัยนาท', 'type' => 'General Hospital (รพท.)'],
        '10802' => ['name' => 'โรงพยาบาลมโนรมย์', 'province' => 'จ.ชัยนาท', 'type' => 'Community Hospital (รพช.)'],
        '10804' => ['name' => 'โรงพยาบาลสรรพยา', 'province' => 'จ.ชัยนาท', 'type' => 'Community Hospital (รพช.)'],
        '10805' => ['name' => 'โรงพยาบาลสรรคบุรี', 'province' => 'จ.ชัยนาท', 'type' => 'Community Hospital (รพช.)'],
        '10806' => ['name' => 'โรงพยาบาลหันคา', 'province' => 'จ.ชัยนาท', 'type' => 'Community Hospital (รพช.)'],
        '27975' => ['name' => 'โรงพยาบาลหนองมะโมง', 'province' => 'จ.ชัยนาท', 'type' => 'Community Hospital (รพช.)'],

        // กำแพงเพชร (Kamphaeng Phet)
        '10721' => ['name' => 'โรงพยาบาลกำแพงเพชร', 'province' => 'จ.กำแพงเพชร', 'type' => 'General Hospital (รพท.)'],
        '11232' => ['name' => 'โรงพยาบาลขาณุวรลักษบุรี', 'province' => 'จ.กำแพงเพชร', 'type' => 'Community Hospital (รพช.)'],
        '11233' => ['name' => 'โรงพยาบาลคลองขลุง', 'province' => 'จ.กำแพงเพชร', 'type' => 'Community Hospital (รพช.)'],
        '11236' => ['name' => 'โรงพยาบาลไทรงาม', 'province' => 'จ.กำแพงเพชร', 'type' => 'Community Hospital (รพช.)'],

        // รพ.สต. / หน่วยบริการปฐมภูมิ และหน่วยงานเครือข่ายอื่นๆ
        '07647' => ['name' => 'รพ.สต. ในเครือข่าย (รหัส 07647)', 'province' => 'จ.พิจิตร (PCU)', 'type' => 'Primary Care Unit (รพ.สต.)'],
        '07651' => ['name' => 'รพ.สต. ในเครือข่าย (รหัส 07651)', 'province' => 'จ.พิจิตร (PCU)', 'type' => 'Primary Care Unit (รพ.สต.)'],
        '77222' => ['name' => 'โรงพยาบาลสมเด็จพระยุพราชธาตุพนม', 'province' => 'เครือข่ายภายนอก', 'type' => 'Crown Prince Hospital'],
        'R3NSW' => ['name' => 'สำนักงานเขตสุขภาพที่ 3 นครสวรรค์', 'province' => 'เขตสุขภาพที่ 3', 'type' => 'Regional Health Office 3'],
        'UNGROUPED' => ['name' => 'โหนดที่ยังไม่ระบุรหัสหน่วยงาน 5 หลัก', 'province' => 'รอจัดกลุ่ม (Default)', 'type' => 'Unassigned / General Nodes'],
    ];

    public function __construct()
    {
        $this->dashboardUrl = rtrim(config('wazuh.dashboard_url', 'https://ctmr.ppho.go.th'), '/');
        $this->dashboardUsername = (string) config('wazuh.dashboard_username', 'drghost');
        $this->dashboardPassword = (string) config('wazuh.dashboard_password', '');

        $this->baseUrl = rtrim(config('wazuh.api_url', 'https://ctmr.ppho.go.th:55000'), '/');
        $this->username = (string) config('wazuh.username', 'wazuh-wui');
        $this->password = (string) config('wazuh.password', '');
        $this->verifySsl = (bool) config('wazuh.verify_ssl', false);
        $this->timeout = (int) config('wazuh.timeout', 10);
        $this->cacheTtl = (int) config('wazuh.cache_ttl', 60);
    }

    /**
     * Clear all cached Wazuh / OpenSearch tokens and datasets for immediate re-sync.
     */
    public function clearSyncCache(): void
    {
        Cache::forget('wazuh_jwt_token_' . md5($this->baseUrl . $this->dashboardUsername));
        Cache::forget('wazuh_osd_cookie_' . md5($this->dashboardUrl . $this->dashboardUsername));
        Cache::forget('wazuh_agents_summary_' . md5($this->baseUrl));
        Cache::forget('wazuh_hospitals_breakdown_' . md5($this->baseUrl));
        Cache::forget('wazuh_other_agencies_breakdown_' . md5($this->baseUrl));
        Cache::forget('wazuh_alerts_summary_' . md5($this->dashboardUrl));
    }

    /**
     * Authenticate with OpenSearch Dashboards (https://ctmr.ppho.go.th/auth/login)
     * and return the `security_authentication` cookie string.
     */
    public function getDashboardCookie(): ?string
    {
        if (empty($this->dashboardPassword)) {
            return null;
        }

        $cacheKey = 'wazuh_osd_cookie_' . md5($this->dashboardUrl . $this->dashboardUsername);

        return Cache::remember($cacheKey, 1800, function () {
            try {
                $response = Http::withHeaders([
                    'osd-xsrf' => 'true',
                    'Content-Type' => 'application/json',
                    'Accept' => 'application/json',
                ])
                    ->withOptions(['verify' => $this->verifySsl])
                    ->timeout($this->timeout)
                    ->post("{$this->dashboardUrl}/auth/login", [
                        'username' => $this->dashboardUsername,
                        'password' => $this->dashboardPassword,
                    ]);

                if ($response->successful()) {
                    $setCookies = $response->header('Set-Cookie');
                    $cookieHeaders = is_array($setCookies) ? $setCookies : [$setCookies];

                    foreach ($cookieHeaders as $hdr) {
                        if (preg_match('/security_authentication=([^;]+)/', (string) $hdr, $matches)) {
                            return 'security_authentication=' . $matches[1];
                        }
                    }
                }
            } catch (Exception $e) {
                Log::notice('Wazuh Dashboard login unreachable: ' . $e->getMessage());
            }

            return null;
        });
    }

    /**
     * Authenticate and retrieve JWT Bearer token for Wazuh Manager REST API (Port 55000).
     * First exchanges the OpenSearch Dashboards session cookie via `POST /api/login` (`{"idHost":"default"}`),
     * or falls back to direct Basic Auth on Port 55000.
     */
    public function getAuthToken(): ?string
    {
        $cacheKey = 'wazuh_jwt_token_' . md5($this->baseUrl . $this->dashboardUsername);

        return Cache::remember($cacheKey, 800, function () {
            // 1. Exchange OpenSearch Dashboards session cookie via POST /api/login
            $osdCookie = $this->getDashboardCookie();
            if ($osdCookie) {
                try {
                    $wzLoginRes = Http::withHeaders([
                        'osd-xsrf' => 'true',
                        'Cookie' => $osdCookie,
                        'Content-Type' => 'application/json',
                        'Accept' => 'application/json',
                    ])
                        ->withOptions(['verify' => $this->verifySsl])
                        ->timeout($this->timeout)
                        ->post("{$this->dashboardUrl}/api/login", [
                            'idHost' => 'default',
                            'force' => true,
                        ]);

                    if ($wzLoginRes->successful()) {
                        $token = $wzLoginRes->json()['token'] ?? null;
                        if (! empty($token)) {
                            return $token;
                        }
                    }
                } catch (Exception $e) {
                    Log::notice('Wazuh /api/login token exchange failed: ' . $e->getMessage());
                }
            }

            // 2. Fallback: Direct Basic Auth to Port 55000 /security/user/authenticate
            if (! empty($this->password)) {
                try {
                    $response = Http::withBasicAuth($this->username, $this->password)
                        ->withOptions(['verify' => $this->verifySsl])
                        ->timeout($this->timeout)
                        ->post("{$this->baseUrl}/security/user/authenticate");

                    if ($response->successful()) {
                        $json = $response->json();

                        return $json['data']['token'] ?? null;
                    }
                } catch (Exception $e) {
                    Log::notice('Wazuh API port 55000 unreachable: ' . $e->getMessage());
                }
            }

            return null;
        });
    }

    /**
     * Get overall connection and sync status across both Port 443 (Dashboard) and Port 55000 (API).
     */
    public function getConnectionStatus(): array
    {
        $osdCookie = $this->getDashboardCookie();
        $jwtToken = $this->getAuthToken();
        $isLive = ! empty($jwtToken) || ! empty($osdCookie);

        return [
            'is_live' => $isLive,
            'api_connected' => ! empty($jwtToken),
            'dashboard_connected' => ! empty($osdCookie),
            'mode' => $isLive ? 'live' : 'simulated',
            'dashboard_url' => $this->dashboardUrl,
            'api_url' => $this->baseUrl,
            'node_name' => 'ctmr-phichit (Wazuh v4.12.0 / OpenSearch v2.19.1)',
            'last_sync' => Carbon::now()->timezone('Asia/Bangkok')->format('H:i:s'),
            'message' => $isLive
                ? "เชื่อมต่อ ctmr.ppho.go.th สำเร็จ (ผู้ใช้: {$this->dashboardUsername} • Live SIEM & Agents Sync)"
                : 'โหมดสำรองข้อมูล (Fallback Standby): รอการตรวจสอบสิทธิ์เข้าถึง ctmr.ppho.go.th',
        ];
    }

    /**
     * Get overall Agents status summary from `https://ctmr.ppho.go.th:55000/agents/summary/status`.
     */
    public function getAgentsSummary(): array
    {
        $cacheKey = 'wazuh_agents_summary_' . md5($this->baseUrl);
        $token = $this->getAuthToken();

        if ($token) {
            $cached = Cache::remember($cacheKey, $this->cacheTtl, function () use ($token) {
                try {
                    $response = Http::withToken($token)
                        ->withOptions(['verify' => $this->verifySsl])
                        ->timeout($this->timeout)
                        ->get("{$this->baseUrl}/agents/summary/status");

                    if ($response->successful()) {
                        $data = $response->json()['data']['connection'] ?? ($response->json()['data'] ?? []);
                        if (! empty($data) && isset($data['total'])) {
                            $total = (int) ($data['total'] ?? 0);
                            $active = (int) ($data['active'] ?? 0);
                            $disconnected = (int) ($data['disconnected'] ?? 0);
                            $neverConnected = (int) ($data['never_connected'] ?? 0);
                            $pending = (int) ($data['pending'] ?? 0);
                            $coverage = $total > 0 ? round(($active / $total) * 100, 1) : 0;

                            return [
                                'total' => $total,
                                'active' => $active,
                                'disconnected' => $disconnected,
                                'never_connected' => $neverConnected,
                                'pending' => $pending,
                                'coverage_percent' => $coverage,
                                'source' => 'live',
                            ];
                        }
                    }
                } catch (Exception $e) {
                    Log::warning('Error fetching live agents summary: ' . $e->getMessage());
                }

                return null;
            });

            if ($cached) {
                return $cached;
            }
        }

        return [
            'total' => 647,
            'active' => 266,
            'disconnected' => 377,
            'never_connected' => 0,
            'pending' => 4,
            'coverage_percent' => 41.1,
            'source' => 'simulated',
        ];
    }

    /**
     * Get breakdown of agents across the 13 hospitals in Phichit Province from live Wazuh API.
     */
    public function getHospitalAgentsBreakdown(): array
    {
        $token = $this->getAuthToken();
        $agencies = UserController::$agencies;

        if ($token) {
            $cacheKey = 'wazuh_hospitals_breakdown_' . md5($this->baseUrl);
            $cached = Cache::remember($cacheKey, $this->cacheTtl, function () use ($token, $agencies) {
                try {
                    $response = Http::withToken($token)
                        ->withOptions(['verify' => $this->verifySsl])
                        ->timeout($this->timeout)
                        ->get("{$this->baseUrl}/agents", [
                            'limit' => 1000,
                            'select' => 'id,name,ip,status,group,os.name,version,lastKeepAlive',
                        ]);

                    if ($response->successful()) {
                        $agents = $response->json()['data']['affected_items'] ?? [];
                        if (! empty($agents)) {
                            return $this->mapLiveAgentsToHospitals($agents, $agencies);
                        }
                    }
                } catch (Exception $e) {
                    Log::warning('Error fetching live agents list: ' . $e->getMessage());
                }

                return null;
            });

            if ($cached) {
                return $cached;
            }
        }

        // Standardized Baseline distribution across 13 Phichit Hospitals
        $simulatedMatrix = [
            '001' => ['total' => 63, 'active' => 30, 'disconnected' => 33, 'subnet' => '10.0.0.0/24', 'os' => 'Windows 10/11 & Ubuntu 22.04'],
            '002' => ['total' => 48, 'active' => 24, 'disconnected' => 24, 'subnet' => '192.168.10.0/24', 'os' => 'Windows Server / Linux'],
            '003' => ['total' => 76, 'active' => 38, 'disconnected' => 38, 'subnet' => '172.16.10.0/24', 'os' => 'Windows 10/11 & Windows Server'],
            '004' => ['total' => 34, 'active' => 18, 'disconnected' => 16, 'subnet' => '192.168.30.0/24', 'os' => 'CentOS / Windows'],
            '005' => ['total' => 8, 'active' => 5, 'disconnected' => 3, 'subnet' => '192.168.40.0/24', 'os' => 'Ubuntu / Windows'],
            '006' => ['total' => 31, 'active' => 16, 'disconnected' => 15, 'subnet' => '192.168.50.0/24', 'os' => 'Debian / Windows'],
            '007' => ['total' => 39, 'active' => 20, 'disconnected' => 19, 'subnet' => '192.168.60.0/24', 'os' => 'Linux / Windows'],
            '008' => ['total' => 9, 'active' => 5, 'disconnected' => 4, 'subnet' => '192.168.70.0/24', 'os' => 'Windows / Ubuntu'],
            '009' => ['total' => 11, 'active' => 6, 'disconnected' => 5, 'subnet' => '192.168.80.0/24', 'os' => 'Linux / Windows'],
            '010' => ['total' => 41, 'active' => 21, 'disconnected' => 20, 'subnet' => '192.168.90.0/24', 'os' => 'CentOS / Windows'],
            '011' => ['total' => 7, 'active' => 4, 'disconnected' => 3, 'subnet' => '192.168.100.0/24', 'os' => 'Ubuntu / Windows'],
            '012' => ['total' => 31, 'active' => 16, 'disconnected' => 15, 'subnet' => '192.168.110.0/24', 'os' => 'Linux / Windows'],
            '013' => ['total' => 19, 'active' => 9, 'disconnected' => 10, 'subnet' => '192.168.120.0/24', 'os' => 'Debian / Windows'],
        ];

        $hospitals = [];

        foreach ($agencies as $agency) {
            $code = $agency['code'];
            $hospcode = self::$hospitalHospcodeMap[$code] ?? $code;
            $meta = $simulatedMatrix[$code] ?? ['total' => 20, 'active' => 15, 'disconnected' => 5, 'subnet' => '192.168.x.x', 'os' => 'General OS'];
            $total = $meta['total'];
            $active = $meta['active'];
            $disconnected = $meta['disconnected'];
            $health = $total > 0 ? round(($active / $total) * 100, 1) : 0;

            $statusLevel = 'healthy';
            if ($health < 65) {
                $statusLevel = 'critical';
            } elseif ($health < 80) {
                $statusLevel = 'warning';
            }

            $hospitals[] = [
                'code' => $code,
                'hospcode' => $hospcode,
                'name' => $agency['name'],
                'type' => $agency['type'] . " • รหัส {$hospcode}",
                'total' => $total,
                'active' => $active,
                'disconnected' => $disconnected,
                'health_score' => $health,
                'status_level' => $statusLevel,
                'subnet' => $meta['subnet'],
                'os_primary' => $meta['os'],
            ];
        }

        return $hospitals;
    }

    /**
     * Get breakdown of agents belonging to OTHER agencies (non-13 Phichit hospitals)
     * grouped by their 5-digit MOPH Hospcode (e.g., 10720, 11222, 11210, 00047, 07647, etc.).
     */
    public function getOtherAgenciesAgentsBreakdown(): array
    {
        $token = $this->getAuthToken();

        if ($token) {
            $cacheKey = 'wazuh_other_agencies_breakdown_' . md5($this->baseUrl);
            $cached = Cache::remember($cacheKey, $this->cacheTtl, function () use ($token) {
                try {
                    $response = Http::withToken($token)
                        ->withOptions(['verify' => $this->verifySsl])
                        ->timeout($this->timeout)
                        ->get("{$this->baseUrl}/agents", [
                            'limit' => 1000,
                            'select' => 'id,name,ip,status,group,os.name,version,lastKeepAlive',
                        ]);

                    if ($response->successful()) {
                        $agents = $response->json()['data']['affected_items'] ?? [];
                        if (! empty($agents)) {
                            return $this->mapLiveAgentsToOtherAgencies($agents);
                        }
                    }
                } catch (Exception $e) {
                    Log::warning('Error fetching live external agents list: ' . $e->getMessage());
                }

                return null;
            });

            if ($cached !== null) {
                return $cached;
            }
        }

        // Baseline fallback for external 5-digit agencies in Health Region 3
        $fallbackCodes = [
            '11222' => ['total' => 60, 'active' => 19, 'disconnected' => 41, 'subnet' => '192.168.122.x', 'os' => 'Windows 10/11 / Linux'],
            '10720' => ['total' => 45, 'active' => 30, 'disconnected' => 15, 'subnet' => '172.16.20.x', 'os' => 'AlmaLinux / Windows Server'],
            '11226' => ['total' => 13, 'active' => 9, 'disconnected' => 4, 'subnet' => '192.168.126.x', 'os' => 'Windows 10/11 / Ubuntu'],
            '11210' => ['total' => 12, 'active' => 3, 'disconnected' => 9, 'subnet' => '192.168.110.x', 'os' => 'Windows / Linux'],
            '00047' => ['total' => 9, 'active' => 0, 'disconnected' => 9, 'subnet' => '10.47.0.x', 'os' => 'Ubuntu / Windows Server'],
            '11227' => ['total' => 7, 'active' => 6, 'disconnected' => 1, 'subnet' => '192.168.127.x', 'os' => 'Windows 11 / Linux'],
            '10721' => ['total' => 3, 'active' => 0, 'disconnected' => 3, 'subnet' => '10.72.1.x', 'os' => 'Ubuntu / Windows'],
            '07647' => ['total' => 2, 'active' => 2, 'disconnected' => 0, 'subnet' => '192.168.1.x', 'os' => 'Ubuntu / Windows (HOSxP PCU)'],
            '07651' => ['total' => 2, 'active' => 2, 'disconnected' => 0, 'subnet' => '192.168.3.x', 'os' => 'Ubuntu / Windows (HOSxP PCU)'],
            '10694' => ['total' => 2, 'active' => 1, 'disconnected' => 1, 'subnet' => '192.168.69.x', 'os' => 'Windows 10/11'],
        ];

        $items = [];
        foreach ($fallbackCodes as $hospcode => $meta) {
            $dir = self::$externalAgencyDirectory[$hospcode] ?? [
                'name' => "หน่วยงานรหัส {$hospcode}",
                'province' => 'เขตสุขภาพที่ 3',
                'type' => 'Healthcare Agency',
            ];
            $total = $meta['total'];
            $active = $meta['active'];
            $health = $total > 0 ? round(($active / $total) * 100, 1) : 0;

            $items[] = [
                'code' => $hospcode,
                'hospcode' => $hospcode,
                'name' => $dir['name'],
                'province' => $dir['province'],
                'type' => "{$dir['type']} • {$dir['province']} • รหัส {$hospcode}",
                'total' => $total,
                'active' => $active,
                'disconnected' => $meta['disconnected'],
                'health_score' => $health,
                'status_level' => $health >= 80 ? 'healthy' : ($health >= 65 ? 'warning' : 'critical'),
                'subnet' => $meta['subnet'],
                'os_primary' => $meta['os'],
                'sample_agents' => [],
            ];
        }

        return $items;
    }

    /**
     * Map live raw agents that do NOT belong to the 13 main Phichit hospitals into 5-digit agency buckets.
     */
    protected function mapLiveAgentsToOtherAgencies(array $agents): array
    {
        $phichitHospcodes = array_values(self::$hospitalHospcodeMap);
        $buckets = [];

        foreach ($agents as $agent) {
            if (($agent['id'] ?? '') === '000') {
                continue;
            }

            $name = strtoupper((string) ($agent['name'] ?? ''));
            $groupList = is_array($agent['group'] ?? null) ? $agent['group'] : [];
            $groupStr = strtoupper(implode(' ', $groupList));
            $combined = $groupStr . ' ' . $name;

            // Skip if it belongs to one of the 13 main Phichit hospitals
            $isMainPhichit = false;
            foreach ($phichitHospcodes as $pCode) {
                if (str_contains($groupStr, $pCode) || str_contains($name, $pCode)) {
                    $isMainPhichit = true;
                    break;
                }
            }

            if ($isMainPhichit) {
                continue;
            }

            // Extract 5-digit MOPH Hospcode from group or agent name
            $code5 = null;
            if (preg_match('/(?:AA|EA|GA|BA|CA|DA)00(\d{5})/', $combined, $m)) {
                $code5 = $m[1];
            } elseif (preg_match('/(?:AA|EA|GA|BA|CA|DA)(\d{5})/', $combined, $m)) {
                $code5 = $m[1];
            } elseif (preg_match('/(?:^|[^0-9])(\d{5})(?:[^0-9]|$)/', $combined, $m)) {
                $code5 = $m[1];
            } elseif (str_contains($combined, 'R3NSW')) {
                $code5 = 'R3NSW';
            } else {
                $code5 = 'UNGROUPED';
            }

            if (! isset($buckets[$code5])) {
                $dir = self::$externalAgencyDirectory[$code5] ?? null;

                // Infer province from Wazuh group tags if not in static directory
                $inferredProvince = 'เครือข่ายเขตสุขภาพที่ 3';
                if (str_contains($groupStr, 'UTHAI')) {
                    $inferredProvince = 'จ.อุทัยธานี';
                } elseif (str_contains($groupStr, 'NAKHONSAWAN') || str_contains($groupStr, 'NSW')) {
                    $inferredProvince = 'จ.นครสวรรค์';
                } elseif (str_contains($groupStr, 'CHAINAT')) {
                    $inferredProvince = 'จ.ชัยนาท';
                } elseif (str_contains($groupStr, 'KAMPHAENGPHET') || str_contains($name, 'KPH')) {
                    $inferredProvince = 'จ.กำแพงเพชร';
                } elseif (str_contains($groupStr, 'PHICHIT')) {
                    $inferredProvince = 'จ.พิจิตร (รพ.สต./PCU)';
                }

                $agencyName = $dir['name'] ?? ("หน่วยบริการสุขภาพ รหัส {$code5}");
                $province = $dir['province'] ?? $inferredProvince;
                $agencyType = $dir['type'] ?? (str_starts_with($code5, '07') ? 'Primary Care Unit (รพ.สต.)' : 'Hospital / Health Agency');

                $buckets[$code5] = [
                    'code' => $code5,
                    'hospcode' => $code5,
                    'name' => $agencyName,
                    'province' => $province,
                    'type' => "{$agencyType} • {$province} • รหัส {$code5}",
                    'total' => 0,
                    'active' => 0,
                    'disconnected' => 0,
                    'subnet' => '-',
                    'os_primary' => '-',
                    'os_counts' => [],
                    'sample_agents' => [],
                ];
            }

            $buckets[$code5]['total']++;
            if (($agent['status'] ?? '') === 'active') {
                $buckets[$code5]['active']++;
            } else {
                $buckets[$code5]['disconnected']++;
            }

            if (! empty($agent['ip']) && $agent['ip'] !== 'any' && $buckets[$code5]['subnet'] === '-') {
                $buckets[$code5]['subnet'] = $agent['ip'];
            }

            $osName = $agent['os']['name'] ?? null;
            if (! empty($osName)) {
                $buckets[$code5]['os_counts'][$osName] = ($buckets[$code5]['os_counts'][$osName] ?? 0) + 1;
            }

            if (count($buckets[$code5]['sample_agents']) < 5) {
                $buckets[$code5]['sample_agents'][] = [
                    'id' => $agent['id'] ?? '-',
                    'name' => $agent['name'] ?? '-',
                    'ip' => $agent['ip'] ?? '-',
                    'status' => $agent['status'] ?? 'disconnected',
                ];
            }
        }

        $result = [];
        foreach ($buckets as $code5 => $data) {
            $total = $data['total'];
            $active = $data['active'];
            $health = $total > 0 ? round(($active / $total) * 100, 1) : 0;

            if (! empty($data['os_counts'])) {
                arsort($data['os_counts']);
                $topOs = array_slice(array_keys($data['os_counts']), 0, 2);
                $data['os_primary'] = implode(' / ', $topOs);
            } else {
                $data['os_primary'] = 'Windows / Linux Nodes';
            }

            unset($data['os_counts']);
            $data['health_score'] = $health;
            $data['status_level'] = $health >= 80 ? 'healthy' : ($health >= 65 ? 'warning' : 'critical');
            $result[] = $data;
        }

        // Sort by total nodes descending (putting UNGROUPED at the end)
        usort($result, function ($a, $b) {
            if ($a['code'] === 'UNGROUPED') {
                return 1;
            }
            if ($b['code'] === 'UNGROUPED') {
                return -1;
            }
            if ($b['total'] !== $a['total']) {
                return $b['total'] <=> $a['total'];
            }

            return strcmp($a['code'], $b['code']);
        });

        return $result;
    }

    /**
     * Map live raw agents from `https://ctmr.ppho.go.th:55000/agents` to the 13 Phichit hospitals
     * using their 5-digit MOPH Hospcode (`AA0000052`, `EA0010726`, `EA0011456`, etc.).
     */
    protected function mapLiveAgentsToHospitals(array $agents, array $agencies): array
    {
        $hospitals = [];
        $buckets = [];

        foreach ($agencies as $agency) {
            $code = $agency['code'];
            $hospcode = self::$hospitalHospcodeMap[$code] ?? $code;
            $buckets[$code] = [
                'code' => $code,
                'hospcode' => $hospcode,
                'name' => $agency['name'],
                'type' => $agency['type'] . " • รหัส {$hospcode}",
                'total' => 0,
                'active' => 0,
                'disconnected' => 0,
                'subnet' => '-',
                'os_primary' => '-',
                'os_counts' => [],
            ];
        }

        foreach ($agents as $agent) {
            if (($agent['id'] ?? '') === '000') {
                continue;
            }

            $matchedCode = null;
            $name = strtoupper((string) ($agent['name'] ?? ''));
            $groupList = is_array($agent['group'] ?? null) ? $agent['group'] : [];
            $groupStr = strtoupper(implode(' ', $groupList));

            // Match by exact 5-digit hospcode in group or agent name (e.g. EA0011456 -> 11456 -> 003)
            foreach (self::$hospitalHospcodeMap as $code => $hospcode) {
                if (str_contains($groupStr, $hospcode) || str_contains($name, $hospcode)) {
                    $matchedCode = $code;
                    break;
                }
            }

            if (! $matchedCode) {
                continue;
            }

            $buckets[$matchedCode]['total']++;
            if (($agent['status'] ?? '') === 'active') {
                $buckets[$matchedCode]['active']++;
            } else {
                $buckets[$matchedCode]['disconnected']++;
            }

            if (! empty($agent['ip']) && $agent['ip'] !== 'any' && $buckets[$matchedCode]['subnet'] === '-') {
                $buckets[$matchedCode]['subnet'] = $agent['ip'];
            }

            $osName = $agent['os']['name'] ?? null;
            if (! empty($osName)) {
                $buckets[$matchedCode]['os_counts'][$osName] = ($buckets[$matchedCode]['os_counts'][$osName] ?? 0) + 1;
            }
        }

        foreach ($buckets as $code => $data) {
            $total = $data['total'];
            $active = $data['active'];
            $health = $total > 0 ? round(($active / $total) * 100, 1) : 0;

            $statusLevel = 'healthy';
            if ($health < 65) {
                $statusLevel = 'critical';
            } elseif ($health < 80) {
                $statusLevel = 'warning';
            }

            if (! empty($data['os_counts'])) {
                arsort($data['os_counts']);
                $topOs = array_slice(array_keys($data['os_counts']), 0, 2);
                $data['os_primary'] = implode(' / ', $topOs);
            } else {
                $data['os_primary'] = 'Windows / Linux Nodes';
            }

            unset($data['os_counts']);
            $data['health_score'] = $health;
            $data['status_level'] = $statusLevel;
            $hospitals[] = $data;
        }

        return $hospitals;
    }

    /**
     * Fetch 24-hour Threat Severity Alerts Summary, Top Rule Groups, and Recent Security Events
     * from `https://ctmr.ppho.go.th` OpenSearch Indexer (`wazuh-alerts-*`).
     */
    public function getAlertsSummary(): array
    {
        $osdCookie = $this->getDashboardCookie();

        if ($osdCookie) {
            $cacheKey = 'wazuh_alerts_summary_' . md5($this->dashboardUrl);
            $cached = Cache::remember($cacheKey, $this->cacheTtl, function () use ($osdCookie) {
                try {
                    // 1. Aggregation + Recent High/Medium Events Query (rule.level >= 5)
                    $queryPayload = [
                        'size' => 8,
                        'sort' => [
                            ['timestamp' => ['order' => 'desc']],
                        ],
                        'query' => [
                            'bool' => [
                                'filter' => [
                                    [
                                        'range' => [
                                            'timestamp' => [
                                                'gte' => 'now-24h',
                                                'lte' => 'now',
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                        'aggs' => [
                            'severity_ranges' => [
                                'range' => [
                                    'field' => 'rule.level',
                                    'ranges' => [
                                        ['key' => 'low', 'from' => 0, 'to' => 7],
                                        ['key' => 'medium', 'from' => 7, 'to' => 12],
                                        ['key' => 'high', 'from' => 12, 'to' => 15],
                                        ['key' => 'critical', 'from' => 15],
                                    ],
                                ],
                            ],
                            'top_groups' => [
                                'terms' => [
                                    'field' => 'rule.groups',
                                    'size' => 4,
                                ],
                            ],
                            'high_priority_hits' => [
                                'filter' => [
                                    'range' => [
                                        'rule.level' => ['gte' => 10],
                                    ],
                                ],
                                'aggs' => [
                                    'top_high_hits' => [
                                        'top_hits' => [
                                            'size' => 6,
                                            'sort' => [
                                                ['timestamp' => ['order' => 'desc']],
                                            ],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ];

                    $response = Http::withHeaders([
                        'osd-xsrf' => 'true',
                        'Cookie' => $osdCookie,
                        'Content-Type' => 'application/json',
                    ])
                        ->withOptions(['verify' => $this->verifySsl])
                        ->timeout($this->timeout)
                        ->post(
                            "{$this->dashboardUrl}/api/console/proxy?path=" . urlencode('wazuh-alerts-*/_search') . '&method=POST',
                            $queryPayload
                        );

                    if ($response->successful()) {
                        $json = $response->json();
                        $buckets = collect($json['aggregations']['severity_ranges']['buckets'] ?? [])->keyBy('key');

                        $criticalCount = (int) ($buckets['critical']['doc_count'] ?? 0);
                        $highCount = (int) ($buckets['high']['doc_count'] ?? 0);
                        $mediumCount = (int) ($buckets['medium']['doc_count'] ?? 0);
                        $lowCount = (int) ($buckets['low']['doc_count'] ?? 0);
                        $total24h = $criticalCount + $highCount + $mediumCount + $lowCount;

                        // Parse Top Rule Groups
                        $groupBuckets = $json['aggregations']['top_groups']['buckets'] ?? [];
                        $groupSum = collect($groupBuckets)->sum('doc_count') ?: 1;
                        $categories = [];
                        foreach ($groupBuckets as $gb) {
                            $cnt = (int) ($gb['doc_count'] ?? 0);
                            $categories[] = [
                                'name' => strtoupper((string) ($gb['key'] ?? 'Security Rule')),
                                'count' => number_format($cnt),
                                'share' => round(($cnt / $groupSum) * 100, 1) . '%',
                            ];
                        }

                        // Prefer High Priority Hits (rule.level >= 10), fallback to latest general hits
                        $highHits = $json['aggregations']['high_priority_hits']['top_high_hits']['hits']['hits'] ?? [];
                        $generalHits = $json['hits']['hits'] ?? [];
                        $mergedHits = ! empty($highHits) ? array_merge($highHits, $generalHits) : $generalHits;

                        $recentEvents = [];
                        $seenIds = [];
                        foreach ($mergedHits as $hit) {
                            $hitId = $hit['_id'] ?? uniqid('evt_');
                            if (isset($seenIds[$hitId])) {
                                continue;
                            }
                            $seenIds[$hitId] = true;

                            $src = $hit['_source'] ?? [];
                            $recentEvents[] = [
                                'id' => $hitId,
                                'timestamp' => isset($src['timestamp'])
                                    ? Carbon::parse($src['timestamp'])->timezone('Asia/Bangkok')->format('d/m H:i:s')
                                    : Carbon::now()->format('d/m H:i:s'),
                                'agent_name' => $src['agent']['name'] ?? 'ctmr-node',
                                'agent_ip' => $src['agent']['ip'] ?? ($src['data']['srcip'] ?? '127.0.0.1'),
                                'rule_id' => $src['rule']['id'] ?? '-',
                                'rule_level' => (int) ($src['rule']['level'] ?? 3),
                                'description' => $src['rule']['description'] ?? 'Security event detected',
                                'mitre_id' => $src['rule']['mitre']['id'][0] ?? null,
                                'mitre_tactic' => $src['rule']['mitre']['tactic'][0] ?? null,
                            ];

                            if (count($recentEvents) >= 6) {
                                break;
                            }
                        }

                        return $this->buildAlertsSummaryStructure(
                            $criticalCount,
                            $highCount,
                            $mediumCount,
                            $lowCount,
                            $total24h,
                            $categories,
                            $recentEvents,
                            'live'
                        );
                    }
                } catch (Exception $e) {
                    Log::warning('Error querying OpenSearch alerts on ctmr.ppho.go.th: ' . $e->getMessage());
                }

                return null;
            });

            if ($cached) {
                return $cached;
            }
        }

        // Standardized Fallback Dataset
        $fallbackCategories = [
            ['name' => 'AUDIT / SELINUX', 'count' => '3,730,285', 'share' => '49.1%'],
            ['name' => 'WINDOWS APPLICATION', 'count' => '1,126,303', 'share' => '29.8%'],
            ['name' => 'SYSTEM ERROR', 'count' => '676,276', 'share' => '13.3%'],
            ['name' => 'WINDOWS SECURITY', 'count' => '294,365', 'share' => '7.8%'],
        ];

        $now = Carbon::now()->timezone('Asia/Bangkok');
        $fallbackRecentEvents = [
            [
                'id' => 'evt-101',
                'timestamp' => $now->copy()->subMinutes(4)->format('d/m H:i:s'),
                'agent_name' => 'ctmr-phichit',
                'agent_ip' => '109.160.32.152',
                'rule_id' => '5710',
                'rule_level' => 5,
                'description' => 'sshd: Attempt to login using a non-existent user',
                'mitre_id' => 'T1110.001',
                'mitre_tactic' => 'Credential Access',
            ],
        ];

        return $this->buildAlertsSummaryStructure(
            0,
            591,
            918026,
            4208070,
            5126687,
            $fallbackCategories,
            $fallbackRecentEvents,
            'simulated'
        );
    }

    /**
     * Format the standardized alerts summary structure for Dashboard.jsx.
     */
    protected function buildAlertsSummaryStructure(
        int $critical,
        int $high,
        int $medium,
        int $low,
        int $total24h,
        array $categories,
        array $recentEvents,
        string $source = 'simulated'
    ): array {
        return [
            'source' => $source,
            'critical' => number_format($critical),
            'high' => number_format($high),
            'medium' => number_format($medium),
            'low' => number_format($low),
            'total_24h' => number_format($total24h),
            'period' => '24 ชั่วโมงที่ผ่านมา',
            'severity_levels' => [
                [
                    'id' => 'critical',
                    'label' => 'Critical severity',
                    'sub' => 'Rule level 15 or higher',
                    'count' => number_format($critical),
                    'color' => '#BD271E',
                    'accent' => 'rose',
                    'badge' => $critical > 0 ? 'พบภัยคุกคามวิกฤต ต้องตรวจสอบทันที' : 'ไม่มีภัยคุกคามรุนแรง',
                    'icon' => '🚨',
                ],
                [
                    'id' => 'high',
                    'label' => 'High severity',
                    'sub' => 'Rule level 12 to 14',
                    'count' => number_format($high),
                    'color' => '#FEC514',
                    'accent' => 'amber',
                    'badge' => 'ตรวจพบและระงับเหตุแล้ว',
                    'icon' => '⚠️',
                ],
                [
                    'id' => 'medium',
                    'label' => 'Medium severity',
                    'sub' => 'Rule level 7 to 11',
                    'count' => number_format($medium),
                    'color' => '#6092C0',
                    'accent' => 'sky',
                    'badge' => 'วิเคราะห์และจัดเก็บ Log',
                    'icon' => '🔵',
                ],
                [
                    'id' => 'low',
                    'label' => 'Low severity',
                    'sub' => 'Rule level 0 to 6',
                    'count' => number_format($low),
                    'color' => '#007871',
                    'accent' => 'emerald',
                    'badge' => 'บันทึกพฤติกรรมระบบทั่วไป',
                    'icon' => '🟢',
                ],
            ],
            'categories' => $categories,
            'recent_events' => $recentEvents,
        ];
    }
}
