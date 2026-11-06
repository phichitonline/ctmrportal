<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\MessagingNotificationService;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class ProfileNotificationController extends Controller
{
    protected MessagingNotificationService $messagingService;

    public function __construct(MessagingNotificationService $messagingService)
    {
        $this->messagingService = $messagingService;
    }

    /**
     * Show the user's profile and Telegram / LINE OA notification settings page.
     */
    public function show(): Response
    {
        /** @var User $user */
        $user = Auth::user();

        if (empty($user->notification_link_token)) {
            $user->update([
                'notification_link_token' => $this->generateUniqueLinkToken(),
            ]);
            $user->refresh();
        }

        $telegramBotUsername = ltrim(trim((string) config('services.telegram.bot_username', '')), '@');
        $lineBotBasicId = trim((string) config('services.line.bot_basic_id', ''));
        $lineLiffId = trim((string) config('services.line.liff_id', ''));

        return Inertia::render('Profile/Notifications', [
            'userProfile' => [
                'id' => $user->id,
                'name' => $user->name,
                'provider_id' => $user->provider_id,
                'email' => $user->email,
                'role' => $user->role,
                'agency_code' => $user->hospcode ?: $user->agency_code,
                'agency_name' => $user->hname_th ?: $user->agency_name,
                'position' => $user->position,
                'phone' => $user->phone,
                'telegram_chat_id' => $user->telegram_chat_id ?? '',
                'telegram_username' => $user->telegram_username ?? '',
                'telegram_linked_at' => $user->telegram_linked_at?->format('d/m/Y H:i น.'),
                'line_user_id' => $user->line_user_id ?? '',
                'line_display_name' => $user->line_display_name ?? '',
                'line_linked_at' => $user->line_linked_at?->format('d/m/Y H:i น.'),
                'notification_link_token' => $user->notification_link_token,
                'notification_preferences' => $user->getNotificationPrefs(),
            ],
            'botConfig' => [
                'telegram_configured' => $this->messagingService->isTelegramConfigured(),
                'telegram_bot_username' => $telegramBotUsername ?: 'PhichitSocBot',
                'telegram_deep_link' => $telegramBotUsername
                    ? "https://t.me/{$telegramBotUsername}?start={$user->notification_link_token}"
                    : null,
                'line_configured' => $this->messagingService->isLineConfigured(),
                'line_login_configured' => $this->messagingService->isLineLoginConfigured(),
                'line_bot_basic_id' => $lineBotBasicId ?: '@phichitsoc',
                'line_liff_id' => $lineLiffId,
                'connect_page_url' => url('/connect-notification?token=' . $user->notification_link_token),
                'line_callback_url' => url('/connect-notification/line/callback'),
                'telegram_callback_url' => url('/connect-notification/telegram/callback'),
            ],
        ]);
    }

    /**
     * Show the public/standalone Login & Channel Registration Page referencing `notification_link_token` (SOC-XXXXXX).
     */
    public function showConnectPage(Request $request, ?string $token = null): Response
    {
        $rawToken = $token ?: $request->query('token', '');
        $cleanToken = strtoupper(trim((string) $rawToken));

        // If user is logged in and didn't provide a token in URL, prefill their own token
        if ($cleanToken === '' && Auth::check()) {
            /** @var User $authUser */
            $authUser = Auth::user();
            if (empty($authUser->notification_link_token)) {
                $authUser->update(['notification_link_token' => $this->generateUniqueLinkToken()]);
                $authUser->refresh();
            }
            $cleanToken = $authUser->notification_link_token;
        }

        $matchedUser = null;
        if ($cleanToken !== '') {
            $user = User::where('notification_link_token', $cleanToken)->first();
            if ($user) {
                $matchedUser = [
                    'id' => $user->id,
                    'name' => $user->name,
                    'provider_id' => $user->provider_id,
                    'agency_code' => $user->hospcode ?: $user->agency_code,
                    'agency_name' => $user->hname_th ?: $user->agency_name,
                    'position' => $user->position ?: 'เจ้าหน้าที่ศูนย์เฝ้าระวัง SOC',
                    'notification_link_token' => $user->notification_link_token,
                    'has_telegram' => ! empty($user->telegram_chat_id),
                    'telegram_chat_id' => $user->telegram_chat_id ?? '',
                    'telegram_username' => $user->telegram_username ?? '',
                    'telegram_linked_at' => $user->telegram_linked_at?->format('d/m/Y H:i น.'),
                    'has_line' => ! empty($user->line_user_id),
                    'line_user_id' => $user->line_user_id ?? '',
                    'line_display_name' => $user->line_display_name ?? '',
                    'line_linked_at' => $user->line_linked_at?->format('d/m/Y H:i น.'),
                ];
            }
        }

        $telegramBotUsername = ltrim(trim((string) config('services.telegram.bot_username', '')), '@');
        $lineBotBasicId = trim((string) config('services.line.bot_basic_id', ''));
        $lineLiffId = trim((string) config('services.line.liff_id', ''));

        return Inertia::render('Profile/ConnectChannel', [
            'token' => $cleanToken,
            'matchedUser' => $matchedUser,
            'tokenNotFound' => $cleanToken !== '' && $matchedUser === null,
            'botConfig' => [
                'telegram_configured' => $this->messagingService->isTelegramConfigured(),
                'telegram_bot_username' => $telegramBotUsername ?: 'PhichitSocBot',
                'line_configured' => $this->messagingService->isLineConfigured(),
                'line_login_configured' => $this->messagingService->isLineLoginConfigured(),
                'line_bot_basic_id' => $lineBotBasicId ?: '@phichitsoc',
                'line_liff_id' => $lineLiffId,
                'telegram_callback_url' => url('/connect-notification/telegram/callback'),
                'line_callback_url' => url('/connect-notification/line/callback'),
            ],
        ]);
    }

    /**
     * Bind Telegram Chat ID and/or LINE User ID via the Connect Page referencing `notification_link_token`.
     */
    public function bindByToken(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string', 'max:30'],
            'channel' => ['required', 'in:telegram,line,both'],
            'telegram_chat_id' => ['nullable', 'string', 'max:100'],
            'telegram_username' => ['nullable', 'string', 'max:100'],
            'line_user_id' => ['nullable', 'string', 'max:100'],
            'line_display_name' => ['nullable', 'string', 'max:150'],
        ], [
            'token.required' => 'กรุณาระบุรหัสเชื่อมต่อประจำบัญชี (เช่น SOC-123456)',
        ]);

        $cleanToken = strtoupper(trim($validated['token']));
        $user = User::where('notification_link_token', $cleanToken)->first();

        if (! $user) {
            return back()->with('error', "ไม่พบรหัสเชื่อมต่อประจำบัญชี \"{$cleanToken}\" ในระบบ กรุณาตรวจสอบรหัสอีกครั้ง");
        }

        $channel = $validated['channel'];
        $agencyName = $user->hname_th ?: $user->agency_name;

        if (in_array($channel, ['telegram', 'both'])) {
            $tgId = trim((string) ($validated['telegram_chat_id'] ?? ''));
            $tgUser = ltrim(trim((string) ($validated['telegram_username'] ?? '')), '@');

            if ($tgId === '') {
                return back()->with('error', 'กรุณาระบุรหัส Telegram Chat ID หรือล็อกอินด้วย Telegram');
            }

            $user->update([
                'telegram_chat_id' => $tgId,
                'telegram_username' => $tgUser ?: $user->telegram_username,
                'telegram_linked_at' => Carbon::now(),
            ]);

            $this->messagingService->sendTelegramMessage(
                $tgId,
                "✅ ลงทะเบียนเชื่อมต่อ Telegram กับรหัสประจำบัญชี {$cleanToken} สำเร็จ!\n"
                . "👤 ผู้ใช้งาน: {$user->name} ({$user->provider_id})\n"
                . "🏥 หน่วยงาน: {$agencyName}"
            );
        }

        if (in_array($channel, ['line', 'both'])) {
            $lineId = trim((string) ($validated['line_user_id'] ?? ''));
            $lineName = trim((string) ($validated['line_display_name'] ?? ''));

            if ($lineId === '') {
                return back()->with('error', 'กรุณาระบุรหัส LINE User ID หรือล็อกอินด้วย LINE');
            }

            // Try to fetch profile display name from LINE API if not provided
            if ($lineName === '') {
                $profile = $this->messagingService->getLineUserProfile($lineId);
                $lineName = $profile['displayName'] ?? ($user->line_display_name ?: 'LINE User');
            }

            $user->update([
                'line_user_id' => $lineId,
                'line_display_name' => $lineName,
                'line_linked_at' => Carbon::now(),
            ]);

            $this->messagingService->sendLinePushMessage(
                $lineId,
                "✅ ลงทะเบียนเชื่อมต่อ LINE OA กับรหัสประจำบัญชี {$cleanToken} สำเร็จ!\n"
                . "👤 ผู้ใช้งาน: {$user->name} ({$user->provider_id})\n"
                . "🏥 หน่วยงาน: {$agencyName}"
            );
        }

        return redirect("/connect-notification?token={$cleanToken}")
            ->with('success', "บันทึกการเชื่อมต่อเข้ากับรหัสประจำบัญชี {$cleanToken} ({$user->name}) เรียบร้อยแล้ว");
    }

    /**
     * Poll Telegram Bot getUpdates on the Connect Page referencing `notification_link_token` (no webhook required).
     */
    public function syncTelegramByToken(Request $request): RedirectResponse
    {
        $token = strtoupper(trim((string) $request->input('token', '')));
        $user = User::where('notification_link_token', $token)->first();

        if (! $user) {
            return back()->with('error', 'ไม่พบรหัสเชื่อมต่อประจำบัญชีที่ระบุ');
        }

        $result = $this->messagingService->syncTelegramUpdatesForUser($user);

        if ($result['success']) {
            return redirect("/connect-notification?token={$token}")->with('success', $result['message']);
        }

        return redirect("/connect-notification?token={$token}")->with('error', $result['message']);
    }

    /**
     * Redirect user to LINE Login (OAuth 2.0) passing `notification_link_token` as state.
     */
    public function redirectToLineLogin(Request $request)
    {
        $token = strtoupper(trim((string) $request->query('token', '')));
        $user = User::where('notification_link_token', $token)->first();

        if (! $user) {
            return redirect('/connect-notification')->with('error', 'กรุณาระบุรหัสเชื่อมต่อประจำบัญชี (เช่น SOC-123456) ที่ถูกต้องก่อนเข้าสู่ระบบด้วย LINE');
        }

        $callbackUrl = url('/connect-notification/line/callback');
        $authorizeUrl = $this->messagingService->getLineLoginAuthorizeUrl($token, $callbackUrl);

        if (! $authorizeUrl) {
            return redirect("/connect-notification?token={$token}")
                ->with('error', 'ระบบยังไม่ได้ตั้งค่า LINE_LOGIN_CHANNEL_ID ใน .env คุณสามารถกรอก LINE User ID หรือเข้าผ่านหน้ายืนยันตัวตนด้านล่างได้ทันที');
        }

        return Inertia::location($authorizeUrl);
    }

    /**
     * Handle OAuth 2.0 callback from LINE Login and save `line_user_id` to the user matching `state` (SOC-XXXXXX).
     */
    public function handleLineLoginCallback(Request $request): RedirectResponse
    {
        $code = (string) $request->query('code', '');
        $token = strtoupper(trim((string) $request->query('state', '')));
        $error = (string) $request->query('error', '');

        if ($error !== '' || $code === '') {
            $errDesc = $request->query('error_description', 'ยกเลิกการเข้าสู่ระบบด้วย LINE');

            return redirect("/connect-notification?token={$token}")
                ->with('error', "ไม่สามารถเข้าสู่ระบบด้วย LINE ได้: {$errDesc}");
        }

        $user = User::where('notification_link_token', $token)->first();
        if (! $user) {
            return redirect('/connect-notification')
                ->with('error', 'ไม่พบรหัสเชื่อมต่อประจำบัญชีที่อ้างอิงจากการเข้าสู่ระบบ LINE');
        }

        $callbackUrl = url('/connect-notification/line/callback');
        $result = $this->messagingService->exchangeLineLoginCode($code, $callbackUrl);

        if (! $result['success'] || empty($result['userId'])) {
            return redirect("/connect-notification?token={$token}")
                ->with('error', $result['message'] ?? 'ไม่สามารถดึง LINE User ID จากการล็อกอินได้');
        }

        $lineUserId = $result['userId'];
        $displayName = $result['displayName'] ?? 'LINE User';

        $user->update([
            'line_user_id' => $lineUserId,
            'line_display_name' => $displayName,
            'line_linked_at' => Carbon::now(),
        ]);

        $this->messagingService->sendLinePushMessage(
            $lineUserId,
            "✅ ยืนยันตัวตนด้วย LINE Login สำเร็จ!\n"
            . "🔗 รหัสประจำบัญชี: {$token}\n"
            . "👤 ผู้ใช้งาน: {$user->name} ({$user->provider_id})\n"
            . "🏥 หน่วยงาน: " . ($user->hname_th ?: $user->agency_name)
        );

        return redirect("/connect-notification?token={$token}")
            ->with('success', "เข้าสู่ระบบด้วย LINE สำเร็จ! บันทึก LINE User ID ({$displayName}) เข้ากับบัญชี {$user->name} เรียบร้อยแล้ว");
    }

    /**
     * Handle callback from Telegram Login Widget and save `telegram_chat_id` to the user matching `token` (SOC-XXXXXX).
     */
    public function handleTelegramLoginCallback(Request $request): RedirectResponse
    {
        $token = strtoupper(trim((string) $request->input('token', '')));
        $user = User::where('notification_link_token', $token)->first();

        if (! $user) {
            return redirect('/connect-notification')
                ->with('error', 'ไม่พบรหัสเชื่อมต่อประจำบัญชีที่อ้างอิงจากการล็อกอิน Telegram');
        }

        $authData = $request->only(['id', 'first_name', 'last_name', 'username', 'photo_url', 'auth_date', 'hash']);

        if (! $this->messagingService->verifyTelegramWidgetAuth($authData)) {
            return redirect("/connect-notification?token={$token}")
                ->with('error', 'การตรวจสอบลายเซ็นยืนยันตัวตนจาก Telegram Login ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
        }

        $chatId = (string) $authData['id'];
        $username = $authData['username'] ?? trim(($authData['first_name'] ?? '') . ' ' . ($authData['last_name'] ?? ''));

        $user->update([
            'telegram_chat_id' => $chatId,
            'telegram_username' => $username ?: 'TelegramUser',
            'telegram_linked_at' => Carbon::now(),
        ]);

        $this->messagingService->sendTelegramMessage(
            $chatId,
            "✅ ยืนยันตัวตนด้วย Telegram Login สำเร็จ!\n"
            . "🔗 รหัสประจำบัญชี: {$token}\n"
            . "👤 ผู้ใช้งาน: {$user->name} ({$user->provider_id})\n"
            . "🏥 หน่วยงาน: " . ($user->hname_th ?: $user->agency_name)
        );

        return redirect("/connect-notification?token={$token}")
            ->with('success', "เข้าสู่ระบบด้วย Telegram สำเร็จ! บันทึก Chat ID: {$chatId} (@{$username}) เข้ากับบัญชี {$user->name} เรียบร้อยแล้ว");
    }

    /**
     * Save or update user's Telegram Chat ID, LINE User ID, and notification preferences from Profile page.
     */
    public function update(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $validated = $request->validate([
            'phone' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:255'],
            'telegram_chat_id' => ['nullable', 'string', 'max:100'],
            'telegram_username' => ['nullable', 'string', 'max:100'],
            'line_user_id' => ['nullable', 'string', 'max:100'],
            'line_display_name' => ['nullable', 'string', 'max:150'],
            'preferences' => ['nullable', 'array'],
        ]);

        $newTelegramId = trim((string) ($validated['telegram_chat_id'] ?? '')) ?: null;
        $newLineId = trim((string) ($validated['line_user_id'] ?? '')) ?: null;

        $telegramLinkedAt = $user->telegram_linked_at;
        if ($newTelegramId && $newTelegramId !== $user->telegram_chat_id) {
            $telegramLinkedAt = Carbon::now();
        } elseif (! $newTelegramId) {
            $telegramLinkedAt = null;
        }

        $lineLinkedAt = $user->line_linked_at;
        if ($newLineId && $newLineId !== $user->line_user_id) {
            $lineLinkedAt = Carbon::now();
        } elseif (! $newLineId) {
            $lineLinkedAt = null;
        }

        $prefs = array_merge(
            User::defaultNotificationPreferences(),
            is_array($validated['preferences'] ?? null) ? $validated['preferences'] : []
        );

        $user->update([
            'phone' => $validated['phone'] ?? $user->phone,
            'email' => $validated['email'] ?? $user->email,
            'telegram_chat_id' => $newTelegramId,
            'telegram_username' => $newTelegramId ? (trim((string) ($validated['telegram_username'] ?? '')) ?: $user->telegram_username) : null,
            'telegram_linked_at' => $telegramLinkedAt,
            'line_user_id' => $newLineId,
            'line_display_name' => $newLineId ? (trim((string) ($validated['line_display_name'] ?? '')) ?: $user->line_display_name) : null,
            'line_linked_at' => $lineLinkedAt,
            'notification_preferences' => $prefs,
        ]);

        return back()->with('success', 'บันทึกข้อมูลการเชื่อมต่อ Telegram / LINE OA และการตั้งค่าการแจ้งเตือนเรียบร้อยแล้ว');
    }

    /**
     * Regenerate the user's 6-digit verification token for linking Telegram / LINE OA.
     */
    public function regenerateToken(): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $token = $this->generateUniqueLinkToken();
        $user->update([
            'notification_link_token' => $token,
        ]);

        return back()->with('success', "สร้างรหัสเชื่อมต่อใหม่ ({$token}) เรียบร้อยแล้ว");
    }

    /**
     * Poll Telegram Bot getUpdates to automatically detect and bind the user's chat_id.
     */
    public function syncTelegram(): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $result = $this->messagingService->syncTelegramUpdatesForUser($user);

        if ($result['success']) {
            return back()->with('success', $result['message']);
        }

        return back()->with('error', $result['message']);
    }

    /**
     * Unlink Telegram or LINE OA from the user's profile.
     */
    public function unlinkChannel(Request $request, string $channel): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        if ($channel === 'telegram') {
            $user->update([
                'telegram_chat_id' => null,
                'telegram_username' => null,
                'telegram_linked_at' => null,
            ]);

            return back()->with('success', 'ยกเลิกการเชื่อมต่อบัญชี Telegram เรียบร้อยแล้ว');
        }

        if ($channel === 'line') {
            $user->update([
                'line_user_id' => null,
                'line_display_name' => null,
                'line_linked_at' => null,
            ]);

            return back()->with('success', 'ยกเลิกการเชื่อมต่อบัญชี LINE OA เรียบร้อยแล้ว');
        }

        return back()->with('error', 'ไม่พบช่องทางที่ต้องการยกเลิก');
    }

    /**
     * Send a test notification message to the user's Telegram or LINE OA.
     */
    public function sendTestNotification(Request $request, string $channel): RedirectResponse
    {
        /** @var User $user */
        $user = Auth::user();

        $nowStr = Carbon::now()->format('d/m/Y H:i:s');
        $agencyName = $user->hname_th ?: $user->agency_name;

        $testMessage = "🔔 [ทดสอบระบบแจ้งเตือน CTMR SOC พิจิตร]\n"
            . "👤 ผู้ใช้งาน: {$user->name} ({$user->provider_id})\n"
            . "🏥 หน่วยงาน: {$agencyName}\n"
            . "⏰ เวลาทดสอบ: {$nowStr} น.\n"
            . "✅ บัญชีของคุณพร้อมรับแจ้งเตือนตารางเวรและเหตุการณ์ความมั่นคงปลอดภัยไซเบอร์แล้ว";

        if ($channel === 'telegram') {
            if (empty($user->telegram_chat_id)) {
                return back()->with('error', 'กรุณาระบุและบันทึก Telegram Chat ID ก่อนกดทดสอบส่งข้อความ');
            }

            $res = $this->messagingService->sendTelegramMessage($user->telegram_chat_id, $testMessage);

            return $res['success']
                ? back()->with('success', $res['message'])
                : back()->with('error', $res['message']);
        }

        if ($channel === 'line') {
            if (empty($user->line_user_id)) {
                return back()->with('error', 'กรุณาระบุและบันทึก LINE User ID ก่อนกดทดสอบส่งข้อความ');
            }

            $res = $this->messagingService->sendLinePushMessage($user->line_user_id, $testMessage);

            return $res['success']
                ? back()->with('success', $res['message'])
                : back()->with('error', $res['message']);
        }

        return back()->with('error', 'ไม่รู้จักช่องทางการส่งข้อความ');
    }

    /**
     * Generate a unique 6-digit verification token (e.g., SOC-482910).
     */
    private function generateUniqueLinkToken(): string
    {
        do {
            $token = 'SOC-' . random_int(100000, 999999);
        } while (User::where('notification_link_token', $token)->exists());

        return $token;
    }
}
