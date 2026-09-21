<?php

namespace App\Http\Controllers;

use App\Models\User;
use BaconQrCode\Renderer\Image\SvgImageBackEnd;
use BaconQrCode\Renderer\ImageRenderer;
use BaconQrCode\Renderer\RendererStyle\RendererStyle;
use BaconQrCode\Writer;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorAuthController extends Controller
{
    protected Google2FA $google2fa;

    public function __construct()
    {
        $this->google2fa = new Google2FA();
    }

    /**
     * Show the 2FA challenge screen during login.
     */
    public function showChallenge(Request $request): Response|RedirectResponse
    {
        if (Auth::check()) {
            return redirect()->route('dashboard');
        }

        $userId = $request->session()->get('login.id');
        if (! $userId) {
            return redirect()->route('login');
        }

        $user = User::find($userId);
        if (! $user || ! $user->hasEnabledTwoFactor() || ! $user->is_active) {
            $request->session()->forget(['login.id', 'login.remember']);
            return redirect()->route('login');
        }

        return Inertia::render('Auth/TwoFactorChallenge', [
            'provider_id' => $user->provider_id,
            'user_name' => $user->name,
        ]);
    }

    /**
     * Verify the 2FA code or recovery code.
     */
    public function verifyChallenge(Request $request): RedirectResponse
    {
        $userId = $request->session()->get('login.id');
        if (! $userId) {
            return redirect()->route('login');
        }

        /** @var User|null $user */
        $user = User::find($userId);
        if (! $user || ! $user->hasEnabledTwoFactor() || ! $user->is_active) {
            $request->session()->forget(['login.id', 'login.remember']);
            return redirect()->route('login');
        }

        $remember = (bool) $request->session()->get('login.remember', false);

        // Verification via Recovery Code
        if ($request->filled('recovery_code')) {
            $recoveryCode = trim((string) $request->input('recovery_code'));
            if ($user->consumeRecoveryCode($recoveryCode)) {
                return $this->completeLogin($request, $user, $remember, 'เข้าสู่ระบบสำเร็จด้วยรหัสกู้คืนฉุกเฉิน (Recovery Code)');
            }

            throw ValidationException::withMessages([
                'recovery_code' => 'รหัสกู้คืนฉุกเฉินไม่ถูกต้อง หรือถูกใช้งานไปแล้ว',
            ]);
        }

        // Verification via Google Authenticator OTP Code
        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ], [
            'code.required' => 'กรุณากรอกรหัสความปลอดภัย 6 หลักจาก Google Authenticator',
            'code.size' => 'รหัสความปลอดภัยต้องมีความยาว 6 หลัก',
        ]);

        $code = trim((string) $request->input('code'));

        // Window = 1 allows 30 seconds drift back and forth
        $isValid = $this->google2fa->verifyKey($user->two_factor_secret, $code, 1);

        if (! $isValid) {
            throw ValidationException::withMessages([
                'code' => 'รหัสยืนยัน 2FA ไม่ถูกต้อง หรือหมดอายุแล้ว กรุณาลองใหม่อีกครั้ง',
            ]);
        }

        return $this->completeLogin($request, $user, $remember, "ยืนยันตัวตน 2FA สำเร็จ ยินดีต้อนรับคุณ {$user->name}");
    }

    /**
     * Cancel 2FA challenge and return to login.
     */
    public function cancelChallenge(Request $request): RedirectResponse
    {
        $request->session()->forget(['login.id', 'login.remember']);
        return redirect()->route('login');
    }

    /**
     * Show 2FA security settings for authenticated user.
     */
    public function showSettings(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();

        $qrCodeSvg = null;
        $secretKey = null;

        // If not confirmed yet, provide or generate pending secret & QR code
        if (! $user->hasEnabledTwoFactor()) {
            $secretKey = $user->two_factor_secret ?: $this->google2fa->generateSecretKey(16);
            if (! $user->two_factor_secret) {
                $user->forceFill(['two_factor_secret' => $secretKey])->save();
            }

            $otpAuthUrl = $this->google2fa->getQRCodeUrl(
                'CTMR R3 Phichit MIS Portal',
                $user->provider_id,
                $secretKey
            );

            $renderer = new ImageRenderer(
                new RendererStyle(200),
                new SvgImageBackEnd()
            );
            $writer = new Writer($renderer);
            $qrCodeSvg = $writer->writeString($otpAuthUrl);
        }

        return Inertia::render('Security/TwoFactorSettings', [
            'enabled' => $user->hasEnabledTwoFactor(),
            'confirmed_at' => $user->two_factor_confirmed_at?->format('d/m/Y H:i น.'),
            'secret_key' => $secretKey,
            'qr_code_svg' => $qrCodeSvg,
            'recovery_codes_count' => count($user->two_factor_recovery_codes ?? []),
            'recovery_codes' => session('two_factor_recovery_codes'),
        ]);
    }

    /**
     * Confirm and activate 2FA with the first OTP code.
     */
    public function confirm(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $request->validate([
            'code' => ['required', 'string', 'size:6'],
        ], [
            'code.required' => 'กรุณากรอกรหัส 6 หลักที่ปรากฏในแอป Google Authenticator',
            'code.size' => 'รหัสต้องมี 6 หลัก',
        ]);

        if (! $user->two_factor_secret) {
            return back()->withErrors(['code' => 'ไม่พบคีย์ความปลอดภัย กรุณารีเฟรชหน้าเว็บและลองใหม่อีกครั้ง']);
        }

        $code = trim((string) $request->input('code'));
        $isValid = $this->google2fa->verifyKey($user->two_factor_secret, $code, 1);

        if (! $isValid) {
            return back()->withErrors([
                'code' => 'รหัส OTP ไม่ถูกต้อง กรุณาตรวจสอบเวลาในอุปกรณ์และลองใหม่อีกครั้ง',
            ]);
        }

        // Generate 8 recovery codes
        $recoveryCodes = $this->generateRecoveryCodes();

        $user->forceFill([
            'two_factor_recovery_codes' => $recoveryCodes,
            'two_factor_confirmed_at' => now(),
        ])->save();

        return redirect()->route('two-factor.settings')
            ->with('two_factor_recovery_codes', $recoveryCodes)
            ->with('success', 'เปิดใช้งานการยืนยันตัวตนสองขั้นตอน (2FA) สำเร็จเรียบร้อยแล้ว!');
    }

    /**
     * Disable 2FA (requires current password).
     */
    public function disable(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        $request->validate([
            'password' => ['required', 'string'],
        ], [
            'password.required' => 'กรุณากรอกรหัสผ่านปัจจุบันเพื่อยืนยันการปิดใช้งาน 2FA',
        ]);

        if (! Hash::check($request->input('password'), $user->password)) {
            return back()->withErrors([
                'password' => 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
            ]);
        }

        $user->resetTwoFactor();

        return redirect()->route('two-factor.settings')
            ->with('success', 'ปิดการใช้งานการยืนยันตัวตน 2FA เรียบร้อยแล้ว');
    }

    /**
     * Regenerate emergency recovery codes.
     */
    public function regenerateRecoveryCodes(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();

        if (! $user->hasEnabledTwoFactor()) {
            return back()->withErrors(['error' => 'ยังไม่ได้เปิดใช้งาน 2FA']);
        }

        $request->validate([
            'password' => ['required', 'string'],
        ], [
            'password.required' => 'กรุณากรอกรหัสผ่านเพื่อสร้างรหัสสำรองใหม่',
        ]);

        if (! Hash::check($request->input('password'), $user->password)) {
            return back()->withErrors([
                'password' => 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
            ]);
        }

        $recoveryCodes = $this->generateRecoveryCodes();
        $user->forceFill([
            'two_factor_recovery_codes' => $recoveryCodes,
        ])->save();

        return redirect()->route('two-factor.settings')
            ->with('two_factor_recovery_codes', $recoveryCodes)
            ->with('success', 'สร้างชุดรหัสสำรองฉุกเฉิน (Recovery Codes) ใหม่เรียบร้อยแล้ว');
    }

    /**
     * Helper to complete authentication and session setup.
     */
    protected function completeLogin(Request $request, User $user, bool $remember, string $flashMessage): RedirectResponse
    {
        $request->session()->forget(['login.id', 'login.remember']);
        $request->session()->regenerate();

        Auth::loginUsingId($user->id, $remember);

        $user->forceFill(['last_login_at' => now()])->save();

        return redirect()->intended(route('dashboard'))
            ->with('success', $flashMessage);
    }

    /**
     * Generate 8 secure random recovery codes formatted as XXXXX-XXXXX.
     *
     * @return array<int, string>
     */
    protected function generateRecoveryCodes(): array
    {
        $codes = [];
        for ($i = 0; $i < 8; $i++) {
            $codes[] = strtoupper(Str::random(5) . '-' . Str::random(5));
        }
        return $codes;
    }
}
