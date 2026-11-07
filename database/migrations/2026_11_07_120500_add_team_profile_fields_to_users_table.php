<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->json('team_groups')->nullable()->after('phone');
            $table->string('team_role_badge', 100)->nullable()->after('team_groups');
            $table->text('team_responsibilities')->nullable()->after('team_role_badge');
            $table->json('team_skills')->nullable()->after('team_responsibilities');
            $table->string('team_nodes', 255)->nullable()->after('team_skills');
        });

        // Seed initial default team groups for existing users so the Team page is immediately populated
        $users = DB::table('users')->get();
        foreach ($users as $index => $user) {
            $pos = mb_strtolower((string) ($user->position ?? ''));
            $groups = [];
            $badge = $user->role === 'admin' ? 'SOC Lead / Admin' : 'Hospital MIS';
            $skills = ['Cyber Hygiene', 'Wazuh Agent', 'Hospital MIS'];

            if ($user->role === 'admin') {
                $groups = ['soc', 'network'];
                $badge = 'Team Lead';
                $skills = ['CISSP / Sec+', 'Wazuh SIEM', 'Incident Cmd'];
            } elseif (str_contains($pos, 'network') || str_contains($pos, 'เครือข่าย')) {
                $groups = ['network'];
                $badge = 'Network Eng';
                $skills = ['Fortinet NSE', 'VPN/VLAN', 'Firewall'];
            } elseif (str_contains($pos, 'hosxp') || str_contains($pos, 'database') || str_contains($pos, 'ฐานข้อมูล')) {
                $groups = ['his'];
                $badge = 'Database Sec';
                $skills = ['HOSxP DBA', 'MySQL/PostgreSQL', 'Backup Sec'];
            } elseif (str_contains($pos, 'pdpa') || str_contains($pos, 'dpo') || str_contains($pos, 'นิติการ')) {
                $groups = ['pdpa'];
                $badge = 'DPO / PDPA';
                $skills = ['PDPA Compliance', 'Data Privacy', 'Access Audit'];
            } else {
                // Distribute across the 4 groups so every group has responsible staff initially
                $cycle = [
                    ['soc'],
                    ['network'],
                    ['his'],
                    ['pdpa'],
                    ['soc', 'his'],
                ];
                $groups = $cycle[$index % count($cycle)];
            }

            $agencyName = $user->hname_th ?: ($user->agency_name ?: 'สำนักงานสาธารณสุขจังหวัดพิจิตร');
            $agencyCode = $user->hospcode ?: ($user->agency_code ?: '001');

            DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'team_groups' => json_encode($groups, JSON_UNESCAPED_UNICODE),
                    'team_role_badge' => $badge,
                    'team_responsibilities' => $user->role === 'admin'
                        ? 'กำกับดูแลสถาปัตยกรรมความมั่นคงปลอดภัยไซเบอร์ระดับจังหวัด, มอนิเตอร์เหตุการณ์ Wazuh SIEM 24 ชม. และตอบสนองเหตุฉุกเฉิน (Incident Response)'
                        : "ดูแลระบบความมั่นคงปลอดภัยสารสนเทศ เฝ้าระวัง Wazuh Agent และประสานงานเหตุแจ้งเตือนศูนย์ SOC ประจำ{$agencyName}",
                    'team_skills' => json_encode($skills, JSON_UNESCAPED_UNICODE),
                    'team_nodes' => "{$agencyName} (รหัสหน่วยบริการ {$agencyCode})",
                ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'team_groups',
                'team_role_badge',
                'team_responsibilities',
                'team_skills',
                'team_nodes',
            ]);
        });
    }
};

