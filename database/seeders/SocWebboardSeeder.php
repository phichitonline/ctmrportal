<?php

namespace Database\Seeders;

use App\Models\SocComment;
use App\Models\SocTopic;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class SocWebboardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin1 = User::find(1) ?? User::first();
        $admin2 = User::find(2) ?? $admin1;
        $user3 = User::find(3) ?? $admin1;
        $user4 = User::find(4) ?? $admin1;
        $user5 = User::find(5) ?? $admin1;

        if (!$admin1) {
            return;
        }

        // Topic 1: Pinned announcement
        $t1 = SocTopic::create([
            'user_id' => $admin2->id,
            'title' => '📢 ประกาศระเบียบปฏิบัติและมาตรฐานการส่งมอบเวรศูนย์เฝ้าระวัง SOC (CTMR R3 Phichit)',
            'category' => 'announcement',
            'severity' => 'high',
            'status' => 'open',
            'agency_code' => '001',
            'agency_name' => 'สำนักงานสาธารณสุขจังหวัดพิจิตร',
            'system_affected' => 'ทุกโหนดเครือข่ายโรงพยาบาลในสังกัด สสจ.พิจิตร',
            'content' => "เรียน ทีมงานผู้ดูแลระบบและเจ้าหน้าที่ศูนย์ SOC จังหวัดพิจิตรทุกท่าน\n\nเพื่อยกระดับความปลอดภัยทางไซเบอร์ตามมาตรฐาน สกมช. ขอความร่วมมือเจ้าหน้าที่ผู้ปฏิบัติหน้าที่เวรศูนย์ SOC ทุกผลัด (เช้า / บ่าย / ดึก) บันทึกสรุปรายงานเหตุการณ์ผ่านระบบกระดานข่าวสารนี้ทุกครั้งก่อนส่งมอบงาน\n\n**ข้อกำหนดสำคัญ:**\n1. ตรวจสอบสถานะการเชื่อมต่อของ Wazuh Agent ทั้ง 13 โรงพยาบาล\n2. บันทึก Alerts ระดับ 10 ขึ้นไป พร้อมตรวจสอบและระบุ Action Taken\n3. ส่งมอบประเด็นค้างคาและข้อสังเกตให้ผลัดถัดไปรับทราบทุกครั้ง",
            'is_pinned' => true,
            'is_locked' => false,
            'views_count' => 84,
            'created_at' => Carbon::now()->subDays(3),
        ]);

        SocComment::create([
            'topic_id' => $t1->id,
            'user_id' => $admin1->id,
            'content' => 'รับทราบและเริ่มใช้ระบบรายงานผ่านกระดานข่าวนี้เป็นช่องทางมาตรฐานหลักครับ',
            'is_solution' => false,
            'created_at' => Carbon::now()->subDays(2),
        ]);

        // Topic 2: SOC Shift Report
        $t2 = SocTopic::create([
            'user_id' => $admin1->id,
            'title' => 'รายงานผลการปฏิบัติงานเวร SOC ผลัดดึก (00:00 - 08:00 น.) ประจำวันที่ 19 ก.ย. 2026',
            'category' => 'soc_report',
            'severity' => 'normal',
            'status' => 'resolved',
            'agency_code' => '001',
            'agency_name' => 'สำนักงานสาธารณสุขจังหวัดพิจิตร',
            'shift' => 'night',
            'shift_date' => Carbon::today(),
            'system_affected' => 'Wazuh Cluster, Graylog, Core Switch PPHO',
            'content' => "สรุปผลการเฝ้าระวังความมั่นคงปลอดภัยระบบเครือข่ายสาธารณสุขประจำผลัดดึก:\n\n1. **สถานะแม่ข่ายหลัก:** Wazuh Manager & Indexer ทำงานปกติ CPU avg 24%, Memory avg 42%, Disk Space คงเหลือ 68%\n2. **สถานะ Agent Nodes:** ทั้ง 13 โรงพยาบาลเชื่อมต่อ Active ครบ 100%\n3. **เหตุการณ์ที่ตรวจพบ:** ตรวจพบ Port Scanning จาก IP 103.245.xxx.xxx เมื่อเวลา 02:15 น. ระบบ Firewall ทำการ Auto-block Drop traffic อัตโนมัติ ไม่พบการบุกรุกสำเร็จ\n4. **งานส่งมอบผลัดเช้า:** ฝากมอนิเตอร์ Traffic ช่วงเวลาเปิดทำการ 08:30 - 10:00 น. ของ รพ.พิจิตร และ รพ.สมเด็จพระยุพราชตะพานหิน",
            'resolution_notes' => 'ส่งมอบเวรให้ทีมผลัดเช้าเรียบร้อย ระบบทุกส่วนทำงานเป็นปกติ',
            'resolved_by' => $admin1->id,
            'resolved_at' => Carbon::now()->subHours(8),
            'is_pinned' => false,
            'views_count' => 45,
            'created_at' => Carbon::now()->subHours(9),
        ]);

        SocComment::create([
            'topic_id' => $t2->id,
            'user_id' => $admin2->id,
            'content' => 'ผลัดเช้ารับมอบเวรเรียบร้อยครับ ดำเนินการตรวจสอบ Log เพิ่มเติมและมอนิเตอร์ต่อเนื่องครับ',
            'is_solution' => true,
            'created_at' => Carbon::now()->subHours(8),
        ]);

        // Topic 3: Critical Incident Alert
        $t3 = SocTopic::create([
            'user_id' => $user3->id,
            'title' => '🚨 ตรวจพบการพยายาม Brute Force รหัสผ่าน RDP พุ่งเป้าเครื่อง Backup Server',
            'category' => 'incident_alert',
            'severity' => 'critical',
            'status' => 'in_progress',
            'agency_code' => '002',
            'agency_name' => 'โรงพยาบาลพิจิตร',
            'system_affected' => 'Backup Server (192.168.10.250) / RDP Port 3389',
            'content' => "ตรวจพบการล็อกอินผิดพลาดติดต่อกันมากกว่า 1,500 ครั้ง ภายใน 10 นาที มาจาก IP ภายในวง VLAN ฝ่ายสนับสนุน\n\n- เวลาที่เกิดเหตุ: 19:40 น.\n- Event ID: 4625 (An account failed to log on)\n- แอคเคานต์เป้าหมาย: administrator, backup_admin, root\n\nการดำเนินการชั่วคราว: ได้สั่ง Disable RDP Service บนเครื่องเป้าหมายชั่วคราว และแยกเครื่องต้องสงสัยออกจากวงแลนเพื่อทำ Threat Hunting",
            'is_pinned' => false,
            'views_count' => 120,
            'created_at' => Carbon::now()->subHours(3),
        ]);

        SocComment::create([
            'topic_id' => $t3->id,
            'user_id' => $admin1->id,
            'content' => 'ทีม SOC กลางกำลังดึง Sysmon Logs และ Wazuh Alert Details ตรวจสอบเพิ่มเติม ขอให้ฝ่ายไอที รพ.พิจิตร อย่าเพิ่ง reboot เครื่องต้นทาง เพื่อเก็บ Live Memory Dumps นะครับ',
            'is_solution' => false,
            'created_at' => Carbon::now()->subHours(2),
        ]);

        // Topic 4: Technical Discussion with Solution
        $t4 = SocTopic::create([
            'user_id' => $user5->id,
            'title' => 'ขอคำปรึกษาการติดตั้งและจูน Wazuh Agent บน Rocky Linux 9 ของเครื่องฐานข้อมูล HOSxP',
            'category' => 'discussion',
            'severity' => 'medium',
            'status' => 'resolved',
            'agency_code' => '004',
            'agency_name' => 'โรงพยาบาลบางมูลนาก',
            'system_affected' => 'HOSxP Database Server (MySQL/MariaDB)',
            'content' => "สวัสดีครับทีมงาน รพ.บางมูลนาก กำลังอัปเกรดเครื่องฐานข้อมูลหลักเป็น Rocky Linux 9 เมื่อลง Wazuh Agent แล้วพบปัญหา FIM (File Integrity Monitoring) กิน I/O สูงมากช่วงเวลาคนไข้หนาแน่น มีคำแนะนำการตั้งค่า `ossec.conf` เพื่อ exclude โฟลเดอร์ data ของ MySQL อย่างไรบ้างครับ?",
            'resolution_notes' => 'ตั้งค่า ignore path ใน ossec.conf ตามคำแนะนำของ Admin ช่วยลด Disk I/O ลงได้มากกว่า 85%',
            'resolved_by' => $user5->id,
            'resolved_at' => Carbon::now()->subDays(1),
            'is_pinned' => false,
            'views_count' => 67,
            'created_at' => Carbon::now()->subDays(2),
        ]);

        SocComment::create([
            'topic_id' => $t4->id,
            'user_id' => $admin1->id,
            'content' => "สำหรับ Database Server แนะนำให้ exclude ไดเรกทอรีข้อมูลดังนี้ครับ:\n\n```xml\n<syscheck>\n  <ignore>/var/lib/mysql</ignore>\n  <ignore>/var/lib/mysql/ib_logfile*</ignore>\n  <ignore type=\"sregex\">^/var/lib/mysql/.*\\.ibd$</ignore>\n</syscheck>\n```\n\nและควรตั้งความถี่การสแกน `frequency` เป็น 43200 (12 ชั่วโมง) แทนที่จะเป็นแบบ realtime ครับ",
            'is_solution' => true,
            'created_at' => Carbon::now()->subDays(1)->addHours(2),
        ]);

        SocComment::create([
            'topic_id' => $t4->id,
            'user_id' => $user5->id,
            'content' => 'นำคอนฟิกไปใช้เรียบร้อยแล้วครับ ทดสอบรันมา 1 วัน CPU และ Disk I/O ปกติ ไม่สะดุดเลย ขอบคุณมากครับ!',
            'is_solution' => false,
            'created_at' => Carbon::now()->subDays(1)->addHours(4),
        ]);

        // Topic 5: Troubleshooting Knowledge Base
        $t5 = SocTopic::create([
            'user_id' => $user4->id,
            'title' => 'บันทึกวิธีแก้ปัญหา: Agent ขึ้นสถานะ Disconnected หลังเปลี่ยน Core Firewall',
            'category' => 'troubleshoot',
            'severity' => 'low',
            'status' => 'resolved',
            'agency_code' => '003',
            'agency_name' => 'รพ.สมเด็จพระยุพราชตะพานหิน',
            'system_affected' => 'FortiGate Firewall / Wazuh Agent Port 1514, 1515',
            'content' => "เกร็ดความรู้สำหรับ รพ. ที่มีการเปลี่ยนหรือคอนฟิกไฟร์วอลล์ใหม่:\n\n**ปัญหาที่พบ:** หลังจากเปลี่ยน Firewall แล้ว Agent ไม่สามารถติดต่อ Wazuh Manager ที่ สสจ. ได้\n\n**สาเหตุ:** Security Policy ของ Firewall มีการบล็อกพอร์ต TCP 1514 (Agent Event Reporting) และ TCP 1515 (Agent Enrollment/Registration)\n\n**วิธีแก้ปัญหา:**\n1. ตรวจสอบ Firewall Policy ให้ Allow TCP Port 1514 และ 1515 จากวงแลนโรงพยาบาลไปยัง IP ของ Wazuh Server สสจ.\n2. ปิด Deep SSL Inspection บนพอร์ตดังกล่าวเนื่องจาก Wazuh มีการเข้ารหัส TLS ภายในตัวอยู่แล้ว\n3. Restart Service: `systemctl restart wazuh-agent`",
            'resolution_notes' => 'จัดทำเป็น Runbook คู่มือสำหรับโรงพยาบาลในเครือข่าย',
            'resolved_by' => $user4->id,
            'resolved_at' => Carbon::now()->subDays(4),
            'is_pinned' => false,
            'views_count' => 112,
            'created_at' => Carbon::now()->subDays(5),
        ]);
    }
}
