<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    /**
     * Avatar color gradients for team cards.
     */
    private static array $avatarGradients = [
        'soc' => 'from-[#006BB4] to-sky-400',
        'network' => 'from-purple-600 to-indigo-400',
        'his' => 'from-amber-600 to-orange-400',
        'pdpa' => 'from-rose-600 to-pink-400',
        'default' => 'from-emerald-600 to-teal-400',
    ];

    /**
     * Display the Team Directory page populated from the `users` table.
     */
    public function index(): Response
    {
        $groupDefinitions = User::teamGroupDefinitions();
        $validGroupKeys = array_keys($groupDefinitions);

        $users = User::orderByDesc('is_active')
            ->orderByRaw("CASE WHEN role = 'admin' THEN 0 ELSE 1 END")
            ->orderBy('id')
            ->get();

        $members = $users->map(function (User $user) use ($validGroupKeys) {
            $rawGroups = is_array($user->team_groups) ? $user->team_groups : [];
            $groups = array_values(array_intersect($rawGroups, $validGroupKeys));

            $agencyName = $user->hname_th ?: ($user->agency_name ?: 'สำนักงานสาธารณสุขจังหวัดพิจิตร');
            $agencyCode = $user->hospcode ?: ($user->agency_code ?: '001');
            $position = $user->position ?: ($user->role === 'admin'
                ? 'ผู้ดูแลระบบความมั่นคงปลอดภัยสารสนเทศ (SOC Admin)'
                : 'นักวิชาการคอมพิวเตอร์ / ผู้ประสานงานความมั่นคงปลอดภัยไซเบอร์');

            $primaryGroup = $groups[0] ?? 'default';
            $avatarBg = self::$avatarGradients[$primaryGroup] ?? self::$avatarGradients['default'];

            $skills = is_array($user->team_skills) && count($user->team_skills) > 0
                ? $user->team_skills
                : ($user->role === 'admin'
                    ? ['Wazuh SIEM', 'SOC Lead', 'Incident Cmd']
                    : ['Cyber Hygiene', 'Wazuh Agent', 'Hospital MIS']);

            $responsibilities = $user->team_responsibilities ?: (
                $user->role === 'admin'
                    ? 'กำกับดูแลสถาปัตยกรรมความมั่นคงปลอดภัยไซเบอร์ระดับจังหวัด, มอนิเตอร์เหตุการณ์ Wazuh SIEM 24 ชม. และประสานงานตอบสนองเหตุฉุกเฉิน'
                    : "ดูแลระบบความมั่นคงปลอดภัยสารสนเทศ เฝ้าระวังโหนด Wazuh Agent และประสานงานศูนย์ปฏิบัติการ SOC ประจำ{$agencyName}"
            );

            $nodes = $user->team_nodes ?: "{$agencyName} (รหัสหน่วยบริการ {$agencyCode})";

            return [
                'id' => $user->id,
                'name' => $user->name,
                'provider_id' => $user->provider_id,
                'role' => $user->role,
                'is_active' => (bool) $user->is_active,
                'position' => $position,
                'department' => $agencyName,
                'agency_code' => $agencyCode,
                'team_groups' => $groups,
                'category' => implode(' ', $groups),
                'roleBadge' => $user->team_role_badge ?: ($user->role === 'admin' ? 'Team Lead' : 'Hospital MIS'),
                'initials' => $this->extractInitials($user->name, $user->provider_id),
                'avatarBg' => $avatarBg,
                'responsibilities' => $responsibilities,
                'skills' => $skills,
                'phone' => $user->phone ?: '056-611-131',
                'email' => $user->email ?: strtolower($user->provider_id) . '@ppho.go.th',
                'nodes' => $nodes,
                'detail' => $responsibilities,
                'has_telegram' => ! empty($user->telegram_chat_id),
                'has_line' => ! empty($user->line_user_id),
            ];
        })->values();

        return Inertia::render('Team', [
            'members' => $members,
            'groupDefinitions' => array_values($groupDefinitions),
        ]);
    }

    /**
     * Update a specific user's team groups, role badge, responsibilities, skills, and nodes (Admin only).
     */
    public function updateMember(Request $request, User $user): RedirectResponse
    {
        $validGroupKeys = array_keys(User::teamGroupDefinitions());

        $validated = $request->validate([
            'position' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'team_groups' => ['nullable', 'array'],
            'team_groups.*' => ['string', 'in:' . implode(',', $validGroupKeys)],
            'team_role_badge' => ['nullable', 'string', 'max:100'],
            'team_responsibilities' => ['nullable', 'string', 'max:1000'],
            'team_skills' => ['nullable', 'array'],
            'team_skills.*' => ['string', 'max:60'],
            'team_nodes' => ['nullable', 'string', 'max:255'],
        ]);

        $groups = array_values(array_unique($validated['team_groups'] ?? []));
        $skills = array_values(array_filter(array_map('trim', $validated['team_skills'] ?? [])));

        $user->update([
            'position' => array_key_exists('position', $validated) ? ($validated['position'] ? trim($validated['position']) : $user->position) : $user->position,
            'phone' => array_key_exists('phone', $validated) ? ($validated['phone'] ? trim($validated['phone']) : $user->phone) : $user->phone,
            'team_groups' => $groups,
            'team_role_badge' => ! empty($validated['team_role_badge']) ? trim($validated['team_role_badge']) : null,
            'team_responsibilities' => ! empty($validated['team_responsibilities']) ? trim($validated['team_responsibilities']) : null,
            'team_skills' => count($skills) > 0 ? $skills : null,
            'team_nodes' => ! empty($validated['team_nodes']) ? trim($validated['team_nodes']) : null,
        ]);

        return back()->with('success', "บันทึกกลุ่มงานและภารกิจของ {$user->name} เรียบร้อยแล้ว");
    }

    /**
     * Bulk-assign users to a specific responsibility group (`soc`, `network`, `his`, or `pdpa`) (Admin only).
     */
    public function assignGroupMembers(Request $request): RedirectResponse
    {
        $groupDefinitions = User::teamGroupDefinitions();
        $validGroupKeys = array_keys($groupDefinitions);

        $validated = $request->validate([
            'group_key' => ['required', 'string', 'in:' . implode(',', $validGroupKeys)],
            'user_ids' => ['nullable', 'array'],
            'user_ids.*' => ['integer', 'exists:users,id'],
        ]);

        $groupKey = $validated['group_key'];
        $selectedUserIds = array_map('intval', $validated['user_ids'] ?? []);
        $groupLabel = $groupDefinitions[$groupKey]['label'] ?? $groupKey;

        $allUsers = User::all();
        foreach ($allUsers as $user) {
            $currentGroups = is_array($user->team_groups) ? $user->team_groups : [];
            $shouldHaveGroup = in_array((int) $user->id, $selectedUserIds, true);

            if ($shouldHaveGroup && ! in_array($groupKey, $currentGroups, true)) {
                $currentGroups[] = $groupKey;
                $user->update([
                    'team_groups' => array_values(array_unique($currentGroups)),
                ]);
            } elseif (! $shouldHaveGroup && in_array($groupKey, $currentGroups, true)) {
                $updatedGroups = array_values(array_filter($currentGroups, fn ($g) => $g !== $groupKey));
                $user->update([
                    'team_groups' => $updatedGroups,
                ]);
            }
        }

        $count = count($selectedUserIds);

        return back()->with('success', "อัปเดตรายชื่อผู้รับผิดชอบในกลุ่ม \"{$groupLabel}\" จำนวน {$count} คน เรียบร้อยแล้ว");
    }

    /**
     * Extract 2-character Thai/English initials from user name or provider ID.
     */
    private function extractInitials(string $name, ?string $providerId = null): string
    {
        $clean = preg_replace('/^(นาย|นางสาว|น\.ส\.|นาง|ดร\.|นพ\.|พญ\.|ทพ\.|ทพญ\.|ภก\.|ภญ\.)\s*/u', '', trim($name));
        $parts = preg_split('/\s+/u', trim((string) $clean));

        if (! empty($parts[0]) && ! empty($parts[1])) {
            return mb_substr($parts[0], 0, 1) . mb_substr($parts[1], 0, 1);
        }

        if (! empty($parts[0]) && mb_strlen($parts[0]) >= 2) {
            return mb_substr($parts[0], 0, 2);
        }

        return $providerId ? mb_strtoupper(mb_substr($providerId, 0, 2)) : 'US';
    }
}
