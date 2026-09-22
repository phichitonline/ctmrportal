<?php

namespace App\Http\Controllers;

use App\Models\Hospcode;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SSOLoginController extends Controller
{
    /**
     * Handle incoming SSO Callback from ProviderID / Gateway
     * 
     * @param Request $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function handle(Request $request): RedirectResponse
    {
        Log::info('SSO Callback Payload: ', $request->all());

        $hashCid = trim((string) $request->input('hash_cid'));
        $ts = $request->input('ts');
        $sig = $request->input('sig');
        $fname = trim((string) $request->input('fname'));
        $lname = trim((string) $request->input('lname'));
        $email = trim((string) $request->input('email'));
        $hospcode = trim((string) $request->input('hospcode'));
        $providerid = trim((string) $request->input('providerid'));

        // 1. ตรวจสอบค่าพารามิเตอร์ที่จำเป็น
        if (!$hashCid || !$ts || !$sig) {
            Log::warning('SSO Callback missing required parameters', $request->all());
            return redirect('/login')->withErrors(['provider_id' => 'พารามิเตอร์ไม่ครบถ้วน (hash_cid, ts หรือ sig หายไป)']);
        }

        // 2. ตรวจสอบ timestamp ไม่เกิน 5 นาที (300 วินาที)
        $currentTs = time();
        if (abs($currentTs - (int) $ts) > 300) {
            Log::warning('SSO Callback signature expired', ['current_ts' => $currentTs, 'received_ts' => $ts]);
            return redirect('/login')->withErrors(['provider_id' => 'ลายเซ็นหมดอายุ (Timestamp is too old) กรุณาเข้าสู่ระบบใหม่อีกครั้ง']);
        }

        // 3. ตรวจสอบลายเซ็นดิจิทัล (HMAC-SHA256)
        $payloadArray = [
            'hash_cid' => $hashCid,
            'ts' => (int) $ts,
        ];
        $payload = json_encode($payloadArray, JSON_UNESCAPED_UNICODE);
        $secret = config('services.sso.shared_secret', env('SSO_SHARED_SECRET', ''));

        if (!empty($secret) && $secret !== 'YOUR_SHARED_SECRET_HERE') {
            $expectedSig = hash_hmac('sha256', $payload, $secret);

            if (!hash_equals($expectedSig, $sig)) {
                Log::error('SSO Callback invalid signature', [
                    'payload_used' => $payload,
                    'expected_sig' => $expectedSig,
                    'received_sig' => $sig,
                ]);
                return redirect('/login')->withErrors(['provider_id' => 'ลายเซ็นดิจิทัลไม่ถูกต้อง (Invalid signature)']);
            }
        }

        // 4. จัดเตรียมข้อมูลชื่อผู้ใช้ และหน่วยงาน
        $name = trim(($fname ?? '') . ' ' . ($lname ?? ''));
        if (empty($name)) {
            $name = 'SSO ProviderID User';
        }

        $hnameTh = trim((string) $request->input('hname_th'));
        if (empty($hnameTh) && !empty($hospcode)) {
            // ค้นหาชื่อสถานพยาบาลจากตาราง hospcode หรือใช้ hospcode เป็น fallback
            $hnameTh = Hospcode::where('hospcode', $hospcode)->value('name') ?? $hospcode;
        }
        if (empty($hnameTh)) {
            $hnameTh = 'สำนักงานสาธารณสุขจังหวัดพิจิตร';
        }

        // 5. ค้นหาผู้ใช้เดิม โดยเชื่อมโยงได้ทั้ง moph_id, provider_id เดิม, pid (hash_cid) หรือ email
        $user = User::where(function ($q) use ($providerid, $hashCid, $email) {
            if ($providerid) {
                $q->where('moph_id', $providerid)
                  ->orWhere('provider_id', $providerid);
            }
            if ($hashCid) {
                $q->orWhere('pid', $hashCid);
            }
            if ($email) {
                $q->orWhere('email', $email);
            }
        })->first();

        if (!$user) {
            // สร้าง provider_id ที่ไม่ซ้ำ (Unique) สำหรับตาราง users
            $baseProviderId = $providerid ? strtoupper($providerid) : ('MOPH_' . strtoupper(substr($hashCid, 0, 8)));
            $uniqueProviderId = $baseProviderId;
            $counter = 1;
            while (User::where('provider_id', $uniqueProviderId)->exists()) {
                $uniqueProviderId = $baseProviderId . '_' . $counter;
                $counter++;
            }

            // สร้างผู้ใช้ใหม่
            $user = User::create([
                'name' => $name,
                'provider_id' => $uniqueProviderId,
                'email' => !empty($email) ? $email : ($providerid ? $providerid . '@provider.local' : $hashCid . '@sso.local'),
                'password' => Hash::make(($providerid || $hospcode) ? ($providerid . $hospcode) : Str::random(16)),
                'pid' => $hashCid,
                'moph_id' => $providerid ?: null,
                'agency_code' => $hospcode ?: '001',
                'agency_name' => $hnameTh,
                'hospcode' => $hospcode ?: null,
                'hname_th' => $hnameTh,
                'role' => 'hospital_user',
                'is_active' => true,
            ]);
        } else {
            // อัปเดตข้อมูลผู้ใช้ถ้ามีข้อมูลใหม่
            $updates = [];
            if ($name !== 'SSO ProviderID User' && $user->name !== $name) {
                $updates['name'] = $name;
            }
            if ($providerid && !$user->moph_id) {
                $updates['moph_id'] = $providerid;
            }
            if ($hashCid && !$user->pid) {
                $updates['pid'] = $hashCid;
            }
            if ($hospcode && (!$user->hospcode || $user->agency_code === '001')) {
                $updates['hospcode'] = $hospcode;
                $updates['agency_code'] = $hospcode;
            }
            if ($hnameTh && (!$user->hname_th || empty($user->agency_name))) {
                $updates['hname_th'] = $hnameTh;
                $updates['agency_name'] = $hnameTh;
            }
            if (!empty($updates)) {
                $user->update($updates);
            }
        }

        // 6. ตรวจสอบสถานะบัญชี
        if (!$user->is_active) {
            return redirect('/login')->withErrors(['provider_id' => 'บัญชีผู้ใช้งานของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ สสจ.พิจิตร']);
        }

        // 7. Login เข้าระบบ Laravel (SSO ได้รับการยืนยันตัวตนระดับรัฐแล้ว จึงเข้าสู่ระบบได้ทันที)
        Auth::login($user, true);
        $request->session()->regenerate();

        $user->forceFill(['last_login_at' => now()])->save();

        // 8. นำทางเข้าสู่ระบบ
        return redirect()->intended(route('dashboard'))
            ->with('success', "เข้าสู่ระบบด้วย Provider ID สำเร็จ ยินดีต้อนรับคุณ {$user->name}");
    }
}

