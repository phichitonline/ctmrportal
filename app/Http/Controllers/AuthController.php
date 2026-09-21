<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    /**
     * Show login form.
     */
    public function showLogin(): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        $mophConfig = config('services.moph');
        $mophLoginUrl = 'https://moph.id.th/oauth/redirect?' . http_build_query([
            'client_id' => $mophConfig['client_id'] ?? '0194e132-099e-7e9b-b25c-a927c7e35d83',
            'redirect_uri' => $mophConfig['redirect_uri'] ?? 'https://provider.tphcp.go.th/callback',
            'response_type' => 'code',
            'state' => $mophConfig['state_callback'] ?? 'https://hosinfo.tphcp.go.th/auth/moph/callback',
        ]);

        return Inertia::render('Auth/Login', [
            'mophLoginUrl' => $mophLoginUrl,
        ]);
    }

    /**
     * Handle MOPH Provider ID callback.
     */
    public function handleMophCallback(Request $request): RedirectResponse
    {
        if ($request->has('error')) {
            return redirect()->route('login')->withErrors([
                'provider_id' => 'การยืนยันตัวตนผ่าน Provider ID ไม่สำเร็จ: ' . $request->query('error_description', $request->query('error')),
            ]);
        }

        $code = $request->query('code');
        if (! $code) {
            return redirect()->route('login')->withErrors([
                'provider_id' => 'ไม่พบรหัสการยืนยันตัวตนจาก Provider ID กระทรวงสาธารณสุข',
            ]);
        }

        return redirect()->route('login')->with('success', 'เชื่อมต่อกับ Provider ID กระทรวงสาธารณสุขเรียบร้อยแล้ว');
    }

    /**
     * Handle login submission.
     */
    public function login(Request $request): RedirectResponse
    {
        $credentials = $request->validate([
            'provider_id' => ['required', 'string'],
            'password' => ['required', 'string'],
        ], [
            'provider_id.required' => 'กรุณากรอกรหัส Provider ID',
            'password.required' => 'กรุณากรอกรหัสผ่าน',
        ]);

        $credentials['provider_id'] = trim($credentials['provider_id']);

        $user = User::where('provider_id', $credentials['provider_id'])->first();

        if ($user && ! $user->is_active) {
            return back()->withErrors([
                'provider_id' => 'บัญชีผู้ใช้งานนี้ถูกระงับการเข้าถึงระบบชั่วคราว กรุณาติดต่อผู้ดูแลระบบ สสจ.พิจิตร',
            ])->onlyInput('provider_id');
        }

        if (! Auth::validate([
            'provider_id' => $credentials['provider_id'],
            'password' => $credentials['password'],
            'is_active' => true,
        ])) {
            return back()->withErrors([
                'provider_id' => 'รหัส Provider ID หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง',
            ])->onlyInput('provider_id');
        }

        // Check if user has Two-Factor Authentication (2FA) enabled
        if ($user->hasEnabledTwoFactor()) {
            $request->session()->put([
                'login.id' => $user->id,
                'login.remember' => $request->boolean('remember'),
            ]);

            return redirect()->route('two-factor.challenge');
        }

        // Proceed with standard login if 2FA is not enabled
        Auth::login($user, $request->boolean('remember'));
        $request->session()->regenerate();

        $user->forceFill(['last_login_at' => now()])->save();

        return redirect()->intended(route('dashboard'))
            ->with('success', "เข้าสู่ระบบสำเร็จ ยินดีต้อนรับคุณ {$user->name}");
    }

    /**
     * Handle logout.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->with('success', 'ออกจากระบบเรียบร้อยแล้ว');
    }
}
