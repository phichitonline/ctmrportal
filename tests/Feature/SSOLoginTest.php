<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class SSOLoginTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\UserSeeder::class);
    }

    public function test_sso_callback_creates_new_user_and_logs_in(): void
    {
        $hashCid = 'd41d8cd98f00b204e9800998ecf8427e';
        $ts = time();
        $secret = config('services.sso.shared_secret', '');
        $payload = json_encode(['hash_cid' => $hashCid, 'ts' => $ts], JSON_UNESCAPED_UNICODE);
        $sig = $secret ? hash_hmac('sha256', $payload, $secret) : 'dummy_sig';

        $response = $this->get('/auth/moph/callback?' . http_build_query([
            'hash_cid' => $hashCid,
            'ts' => $ts,
            'sig' => $sig,
            'providerid' => 'MOPH12345',
            'fname' => 'ทดสอบ',
            'lname' => 'ผู้ใช้เอสเอสโอ',
            'email' => 'test_sso@moph.go.th',
            'hospcode' => '002',
            'hname_th' => 'โรงพยาบาลพิจิตร',
        ]));

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticated();

        $user = User::where('moph_id', 'MOPH12345')->first();
        $this->assertNotNull($user);
        $this->assertEquals('ทดสอบ ผู้ใช้เอสเอสโอ', $user->name);
        $this->assertEquals('MOPH12345', $user->provider_id);
        $this->assertEquals('002', $user->agency_code);
        $this->assertEquals('โรงพยาบาลพิจิตร', $user->agency_name);
        $this->assertTrue($user->is_active);
    }

    public function test_sso_callback_matches_existing_user(): void
    {
        // Existing user from seeder: ADMIN001 (or create one)
        $existingUser = User::where('provider_id', 'ADMIN001')->first();
        if (! $existingUser) {
            $existingUser = User::create([
                'name' => 'นายสมมติ ทดสอบ',
                'provider_id' => 'ADMIN001',
                'email' => 'admin001@example.com',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'agency_code' => '001',
                'agency_name' => 'สำนักงานสาธารณสุขจังหวัดพิจิตร',
                'is_active' => true,
            ]);
        }

        $hashCid = 'a1b2c3d4e5f60718293a';
        $ts = time();
        $secret = config('services.sso.shared_secret', '');
        $payload = json_encode(['hash_cid' => $hashCid, 'ts' => $ts], JSON_UNESCAPED_UNICODE);
        $sig = $secret ? hash_hmac('sha256', $payload, $secret) : 'dummy_sig';

        $response = $this->get('/auth/moph/callback?' . http_build_query([
            'hash_cid' => $hashCid,
            'ts' => $ts,
            'sig' => $sig,
            'providerid' => 'ADMIN001', // matches existing provider_id
            'fname' => 'นายสมมติ',
            'lname' => 'ทดสอบ',
            'email' => $existingUser->email,
        ]));

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($existingUser);

        $existingUser->refresh();
        $this->assertEquals('ADMIN001', $existingUser->moph_id);
        $this->assertEquals($hashCid, $existingUser->pid);
    }

    public function test_sso_callback_fails_with_expired_timestamp(): void
    {
        $hashCid = 'd41d8cd98f00b204e9800998ecf8427e';
        $ts = time() - 600; // 10 minutes ago
        $secret = config('services.sso.shared_secret', '');
        $payload = json_encode(['hash_cid' => $hashCid, 'ts' => $ts], JSON_UNESCAPED_UNICODE);
        $sig = $secret ? hash_hmac('sha256', $payload, $secret) : 'dummy_sig';

        $response = $this->get('/auth/moph/callback?' . http_build_query([
            'hash_cid' => $hashCid,
            'ts' => $ts,
            'sig' => $sig,
        ]));

        $response->assertRedirect('/login');
        $this->assertGuest();
    }

    public function test_sso_callback_fails_for_inactive_user(): void
    {
        $inactiveUser = User::create([
            'name' => 'ผู้ใช้ระงับ',
            'provider_id' => 'INACTIVE001',
            'email' => 'inactive@example.com',
            'moph_id' => 'INACTIVE_MOPH',
            'password' => Hash::make('password'),
            'role' => 'hospital_user',
            'agency_code' => '001',
            'agency_name' => 'สำนักงานสาธารณสุขจังหวัดพิจิตร',
            'is_active' => false,
        ]);

        $hashCid = 'inactive_hash_cid';
        $ts = time();
        $secret = config('services.sso.shared_secret', '');
        $payload = json_encode(['hash_cid' => $hashCid, 'ts' => $ts], JSON_UNESCAPED_UNICODE);
        $sig = $secret ? hash_hmac('sha256', $payload, $secret) : 'dummy_sig';

        $response = $this->get('/auth/moph/callback?' . http_build_query([
            'hash_cid' => $hashCid,
            'ts' => $ts,
            'sig' => $sig,
            'providerid' => 'INACTIVE_MOPH',
        ]));

        $response->assertRedirect('/login');
        $this->assertGuest();
    }
}
