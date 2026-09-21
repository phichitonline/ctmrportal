<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthAndUserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\UserSeeder::class);
    }

    public function test_guest_is_redirected_to_login_when_accessing_dashboard(): void
    {
        $response = $this->get('/');
        $response->assertRedirect('/login');
    }

    public function test_guest_can_view_login_page(): void
    {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }

    public function test_user_can_login_with_provider_id(): void
    {
        $admin = User::where('provider_id', 'ADMIN001')->first();
        if (! $admin) {
            $admin = User::create([
                'name' => 'นายณฐพงศ์ ครุฑเทศ',
                'provider_id' => 'ADMIN001',
                'email' => 'nathaphong@ppho.go.th',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'agency_code' => '001',
                'agency_name' => 'สำนักงานสาธารณสุขจังหวัดพิจิตร',
                'is_active' => true,
            ]);
        }

        $response = $this->post('/login', [
            'provider_id' => 'ADMIN001',
            'password' => 'password',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($admin);
    }

    public function test_login_fails_with_invalid_password(): void
    {
        $response = $this->post('/login', [
            'provider_id' => 'ADMIN001',
            'password' => 'wrong-password',
        ]);

        $response->assertSessionHasErrors('provider_id');
        $this->assertGuest();
    }

    public function test_inactive_user_cannot_login(): void
    {
        User::where('provider_id', 'INACTIVE01')->delete();
        User::create([
            'name' => 'Inactive User',
            'provider_id' => 'INACTIVE01',
            'password' => Hash::make('password'),
            'role' => 'hospital_user',
            'agency_code' => '002',
            'agency_name' => 'โรงพยาบาลพิจิตร',
            'is_active' => false,
        ]);

        $response = $this->post('/login', [
            'provider_id' => 'INACTIVE01',
            'password' => 'password',
        ]);

        $response->assertSessionHasErrors('provider_id');
        $this->assertGuest();
    }

    public function test_admin_can_access_users_management(): void
    {
        $admin = User::where('provider_id', 'ADMIN001')->first();

        $response = $this->actingAs($admin)->get('/users');
        $response->assertStatus(200);
    }

    public function test_hospital_user_is_forbidden_from_users_management(): void
    {
        $hospitalUser = User::where('role', 'hospital_user')->first();

        $response = $this->actingAs($hospitalUser)->get('/users');
        $response->assertStatus(403);
    }

    public function test_admin_can_create_new_hospital_user(): void
    {
        $admin = User::where('provider_id', 'ADMIN001')->first();

        User::where('provider_id', 'HOS999')->delete();

        $response = $this->actingAs($admin)->post('/users', [
            'name' => 'ทดสอบ เพิ่มผู้ใช้งาน',
            'provider_id' => 'HOS999',
            'email' => 'test_hospital@ppho.go.th',
            'password' => 'password123',
            'role' => 'hospital_user',
            'agency_code' => '007',
            'position' => 'นักวิชาการคอมพิวเตอร์',
            'phone' => '056-123456',
            'is_active' => true,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('users', [
            'provider_id' => 'HOS999',
            'role' => 'hospital_user',
            'agency_code' => '007',
        ]);
    }

    public function test_admin_can_update_user(): void
    {
        $admin = User::where('provider_id', 'ADMIN001')->first();
        $targetUser = User::where('provider_id', 'HOS002')->first();

        $response = $this->actingAs($admin)->put("/users/{$targetUser->id}", [
            'name' => 'ทดสอบ แก้ไขชื่อผู้ใช้งาน',
            'provider_id' => 'HOS002',
            'email' => 'updated@ppho.go.th',
            'role' => 'hospital_user',
            'agency_code' => '002',
            'position' => 'หัวหน้างานสารสนเทศ',
            'phone' => '056-999999',
            'is_active' => true,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'name' => 'ทดสอบ แก้ไขชื่อผู้ใช้งาน',
            'position' => 'หัวหน้างานสารสนเทศ',
        ]);
    }

    public function test_admin_can_toggle_user_status(): void
    {
        $admin = User::where('provider_id', 'ADMIN001')->first();
        $targetUser = User::where('provider_id', 'HOS002')->first();
        $initialStatus = $targetUser->is_active;

        $response = $this->actingAs($admin)->patch("/users/{$targetUser->id}/toggle");
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('users', [
            'id' => $targetUser->id,
            'is_active' => ! $initialStatus,
        ]);
    }

    public function test_admin_cannot_toggle_or_delete_self(): void
    {
        $admin = User::where('provider_id', 'ADMIN001')->first();

        $toggleResponse = $this->actingAs($admin)->patch("/users/{$admin->id}/toggle");
        $toggleResponse->assertSessionHas('error');

        $deleteResponse = $this->actingAs($admin)->delete("/users/{$admin->id}");
        $deleteResponse->assertSessionHas('error');
    }

    public function test_authenticated_user_can_logout(): void
    {
        $admin = User::where('provider_id', 'ADMIN001')->first();

        $response = $this->actingAs($admin)->post('/logout');
        $response->assertRedirect('/login');
        $this->assertGuest();
    }
}
