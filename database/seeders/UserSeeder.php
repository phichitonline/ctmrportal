<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'name' => 'นายณฐพงศ์ ครุฑเทศ',
                'provider_id' => 'ADMIN001',
                'email' => 'nathaphong@ppho.go.th',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'agency_code' => '001',
                'agency_name' => 'สำนักงานสาธารณสุขจังหวัดพิจิตร',
                'position' => 'Cyber Security & Network Engineer',
                'phone' => '056-611234 ต่อ 112',
                'is_active' => true,
            ],
            [
                'name' => 'นางสาววราภรณ์ สุขใจ',
                'provider_id' => 'ADMIN002',
                'email' => 'waraporn@ppho.go.th',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'agency_code' => '001',
                'agency_name' => 'สำนักงานสาธารณสุขจังหวัดพิจิตร',
                'position' => 'IT Specialist & Database Administrator',
                'phone' => '056-611234 ต่อ 115',
                'is_active' => true,
            ],
            [
                'name' => 'นายสมเกียรติ มั่นคง',
                'provider_id' => 'HOS002',
                'email' => 'somkiat@phichithosp.go.th',
                'password' => Hash::make('password'),
                'role' => 'hospital_user',
                'agency_code' => '002',
                'agency_name' => 'โรงพยาบาลพิจิตร',
                'position' => 'เจ้าหน้าที่ระบบเครือข่ายและความมั่นคงปลอดภัย',
                'phone' => '056-611355 ต่อ 204',
                'is_active' => true,
            ],
            [
                'name' => 'นางสาวพรทิพย์ สดใส',
                'provider_id' => 'HOS003',
                'email' => 'porntip@tph-hospital.go.th',
                'password' => Hash::make('password'),
                'role' => 'hospital_user',
                'agency_code' => '003',
                'agency_name' => 'รพ.สมเด็จพระยุพราชตะพานหิน',
                'position' => 'ผู้ดูแลระบบสารสนเทศ (HIS/MIS Admin)',
                'phone' => '056-621111 ต่อ 108',
                'is_active' => true,
            ],
            [
                'name' => 'นายกิตติศักดิ์ เจริญดี',
                'provider_id' => 'HOS004',
                'email' => 'kittisak@bmn-hospital.go.th',
                'password' => Hash::make('password'),
                'role' => 'hospital_user',
                'agency_code' => '004',
                'agency_name' => 'โรงพยาบาลบางมูลนาก',
                'position' => 'นักวิชาการคอมพิวเตอร์ชำนาญการ',
                'phone' => '056-631222 ต่อ 301',
                'is_active' => true,
            ],
            [
                'name' => 'นายวีระชัย รักษ์สิทธิ์',
                'provider_id' => 'HOS005',
                'email' => 'veerachai@ptl-hospital.go.th',
                'password' => Hash::make('password'),
                'role' => 'hospital_user',
                'agency_code' => '005',
                'agency_name' => 'โรงพยาบาลโพทะเล',
                'position' => 'เจ้าหน้าที่เทคโนโลยีสารสนเทศ',
                'phone' => '056-681123 ต่อ 120',
                'is_active' => true,
            ],
            [
                'name' => 'นางรัตนาพร มีสุข',
                'provider_id' => 'HOS006',
                'email' => 'rattanaporn@tk-hospital.go.th',
                'password' => Hash::make('password'),
                'role' => 'hospital_user',
                'agency_code' => '006',
                'agency_name' => 'โรงพยาบาลทับคล้อ',
                'position' => 'ผู้ช่วยผู้ดูแลระบบ MIS & Cyber Defense',
                'phone' => '056-671234 ต่อ 102',
                'is_active' => true,
            ],
        ];

        foreach ($users as $data) {
            User::updateOrCreate(
                ['provider_id' => $data['provider_id']],
                $data
            );
        }
    }
}
