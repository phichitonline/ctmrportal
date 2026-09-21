<?php

namespace Database\Seeders;

use App\Models\AgencyTask;
use App\Models\AgencyTaskStep;
use App\Models\StepAttachment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class AgencyTaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('provider_id', 'ADMIN001')->first() ?? User::first();
        $staff002 = User::where('provider_id', 'HOS002')->first() ?? $admin;
        $staff003 = User::where('provider_id', 'HOS003')->first() ?? $admin;

        // Ensure storage directory exists
        Storage::disk('public')->makeDirectory('agency_docs/002');
        Storage::disk('public')->makeDirectory('agency_docs/003');
        Storage::disk('public')->makeDirectory('agency_docs/001');

        // Helper to create sample file
        $createSampleFile = function (string $relPath, string $content) {
            Storage::disk('public')->put($relPath, $content);
            return $relPath;
        };

        // ==========================================
        // TASK 1: โรงพยาบาลพิจิตร (002)
        // ==========================================
        $task1 = AgencyTask::create([
            'agency_code' => '002',
            'agency_name' => 'โรงพยาบาลพิจิตร',
            'user_id' => $staff002->id,
            'assigned_user_id' => $staff002->id,
            'title' => 'โครงการยกระดับความมั่นคงปลอดภัยสารสนเทศโรงพยาบาล (Cyber Hygiene Assessment 2026)',
            'description' => 'ดำเนินการตรวจประเมินสินทรัพย์สารสนเทศ สแกนช่องโหว่เซิร์ฟเวอร์ และเปิดใช้งานระบบรักษาความปลอดภัย 2FA สำหรับบุคลากรทางการแพทย์ทุกแผนกตามมาตรฐาน TH-CERT',
            'category' => 'cybersecurity',
            'priority' => 'high',
            'status' => 'in_progress',
            'progress_percent' => 50,
            'start_date' => Carbon::now()->subDays(14)->toDateString(),
            'due_date' => Carbon::now()->addDays(20)->toDateString(),
            'is_pinned' => true,
        ]);

        // Step 1.1
        $s1_1 = $task1->steps()->create([
            'step_number' => 1,
            'title' => 'ขั้นตอนที่ 1: สำรวจและจัดทำบัญชีสินทรัพย์สารสนเทศ (IT Asset Inventory)',
            'description' => 'ดำเนินการสำรวจเครื่องคอมพิวเตอร์และเซิร์ฟเวอร์ HOSxP ทั้งหมด 420 เครื่องพร้อมเลข IP/MAC address',
            'status' => 'completed',
            'due_date' => Carbon::now()->subDays(7)->toDateString(),
            'completed_at' => Carbon::now()->subDays(7),
            'completed_by' => $staff002->id,
            'remarks' => 'สำรวจครบถ้วน 100% เรียบร้อย บันทึกข้อมูลลงทะเบียนสินทรัพย์แล้ว',
        ]);

        $filePath1_1 = $createSampleFile(
            "agency_docs/002/step_{$s1_1->id}_asset_report.pdf",
            "%PDF-1.4\n1 0 obj\n<< /Title (รายงานบัญชีสินทรัพย์สารสนเทศ รพ.พิจิตร 2569) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
        );

        StepAttachment::create([
            'step_id' => $s1_1->id,
            'task_id' => $task1->id,
            'user_id' => $staff002->id,
            'file_name' => 'รายงานการสำรวจสินทรัพย์ระบบสารสนเทศ_2569.pdf',
            'file_path' => $filePath1_1,
            'file_type' => 'pdf',
            'file_size' => 2450000,
            'mime_type' => 'application/pdf',
            'description' => 'เอกสารสรุปบัญชีสินทรัพย์คอมพิวเตอร์และเซิร์ฟเวอร์ประจำปีงบประมาณ 2569',
            'download_count' => 12,
        ]);

        // Step 1.2
        $s1_2 = $task1->steps()->create([
            'step_number' => 2,
            'title' => 'ขั้นตอนที่ 2: ตรวจประเมินช่องโหว่ระบบเครือข่ายและแม่ข่าย (Vulnerability Scanning)',
            'description' => 'เชื่อมต่อสแกนผ่าน Wazuh และ OpenVAS ตรวจสอบพอร์ตที่ไม่ปลอดภัยบนเซิร์ฟเวอร์ HIS',
            'status' => 'completed',
            'due_date' => Carbon::now()->subDays(2)->toDateString(),
            'completed_at' => Carbon::now()->subDays(1),
            'completed_by' => $admin->id,
            'remarks' => 'พบช่องโหว่ระดับ Medium 3 จุด ดำเนินการ Patch Kernel เรียบร้อย',
        ]);

        $filePath1_2 = $createSampleFile(
            "agency_docs/002/step_{$s1_2->id}_vuln_report.docx",
            "Mock Word Document: ผลการสแกนช่องโหว่ระบบเครือข่าย โรงพยาบาลพิจิตร โดยทีมงาน Cyber Security สสจ.พิจิตร"
        );

        StepAttachment::create([
            'step_id' => $s1_2->id,
            'task_id' => $task1->id,
            'user_id' => $admin->id,
            'file_name' => 'ผลการสแกนช่องโหว่และแผนแก้ไข_รพ_พิจิตร.docx',
            'file_path' => $filePath1_2,
            'file_type' => 'word',
            'file_size' => 1850000,
            'mime_type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'description' => 'รายงานฉบับสมบูรณ์ผลการตรวจประเมินช่องโหว่ด้านความมั่นคงปลอดภัย',
            'download_count' => 8,
        ]);

        // Step 1.3
        $s1_3 = $task1->steps()->create([
            'step_number' => 3,
            'title' => 'ขั้นตอนที่ 3: จัดทำมาตรการควบคุมความปลอดภัยและเปิดใช้งาน 2FA รายแผนก',
            'description' => 'อบรมเจ้าหน้าที่ห้องยา, ห้องตรวจโรค, งานไอที ให้เปิดใช้งานระบบความปลอดภัยสองชั้น (2FA)',
            'status' => 'in_progress',
            'due_date' => Carbon::now()->addDays(10)->toDateString(),
            'remarks' => 'เปิดใช้งานไปแล้ว 8 แผนก เหลือฝ่ายเวชระเบียนและทันตกรรม',
        ]);

        $filePath1_3 = $createSampleFile(
            "agency_docs/002/step_{$s1_3->id}_tracking_2fa.xlsx",
            "Mock Excel Document: รายชื่อบุคลากรและสถานะการเปิดใช้งาน 2FA โรงพยาบาลพิจิตร"
        );

        StepAttachment::create([
            'step_id' => $s1_3->id,
            'task_id' => $task1->id,
            'user_id' => $staff002->id,
            'file_name' => 'ตารางติดตามการเปิดใช้งาน_2FA_รายแผนก.xlsx',
            'file_path' => $filePath1_3,
            'file_type' => 'excel',
            'file_size' => 845000,
            'mime_type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'description' => 'ตารางสรุปรายชื่อผู้ใช้งานและอัตราการลงทะเบียนระบบ 2FA จำแนกรายกลุ่มงาน',
            'download_count' => 15,
        ]);

        // Step 1.4
        $s1_4 = $task1->steps()->create([
            'step_number' => 4,
            'title' => 'ขั้นตอนที่ 4: สรุปผลการดำเนินงานและนำเสนอผู้บริหาร (Executive Presentation)',
            'description' => 'เตรียมสไลด์สรุปตัวชี้วัดความมั่นคงปลอดภัยไซเบอร์ประจำโรงพยาบาลนำเสนอในการประชุม กวป.',
            'status' => 'pending',
            'due_date' => Carbon::now()->addDays(20)->toDateString(),
        ]);

        $filePath1_4 = $createSampleFile(
            "agency_docs/002/step_{$s1_4->id}_presentation.pptx",
            "Mock PowerPoint Document: สไลด์นำเสนอผลการยกระดับความมั่นคงปลอดภัย โรงพยาบาลพิจิตร 2569"
        );

        StepAttachment::create([
            'step_id' => $s1_4->id,
            'task_id' => $task1->id,
            'user_id' => $staff002->id,
            'file_name' => 'สไลด์นำเสนอความมั่นคงปลอดภัยสารสนเทศ_รพ.pptx',
            'file_path' => $filePath1_4,
            'file_type' => 'powerpoint',
            'file_size' => 4580000,
            'mime_type' => 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'description' => 'เอกสารสไลด์ฉบับร่างสำหรับนำเสนอผู้บริหาร',
            'download_count' => 4,
        ]);

        // ==========================================
        // TASK 2: รพ.สมเด็จพระยุพราชตะพานหิน (003)
        // ==========================================
        $task2 = AgencyTask::create([
            'agency_code' => '003',
            'agency_name' => 'รพ.สมเด็จพระยุพราชตะพานหิน',
            'user_id' => $staff003->id,
            'assigned_user_id' => $staff003->id,
            'title' => 'ระบบสำรองข้อมูลฐานข้อมูล HOSxP อัตโนมัติขึ้น Cloud Backup สสจ.พิจิตร',
            'description' => 'จัดทำระบบสำรองข้อมูลตามกฎหมายไซเบอร์ 3-2-1 Backup Strategy โดยสำรองฐานข้อมูลแบบ Differential ทุก 6 ชม. และ Full Backup สัปดาห์ละครั้ง',
            'category' => 'his_system',
            'priority' => 'urgent',
            'status' => 'in_progress',
            'progress_percent' => 67,
            'start_date' => Carbon::now()->subDays(10)->toDateString(),
            'due_date' => Carbon::now()->addDays(5)->toDateString(),
            'is_pinned' => false,
        ]);

        $s2_1 = $task2->steps()->create([
            'step_number' => 1,
            'title' => 'ขั้นตอนที่ 1: ออกแบบสถาปัตยกรรมและพื้นที่จัดเก็บข้อมูลสำรอง',
            'status' => 'completed',
            'due_date' => Carbon::now()->subDays(5)->toDateString(),
            'completed_at' => Carbon::now()->subDays(5),
            'completed_by' => $staff003->id,
            'remarks' => 'จัดสรรพื้นที่ NAS และ S3 Bucket สำหรับโรงพยาบาลตะพานหิน 5TB เรียบร้อย',
        ]);

        $filePath2_1 = $createSampleFile(
            "agency_docs/003/step_{$s2_1->id}_backup_plan.pdf",
            "%PDF-1.4\n1 0 obj\n<< /Title (แผนการสำรองข้อมูล HOSxP Cloud Backup R3) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
        );

        StepAttachment::create([
            'step_id' => $s2_1->id,
            'task_id' => $task2->id,
            'user_id' => $staff003->id,
            'file_name' => 'แผนการสำรองข้อมูล_HOSxP_Cloud_R3.pdf',
            'file_path' => $filePath2_1,
            'file_type' => 'pdf',
            'file_size' => 1250000,
            'mime_type' => 'application/pdf',
            'description' => 'แผนผังและข้อกำหนดเทคนิคการสำรองข้อมูลอัตโนมัติ',
            'download_count' => 6,
        ]);

        $s2_2 = $task2->steps()->create([
            'step_number' => 2,
            'title' => 'ขั้นตอนที่ 2: ติดตั้งและตั้งค่า Script อัตโนมัติและระบบแจ้งเตือนผ่าน Telegram/LINE',
            'status' => 'completed',
            'due_date' => Carbon::now()->subDays(1)->toDateString(),
            'completed_at' => Carbon::now()->subDays(1),
            'completed_by' => $staff003->id,
            'remarks' => 'ระบบส่ง Notification สำเร็จเมื่อ Backup เสร็จสิ้น',
        ]);

        $s2_3 = $task2->steps()->create([
            'step_number' => 3,
            'title' => 'ขั้นตอนที่ 3: ซักซ้อมแผนฟื้นฟูระบบและทดสอบการกู้คืนข้อมูล (Disaster Recovery Drill)',
            'status' => 'in_progress',
            'due_date' => Carbon::now()->addDays(5)->toDateString(),
            'remarks' => 'กำลังดำเนินการทดสอบ Restore ฐานข้อมูลขนาด 120GB',
        ]);

        // ==========================================
        // TASK 3: สำนักงานสาธารณสุขจังหวัดพิจิตร (001)
        // ==========================================
        $task3 = AgencyTask::create([
            'agency_code' => '001',
            'agency_name' => 'สำนักงานสาธารณสุขจังหวัดพิจิตร',
            'user_id' => $admin->id,
            'assigned_user_id' => $admin->id,
            'title' => 'รายงานสรุปผลการเฝ้าระวังภัยคุกคามและการตรวจจับ Wazuh SOC ประจำไตรมาสที่ 3/2569',
            'description' => 'รวบรวมข้อมูลสถิติการโจมตีทางไซเบอร์ การตรวจจับ Ransomware และ Brute Force จากทั้ง 13 โรงพยาบาลในจังหวัดพิจิตร',
            'category' => 'monthly_report',
            'priority' => 'normal',
            'status' => 'completed',
            'progress_percent' => 100,
            'start_date' => Carbon::now()->subDays(30)->toDateString(),
            'due_date' => Carbon::now()->subDays(5)->toDateString(),
            'completed_at' => Carbon::now()->subDays(5),
            'is_pinned' => false,
        ]);

        $s3_1 = $task3->steps()->create([
            'step_number' => 1,
            'title' => 'ขั้นตอนที่ 1: ประมวลผล Log ข้อมูลจาก Wazuh Manager และ Firewall',
            'status' => 'completed',
            'due_date' => Carbon::now()->subDays(20)->toDateString(),
            'completed_at' => Carbon::now()->subDays(20),
            'completed_by' => $admin->id,
        ]);

        $s3_2 = $task3->steps()->create([
            'step_number' => 2,
            'title' => 'ขั้นตอนที่ 2: สรุปสถิติและจัดทำกราฟเปรียบเทียบ 13 โรงพยาบาล',
            'status' => 'completed',
            'due_date' => Carbon::now()->subDays(10)->toDateString(),
            'completed_at' => Carbon::now()->subDays(10),
            'completed_by' => $admin->id,
        ]);

        $filePath3_2 = $createSampleFile(
            "agency_docs/001/step_{$s3_2->id}_soc_stats.xlsx",
            "Mock Excel: สถิติเหตุการณ์ด้านความมั่นคงปลอดภัยเครือข่ายสาธารณสุขจังหวัดพิจิตร ไตรมาส 3"
        );

        StepAttachment::create([
            'step_id' => $s3_2->id,
            'task_id' => $task3->id,
            'user_id' => $admin->id,
            'file_name' => 'สถิติภัยคุกคามไซเบอร์_13รพ_พิจิตร_Q3.xlsx',
            'file_path' => $filePath3_2,
            'file_type' => 'excel',
            'file_size' => 1120000,
            'mime_type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'description' => 'ชุดข้อมูลสถิติการโจมตีและสถานะความมั่นคงปลอดภัยแยกรายหน่วยงาน',
            'download_count' => 21,
        ]);

        $s3_3 = $task3->steps()->create([
            'step_number' => 3,
            'title' => 'ขั้นตอนที่ 3: จัดทำรายงานเล่มสมบูรณ์และเผยแพร่หนังสือราชการ',
            'status' => 'completed',
            'due_date' => Carbon::now()->subDays(5)->toDateString(),
            'completed_at' => Carbon::now()->subDays(5),
            'completed_by' => $admin->id,
            'remarks' => 'ส่งหนังสือเวียนไปยังผู้อำนวยการโรงพยาบาลทุกแห่งเรียบร้อย',
        ]);

        $filePath3_3 = $createSampleFile(
            "agency_docs/001/step_{$s3_3->id}_executive_summary.pdf",
            "%PDF-1.4\n1 0 obj\n<< /Title (สรุปภาพรวมความมั่นคงปลอดภัย Q3 2569 สสจ.พิจิตร) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
        );

        StepAttachment::create([
            'step_id' => $s3_3->id,
            'task_id' => $task3->id,
            'user_id' => $admin->id,
            'file_name' => 'สรุปภาพรวมความมั่นคงปลอดภัย_Q3_2569.pdf',
            'file_path' => $filePath3_3,
            'file_type' => 'pdf',
            'file_size' => 3140000,
            'mime_type' => 'application/pdf',
            'description' => 'รายงานฉบับสมบูรณ์สำหรับผู้บริหารและคณะกรรมการดิจิทัลสุขภาพ',
            'download_count' => 34,
        ]);

        // ==========================================
        // TASK 4: รายงานการประชุม (meeting_report)
        // ==========================================
        $task4 = AgencyTask::create([
            'agency_code' => '002',
            'agency_name' => 'โรงพยาบาลพิจิตร',
            'user_id' => $staff002->id,
            'assigned_user_id' => $staff002->id,
            'title' => 'รายงานการประชุมคณะกรรมการพัฒนาเทคโนโลยีสารสนเทศและความมั่นคงปลอดภัยไซเบอร์ ครั้งที่ 3/2569',
            'description' => 'การประชุมชี้แจงแนวทางการยกระดับความมั่นคงปลอดภัยสารสนเทศ 13 โรงพยาบาล และการเชื่อมโยงระบบ Provider ID กระทรวงสาธารณสุข',
            'category' => 'meeting_report',
            'priority' => 'high',
            'status' => 'in_progress',
            'progress_percent' => 67,
            'start_date' => Carbon::now()->subDays(6)->toDateString(),
            'due_date' => Carbon::now()->addDays(7)->toDateString(),
            'is_pinned' => true,
        ]);

        $s4_1 = $task4->steps()->create([
            'step_number' => 1,
            'title' => 'ขั้นตอนที่ 1: จัดทำระเบียบวาระการประชุมและเอกสารประกอบการประชุม',
            'description' => 'รวบรวมวาระการประชุมและเอกสารสรุปผลการดำเนินงานด้านไอทีและไซเบอร์',
            'status' => 'completed',
            'due_date' => Carbon::now()->subDays(5)->toDateString(),
            'completed_at' => Carbon::now()->subDays(5),
            'completed_by' => $admin->id,
            'remarks' => 'ส่งเอกสารประกอบวาระให้คณะกรรมการล่วงหน้า 3 วัน',
        ]);

        $filePath4_1 = $createSampleFile(
            "agency_docs/001/step_{$s4_1->id}_meeting_agenda.pdf",
            "%PDF-1.4\n1 0 obj\n<< /Title (ระเบียบวาระการประชุมคณะกรรมการเทคโนโลยีสารสนเทศ 3_2569) >>\nendobj\ntrailer\n<< /Root 1 0 R >>\n%%EOF"
        );

        StepAttachment::create([
            'step_id' => $s4_1->id,
            'task_id' => $task4->id,
            'user_id' => $admin->id,
            'file_name' => 'ระเบียบวาระการประชุม_คณะกรรมการสารสนเทศ_3_2569.pdf',
            'file_path' => $filePath4_1,
            'file_type' => 'pdf',
            'file_size' => 1850000,
            'mime_type' => 'application/pdf',
            'description' => 'ระเบียบวาระการประชุมและเอกสารแนบประกอบวาระที่ 1 - 4',
            'download_count' => 18,
        ]);

        $s4_2 = $task4->steps()->create([
            'step_number' => 2,
            'title' => 'ขั้นตอนที่ 2: ดำเนินการประชุมและบันทึกรายงานการประชุม (ร่างรายงาน)',
            'description' => 'ดำเนินการจัดประชุม ณ ห้องประชุมสำนักงานสาธารณสุขจังหวัดพิจิตร และบันทึกมติที่ประชุม',
            'status' => 'completed',
            'due_date' => Carbon::now()->subDays(2)->toDateString(),
            'completed_at' => Carbon::now()->subDays(2),
            'completed_by' => $admin->id,
            'remarks' => 'บันทึกมติที่ประชุมทุกข้อเรียบร้อย อยู่ระหว่างเวียนตรวจร่าง',
        ]);

        $filePath4_2 = $createSampleFile(
            "agency_docs/001/step_{$s4_2->id}_meeting_minutes.docx",
            "Mock Word Document: รายงานการประชุมคณะกรรมการพัฒนาเทคโนโลยีสารสนเทศและความมั่นคงปลอดภัยไซเบอร์ ครั้งที่ 3/2569"
        );

        StepAttachment::create([
            'step_id' => $s4_2->id,
            'task_id' => $task4->id,
            'user_id' => $admin->id,
            'file_name' => 'รายงานการประชุม_คณะกรรมการสารสนเทศ_ครั้งที่_3.docx',
            'file_path' => $filePath4_2,
            'file_type' => 'word',
            'file_size' => 2450000,
            'mime_type' => 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'description' => 'ไฟล์ Word บันทึกรายงานการประชุมฉบับตรวจร่างแก้ไข',
            'download_count' => 24,
        ]);

        $s4_3 = $task4->steps()->create([
            'step_number' => 3,
            'title' => 'ขั้นตอนที่ 3: เวียนรับรองรายงานการประชุมและเผยแพร่มติที่ประชุม',
            'description' => 'ส่งเวียนรับรองรายงานการประชุมไปยังกรรมการทุกท่าน และติดตามการดำเนินงานตามมติ',
            'status' => 'in_progress',
            'due_date' => Carbon::now()->addDays(7)->toDateString(),
            'remarks' => 'อยู่ระหว่างกรรมการส่งข้อแก้ไขเพิ่มเติม',
        ]);
    }
}
