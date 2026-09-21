<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
    public function handle(Request $request)
    {
        Log::info('SSO Callback Payload: ', $request->all());

        $hashCid = $request->input('hash_cid');
        $ts = $request->input('ts');
        $sig = $request->input('sig');
        $fname = $request->input('fname');
        $lname = $request->input('lname');
        $email = $request->input('email');
        $hospcode = $request->input('hospcode');
        $providerid = $request->input('providerid');

        // 1. ตรวจสอบค่าพารามิเตอร์ที่จำเป็น
        if (!$hashCid || !$ts || !$sig) {
            Log::warning('SSO Callback missing required parameters', $request->all());
            return redirect('/login')->withErrors(['error' => 'พารามิเตอร์ไม่ครบถ้วน (hash_cid, ts หรือ sig หายไป)']);
        }

        // 2. ตรวจสอบ timestamp ไม่เกิน 5 นาที (300 วินาที)
        $currentTs = time();
        if (abs($currentTs - (int) $ts) > 300) {
            Log::warning('SSO Callback signature expired', ['current_ts' => $currentTs, 'received_ts' => $ts]);
            return redirect('/login')->withErrors(['error' => 'ลายเซ็นหมดอายุ (Timestamp is too old) กรุณาเข้าสู่ระบบใหม่อีกครั้ง']);
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
                return redirect('/login')->withErrors(['error' => 'ลายเซ็นดิจิทัลไม่ถูกต้อง (Invalid signature)']);
            }
        }

        // 4. จัดเตรียมข้อมูลชื่อผู้ใช้ และหน่วยงาน
        $name = trim(($fname ?? '') . ' ' . ($lname ?? ''));
        if (empty($name)) {
            $name = 'SSO ProviderID User';
        }

        $hnameTh = $request->input('hname_th');
        if (empty($hnameTh) && !empty($hospcode)) {
            // ค้นหาชื่อสถานพยาบาลจากตาราง hospcode หรือใช้ hospcode เป็น fallback
            $hnameTh = \App\Models\Hospcode::where('hospcode', $hospcode)->value('name') ?? $hospcode;
        }

        // 5. ค้นหาผู้ใช้เดิม หรือสร้างผู้ใช้ใหม่
        $user = User::where(function ($q) use ($providerid, $hashCid, $email) {
            if ($providerid) {
                $q->where('moph_id', $providerid);
            }
            if ($hashCid) {
                $q->orWhere('pid', $hashCid);
            }
            if ($email) {
                $q->orWhere('email', $email);
            }
        })->first();

        if (!$user) {
            // สร้างผู้ใช้ใหม่
            $user = User::create([
                'name' => $name,
                'email' => !empty($email) ? $email : ($providerid ? $providerid . '@provider.local' : $hashCid . '@sso.local'),
                'password' => bcrypt(($providerid || $hospcode) ? ($providerid . $hospcode) : Str::random(16)),
                'pid' => $hashCid,
                'moph_id' => $providerid,
                'hospcode' => $hospcode,
                'hname_th' => $hnameTh,
                'role' => 'guest',
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
            if ($hospcode && $user->hospcode !== $hospcode) {
                $updates['hospcode'] = $hospcode;
            }
            if ($hnameTh && $user->hname_th !== $hnameTh) {
                $updates['hname_th'] = $hnameTh;
            }
            if (!empty($updates)) {
                $user->update($updates);
            }
        }

        // 6. ตรวจสอบสถานะบัญชี
        if (isset($user->is_active) && !$user->is_active) {
            return redirect('/login')->withErrors(['error' => 'บัญชีผู้ใช้งานของคุณถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ']);
        }

        // 7. Login เข้าระบบ Laravel
        Auth::login($user, true);
        $request->session()->regenerate();

        // 8. นำทางเข้าสู่ระบบ
        return redirect()->intended('/');
    }
}
