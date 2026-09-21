<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

class TwoFactorAuthTest extends TestCase
{
    use RefreshDatabase;

    protected Google2FA $google2fa;

    protected function setUp(): void
    {
        parent::setUp();
        $this->google2fa = new Google2FA();
        $this->seed(\Database\Seeders\UserSeeder::class);
    }

    public function test_user_without_2fa_logs_in_directly_to_dashboard(): void
    {
        $response = $this->post('/login', [
            'provider_id' => 'ADMIN001',
            'password' => 'password',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticated();
    }

    public function test_user_with_2fa_enabled_is_redirected_to_two_factor_challenge(): void
    {
        $user = User::where('provider_id', 'ADMIN001')->first();
        $secret = $this->google2fa->generateSecretKey(16);

        $user->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => ['CODE1-11111', 'CODE2-22222'],
            'two_factor_confirmed_at' => now(),
        ])->save();

        $response = $this->post('/login', [
            'provider_id' => 'ADMIN001',
            'password' => 'password',
        ]);

        $response->assertRedirect(route('two-factor.challenge'));
        $this->assertGuest();
        $this->assertEquals($user->id, session('login.id'));
    }

    public function test_guest_without_pending_login_is_redirected_from_two_factor_challenge(): void
    {
        $response = $this->get('/two-factor-challenge');
        $response->assertRedirect('/login');
    }

    public function test_user_can_verify_two_factor_challenge_with_valid_totp_code(): void
    {
        $user = User::where('provider_id', 'ADMIN001')->first();
        $secret = $this->google2fa->generateSecretKey(16);

        $user->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_confirmed_at' => now(),
        ])->save();

        // Simulate login phase 1
        $this->withSession(['login.id' => $user->id, 'login.remember' => false]);

        // Generate current TOTP code
        $validCode = $this->google2fa->getCurrentOtp($secret);

        $response = $this->post('/two-factor-challenge', [
            'code' => $validCode,
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);
    }

    public function test_two_factor_challenge_fails_with_invalid_code(): void
    {
        $user = User::where('provider_id', 'ADMIN001')->first();
        $secret = $this->google2fa->generateSecretKey(16);

        $user->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_confirmed_at' => now(),
        ])->save();

        $this->withSession(['login.id' => $user->id]);

        $response = $this->post('/two-factor-challenge', [
            'code' => '000000',
        ]);

        $response->assertSessionHasErrors('code');
        $this->assertGuest();
    }

    public function test_user_can_login_with_emergency_recovery_code(): void
    {
        $user = User::where('provider_id', 'ADMIN001')->first();
        $secret = $this->google2fa->generateSecretKey(16);

        $user->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => ['RECOV-12345', 'RECOV-67890'],
            'two_factor_confirmed_at' => now(),
        ])->save();

        $this->withSession(['login.id' => $user->id]);

        $response = $this->post('/two-factor-challenge', [
            'recovery_code' => 'RECOV-12345',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($user);

        // Verify recovery code was consumed
        $user->refresh();
        $this->assertNotContains('RECOV-12345', $user->two_factor_recovery_codes);
        $this->assertContains('RECOV-67890', $user->two_factor_recovery_codes);
    }

    public function test_authenticated_user_can_view_2fa_settings_page(): void
    {
        $user = User::where('provider_id', 'ADMIN001')->first();

        $response = $this->actingAs($user)->get('/security/two-factor');
        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_confirm_and_enable_2fa(): void
    {
        $user = User::where('provider_id', 'ADMIN001')->first();
        $secret = $this->google2fa->generateSecretKey(16);

        $user->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_confirmed_at' => null,
        ])->save();

        $validOtp = $this->google2fa->getCurrentOtp($secret);

        $response = $this->actingAs($user)->post('/security/two-factor/confirm', [
            'code' => $validOtp,
        ]);

        $response->assertRedirect(route('two-factor.settings'));
        $response->assertSessionHas('two_factor_recovery_codes');

        $user->refresh();
        $this->assertTrue($user->hasEnabledTwoFactor());
        $this->assertCount(8, $user->two_factor_recovery_codes);
    }

    public function test_authenticated_user_can_disable_2fa_with_valid_password(): void
    {
        $user = User::where('provider_id', 'ADMIN001')->first();
        $secret = $this->google2fa->generateSecretKey(16);

        $user->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_confirmed_at' => now(),
        ])->save();

        $response = $this->actingAs($user)->delete('/security/two-factor', [
            'password' => 'password',
        ]);

        $response->assertRedirect(route('two-factor.settings'));

        $user->refresh();
        $this->assertFalse($user->hasEnabledTwoFactor());
        $this->assertNull($user->two_factor_secret);
    }

    public function test_admin_can_reset_2fa_for_another_user(): void
    {
        $admin = User::where('provider_id', 'ADMIN001')->first();
        $hospitalUser = User::where('provider_id', 'HOS002')->first();

        $hospitalUser->forceFill([
            'two_factor_secret' => 'SECRETKEY1234567',
            'two_factor_confirmed_at' => now(),
        ])->save();

        $response = $this->actingAs($admin)->post("/users/{$hospitalUser->id}/reset-2fa");

        $response->assertRedirect();
        $hospitalUser->refresh();
        $this->assertFalse($hospitalUser->hasEnabledTwoFactor());
        $this->assertNull($hospitalUser->two_factor_secret);
    }
}
