<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    /**
     * Hospital / Agency master list.
     */
    public static array $agencies = [
        ['code' => '001', 'name' => 'สำนักงานสาธารณสุขจังหวัดพิจิตร', 'type' => 'Provincial Health Office'],
        ['code' => '002', 'name' => 'โรงพยาบาลพิจิตร', 'type' => 'General Hospital (A/S)'],
        ['code' => '003', 'name' => 'รพ.สมเด็จพระยุพราชตะพานหิน', 'type' => 'Crown Prince Hospital (M1)'],
        ['code' => '004', 'name' => 'โรงพยาบาลบางมูลนาก', 'type' => 'Community Hospital (M2)'],
        ['code' => '005', 'name' => 'โรงพยาบาลโพทะเล', 'type' => 'Community Hospital (F1)'],
        ['code' => '006', 'name' => 'โรงพยาบาลทับคล้อ', 'type' => 'Community Hospital (F1)'],
        ['code' => '007', 'name' => 'โรงพยาบาลโพธิ์ประทับช้าง', 'type' => 'Community Hospital (F2)'],
        ['code' => '008', 'name' => 'โรงพยาบาลสามง่าม', 'type' => 'Community Hospital (F2)'],
        ['code' => '009', 'name' => 'โรงพยาบาลวชิรบารมี', 'type' => 'Community Hospital (F2)'],
        ['code' => '010', 'name' => 'โรงพยาบาลวังทรายพูน', 'type' => 'Community Hospital (F2)'],
        ['code' => '011', 'name' => 'โรงพยาบาลสากเหล็ก', 'type' => 'Community Hospital (F2)'],
        ['code' => '012', 'name' => 'โรงพยาบาลบึงนาราง', 'type' => 'Community Hospital (F2)'],
        ['code' => '013', 'name' => 'โรงพยาบาลดงเจริญ', 'type' => 'Community Hospital (F2)'],
    ];

    /**
     * Display a listing of the users.
     */
    public function index(Request $request): Response
    {
        $query = User::query();

        if ($search = $request->input('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('provider_id', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('agency_name', 'like', "%{$search}%")
                    ->orWhere('position', 'like', "%{$search}%");
            });
        }

        if ($role = $request->input('role')) {
            $query->where('role', $role);
        }

        if ($agency = $request->input('agency_code')) {
            $query->where('agency_code', $agency);
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->boolean('status'));
        }

        $users = $query->orderBy('id', 'desc')->paginate(15)->withQueryString()
            ->through(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'provider_id' => $user->provider_id,
                    'email' => $user->email,
                    'role' => $user->role,
                    'agency_code' => $user->agency_code,
                    'agency_name' => $user->agency_name,
                    'position' => $user->position,
                    'phone' => $user->phone,
                    'is_active' => $user->is_active,
                    'has_2fa' => $user->hasEnabledTwoFactor(),
                    'last_login_at' => $user->last_login_at?->format('d/m/Y H:i'),
                    'created_at' => $user->created_at?->format('d/m/Y'),
                ];
            });

        $stats = [
            'total' => User::count(),
            'active' => User::where('is_active', true)->count(),
            'admins' => User::where('role', 'admin')->count(),
            'hospital_users' => User::where('role', 'hospital_user')->count(),
            'two_factor_active' => User::whereNotNull('two_factor_confirmed_at')->count(),
        ];

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->input('search', ''),
                'role' => $request->input('role', ''),
                'agency_code' => $request->input('agency_code', ''),
                'status' => $request->input('status', ''),
            ],
            'agencies' => self::$agencies,
            'stats' => $stats,
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'provider_id' => ['required', 'string', 'max:50', 'unique:users,provider_id'],
            'email' => ['nullable', 'email', 'max:255'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'in:admin,hospital_user'],
            'agency_code' => ['required', 'string'],
            'position' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ], [
            'name.required' => 'กรุณาระบุชื่อ-นามสกุล',
            'provider_id.required' => 'กรุณาระบุ Provider ID',
            'provider_id.unique' => 'Provider ID นี้ถูกใช้งานแล้วในระบบ',
            'password.required' => 'กรุณาระบุรหัสผ่านเริ่มต้น',
            'password.min' => 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
            'role.required' => 'กรุณาเลือกบทบาทสิทธิ์การใช้งาน (Role)',
            'agency_code.required' => 'กรุณาเลือกหน่วยงาน/โรงพยาบาลสังกัด',
        ]);

        // Look up agency name from code
        $agencyMatch = collect(self::$agencies)->firstWhere('code', $validated['agency_code']);
        $agencyName = $agencyMatch['name'] ?? 'สำนักงานสาธารณสุขจังหวัดพิจิตร';

        User::create([
            'name' => $validated['name'],
            'provider_id' => strtoupper(trim($validated['provider_id'])),
            'email' => $validated['email'] ?? null,
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
            'agency_code' => $validated['agency_code'],
            'agency_name' => $agencyName,
            'position' => $validated['position'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ]);

        return back()->with('success', "เพิ่มผู้ใช้งาน {$validated['name']} ({$validated['provider_id']}) เรียบร้อยแล้ว");
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'provider_id' => ['required', 'string', 'max:50', Rule::unique('users')->ignore($user->id)],
            'email' => ['nullable', 'email', 'max:255'],
            'password' => ['nullable', 'string', 'min:6'],
            'role' => ['required', 'in:admin,hospital_user'],
            'agency_code' => ['required', 'string'],
            'position' => ['nullable', 'string', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'is_active' => ['boolean'],
        ], [
            'name.required' => 'กรุณาระบุชื่อ-นามสกุล',
            'provider_id.required' => 'กรุณาระบุ Provider ID',
            'provider_id.unique' => 'Provider ID นี้ถูกใช้งานแล้วในระบบ',
            'password.min' => 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร',
            'role.required' => 'กรุณาเลือกบทบาทสิทธิ์การใช้งาน (Role)',
            'agency_code.required' => 'กรุณาเลือกหน่วยงาน/โรงพยาบาลสังกัด',
        ]);

        $agencyMatch = collect(self::$agencies)->firstWhere('code', $validated['agency_code']);
        $agencyName = $agencyMatch['name'] ?? $user->agency_name;

        $updateData = [
            'name' => $validated['name'],
            'provider_id' => strtoupper(trim($validated['provider_id'])),
            'email' => $validated['email'] ?? null,
            'role' => $validated['role'],
            'agency_code' => $validated['agency_code'],
            'agency_name' => $agencyName,
            'position' => $validated['position'] ?? null,
            'phone' => $validated['phone'] ?? null,
            'is_active' => $request->boolean('is_active', true),
        ];

        if (! empty($validated['password'])) {
            $updateData['password'] = Hash::make($validated['password']);
        }

        $user->update($updateData);

        return back()->with('success', "แก้ไขข้อมูลผู้ใช้งาน {$user->name} เรียบร้อยแล้ว");
    }

    /**
     * Toggle active status.
     */
    public function toggleStatus(User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'ไม่สามารถปิดการใช้งานบัญชีของตนเองได้');
        }

        $user->is_active = ! $user->is_active;
        $user->save();

        $statusText = $user->is_active ? 'เปิดใช้งาน' : 'ระงับการใช้งาน';
        return back()->with('success', "เปลี่ยนสถานะผู้ใช้งาน {$user->name} เป็น \"{$statusText}\" เรียบร้อยแล้ว");
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'ไม่สามารถลบบัญชีของตนเองได้');
        }

        $userName = $user->name;
        $user->delete();

        return back()->with('success', "ลบผู้ใช้งาน {$userName} เรียบร้อยแล้ว");
    }

    /**
     * Reset 2FA for the specified user (Admin only).
     */
    public function resetTwoFactor(User $user): RedirectResponse
    {
        $user->resetTwoFactor();

        return back()->with('success', "รีเซ็ตการตั้งค่า 2FA ของผู้ใช้งาน {$user->name} ({$user->provider_id}) เรียบร้อยแล้ว");
    }
}
