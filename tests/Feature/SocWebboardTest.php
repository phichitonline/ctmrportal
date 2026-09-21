<?php

namespace Tests\Feature;

use App\Models\SocComment;
use App\Models\SocTopic;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SocWebboardTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_is_redirected_to_login_from_webboard(): void
    {
        $response = $this->get('/webboard');
        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_view_webboard_index(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($user)->get('/webboard');
        $response->assertStatus(200);
    }

    public function test_authenticated_user_can_create_soc_topic(): void
    {
        $user = User::factory()->create([
            'role' => 'hospital_user',
            'agency_code' => '002',
            'agency_name' => 'โรงพยาบาลพิจิตร',
        ]);

        $response = $this->actingAs($user)->post('/webboard', [
            'title' => 'ทดสอบประเด็นการเชื่อมต่อเครือข่าย',
            'category' => 'discussion',
            'severity' => 'medium',
            'agency_code' => '002',
            'agency_name' => 'โรงพยาบาลพิจิตร',
            'system_affected' => 'Core Switch',
            'content' => 'เนื้อหาทดสอบการใช้งานระบบกระดานข่าวสารอย่างละเอียด',
        ]);

        $topic = SocTopic::where('title', 'ทดสอบประเด็นการเชื่อมต่อเครือข่าย')->first();
        $this->assertNotNull($topic);
        $this->assertEquals('open', $topic->status);
        $this->assertEquals($user->id, $topic->user_id);
        $response->assertRedirect("/webboard/{$topic->id}");
    }

    public function test_user_can_create_topic_with_uploaded_images(): void
    {
        \Illuminate\Support\Facades\Storage::fake('public');

        $user = User::factory()->create();
        $image = \Illuminate\Http\UploadedFile::fake()->image('wazuh_alert.png');

        $response = $this->actingAs($user)->post('/webboard', [
            'title' => 'รายงานเวรพร้อมแนบภาพสกรีนช็อต',
            'category' => 'soc_report',
            'severity' => 'high',
            'content' => 'สรุปผลัดเวรตรวจพบเหตุการณ์ตามภาพสกรีนช็อตที่แนบ',
            'image' => $image,
        ]);

        $topic = SocTopic::where('title', 'รายงานเวรพร้อมแนบภาพสกรีนช็อต')->first();
        $this->assertNotNull($topic);
        $this->assertNotNull($topic->image_path);
        $this->assertCount(1, $topic->images);
        $response->assertRedirect("/webboard/{$topic->id}");
    }

    public function test_user_can_add_comment_to_topic(): void
    {
        $user = User::factory()->create();
        $topic = SocTopic::create([
            'user_id' => $user->id,
            'title' => 'หัวข้อทดสอบการคอมเมนต์',
            'category' => 'discussion',
            'severity' => 'normal',
            'status' => 'open',
            'content' => 'เนื้อหาของกระทู้ทดสอบ',
        ]);

        $commenter = User::factory()->create();

        $response = $this->actingAs($commenter)->post("/webboard/{$topic->id}/comments", [
            'content' => 'ข้อความตอบกลับเพื่อทดสอบระบบ',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('soc_comments', [
            'topic_id' => $topic->id,
            'user_id' => $commenter->id,
            'content' => 'ข้อความตอบกลับเพื่อทดสอบระบบ',
        ]);

        // Topic status should transition to in_progress
        $topic->refresh();
        $this->assertEquals('in_progress', $topic->status);
    }

    public function test_topic_author_can_mark_comment_as_solution(): void
    {
        $author = User::factory()->create();
        $topic = SocTopic::create([
            'user_id' => $author->id,
            'title' => 'ปัญหาที่รอคำตอบ',
            'category' => 'troubleshoot',
            'severity' => 'high',
            'status' => 'open',
            'content' => 'รายละเอียดปัญหา',
        ]);

        $helper = User::factory()->create();
        $comment = SocComment::create([
            'topic_id' => $topic->id,
            'user_id' => $helper->id,
            'content' => 'นี่คือวิธีแก้ไขที่ถูกต้องครับ',
        ]);

        $response = $this->actingAs($author)->patch("/webboard/comments/{$comment->id}/solution");

        $response->assertSessionHas('success');
        $comment->refresh();
        $topic->refresh();

        $this->assertTrue($comment->is_solution);
        $this->assertEquals('resolved', $topic->status);
        $this->assertEquals($author->id, $topic->resolved_by);
    }

    public function test_admin_can_toggle_pin(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $topic = SocTopic::create([
            'user_id' => $admin->id,
            'title' => 'ประกาศสำคัญจากแอดมิน',
            'category' => 'announcement',
            'severity' => 'high',
            'status' => 'open',
            'content' => 'เนื้อหาประกาศ',
            'is_pinned' => false,
        ]);

        $response = $this->actingAs($admin)->patch("/webboard/{$topic->id}/pin");
        $response->assertSessionHas('success');

        $topic->refresh();
        $this->assertTrue($topic->is_pinned);
    }
}
