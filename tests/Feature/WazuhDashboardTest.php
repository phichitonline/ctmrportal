<?php

namespace Tests\Feature;

use App\Models\SocTopic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WazuhDashboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_from_dashboard(): void
    {
        $response = $this->get('/dashboard');
        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_view_dashboard_with_all_13_hospitals(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        // Create a SOC shift report so the dashboard summary displays it
        SocTopic::create([
            'user_id' => $user->id,
            'title' => 'รายงานเวรทดสอบระบบประจำวัน',
            'category' => 'soc_report',
            'severity' => 'normal',
            'status' => 'resolved',
            'content' => 'เนื้อหาผลการทดสอบการส่งมอบเวร',
        ]);

        $response = $this->actingAs($user)->get('/dashboard');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Dashboard')
                ->has('agentsSummary')
                ->has('hospitalsAgents', 13) // Exactly 13 hospitals
                ->has('alertsSummary')
                ->has('connectionStatus')
                ->has('socWebboardSummary')
        );
    }

    public function test_authenticated_user_can_call_dashboard_sync_endpoint(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/dashboard/sync');

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'agentsSummary',
            'hospitalsAgents',
            'alertsSummary',
            'connectionStatus',
            'lastUpdated',
        ]);
        $this->assertCount(13, $response->json('hospitalsAgents'));
    }
}
