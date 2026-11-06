<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\MessagingNotificationService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
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
                'preferences' => $user->getNotificationPrefs(),
            ],
            'botConfig' => [
                'telegram_configured' => $this->messagingService->isTelegramConfigured(),
                'telegram_bot_username' => $telegramBotUsername ?: 'CTMRPhichitSOCBot',
                'telegram_deep_link' => $telegramBotUsername
                    ? "https://t.me/{$telegramBotUsername}?start={$user->notification_link_token}"
                    : null,
                'line_configured' => $this->messagingService->isLineConfigured(),
                'line_bot_basic_id' => $lineBotBasicId ?: '@ctmr-soc',
                'telegram_webhook_url' => url('/webhooks/telegram'),
                'line_webhook_url' => url('/webhooks/line'),
            ],
        ]);
    }

    /**
     * Save or update user's Telegram Chat ID, LINE User ID, and notification preferences.
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
     * Public Webhook endpoint for Telegram Bot updates.
     */
    public function handleTelegramWebhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        Log::info('Telegram Webhook Received:', $payload);

        $message = $payload['message'] ?? null;
        if (! $message) {
            return response()->json(['status' => 'ignored']);
        }

        $chatId = (string) ($message['chat']['id'] ?? '');
        $text = trim((string) ($message['text'] ?? ''));
        $username = $message['from']['username'] ?? ($message['from']['first_name'] ?? 'TelegramUser');

        if (! $chatId || $text === '') {
            return response()->json(['status' => 'ok']);
        }

        // Support "/id" command to reply back the user's Telegram Chat ID
        if (in_array(strtolower($text), ['/id', 'id', 'ขอรหัส'])) {
            $this->messagingService->sendTelegramMessage(
                $chatId,
                "🆔 รหัส Telegram Chat ID ของคุณคือ:\n{$chatId}\n\nสามารถคัดลอกรหัสนี้ไปกรอกในหน้าโปรไฟล์ของระบบ CTMR Portal ได้ทันทีครับ"
            );

            return response()->json(['status' => 'replied_id']);
        }

        // Extract SOC-XXXXXX token from "/start SOC-XXXXXX" or direct text "SOC-XXXXXX"
        if (preg_match('/(SOC-\d{6})/i', strtoupper($text), $matches)) {
            $token = strtoupper($matches[1]);
            $user = User::where('notification_link_token', $token)->first();

            if ($user) {
                $user->update([
                    'telegram_chat_id' => $chatId,
                    'telegram_username' => $username,
                    'telegram_linked_at' => Carbon::now(),
                ]);

                $this->messagingService->sendTelegramMessage(
                    $chatId,
                    "✅ เชื่อมต่อบัญชี Telegram กับศูนย์ SOC สสจ.พิจิตร สำเร็จ!\n"
                    . "👤 ชื่อ-สกุล: {$user->name} ({$user->provider_id})\n"
                    . "🏥 หน่วยงาน: " . ($user->hname_th ?: $user->agency_name)
                );

                return response()->json(['status' => 'linked', 'user_id' => $user->id]);
            }
        }

        return response()->json(['status' => 'ok']);
    }

    /**
     * Public Webhook endpoint for LINE Official Account (Messaging API).
     */
    public function handleLineWebhook(Request $request): JsonResponse
    {
        $payload = $request->all();
        Log::info('LINE OA Webhook Received:', $payload);

        $events = $payload['events'] ?? [];
        foreach ($events as $event) {
            $lineUserId = $event['source']['userId'] ?? null;
            $replyToken = $event['replyToken'] ?? null;
            $eventType = $event['type'] ?? '';

            if (! $lineUserId) {
                continue;
            }

            // When user follows the LINE OA, greet them with their LINE User ID and instructions
            if ($eventType === 'follow' && $replyToken) {
                $this->messagingService->replyLineMessage(
                    $replyToken,
                    "สวัสดีครับ ยินดีต้อนรับสู่ศูนย์แจ้งเตือน CTMR SOC สสจ.พิจิตร 🛡️\n\n"
                    . "🆔 LINE User ID ของคุณคือ:\n{$lineUserId}\n\n"
                    . "📌 วิธีผูกบัญชีรับการแจ้งเตือน:\n"
                    . "1. พิมพ์รหัสยืนยัน 6 หลักจากหน้าโปรไฟล์ของคุณ (เช่น SOC-123456) ส่งมาในแชทนี้\n"
                    . "หรือคัดลอก LINE User ID ด้านบนไปวางในหน้าโปรไฟล์บนเว็บไซต์ได้ทันทีครับ"
                );

                continue;
            }

            if ($eventType === 'message' && ($event['message']['type'] ?? '') === 'text') {
                $text = trim((string) ($event['message']['text'] ?? ''));

                // Command to ask for own LINE User ID
                if (in_array(strtolower($text), ['/id', 'id', 'ขอรหัส', 'userid'])) {
                    if ($replyToken) {
                        $this->messagingService->replyLineMessage(
                            $replyToken,
                            "🆔 LINE User ID ของคุณคือ:\n{$lineUserId}\n\nสามารถคัดลอกไปใส่ในหน้าโปรไฟล์ของระบบ CTMR Portal ได้ทันทีครับ"
                        );
                    }

                    continue;
                }

                // Match SOC-XXXXXX verification code
                if (preg_match('/(SOC-\d{6})/i', strtoupper($text), $matches)) {
                    $token = strtoupper($matches[1]);
                    $user = User::where('notification_link_token', $token)->first();

                    if ($user) {
                        $profile = $this->messagingService->getLineUserProfile($lineUserId);
                        $displayName = $profile['displayName'] ?? 'LINE User';

                        $user->update([
                            'line_user_id' => $lineUserId,
                            'line_display_name' => $displayName,
                            'line_linked_at' => Carbon::now(),
                        ]);

                        if ($replyToken) {
                            $this->messagingService->replyLineMessage(
                                $replyToken,
                                "✅ เชื่อมต่อบัญชี LINE OA กับศูนย์ SOC สสจ.พิจิตร สำเร็จ!\n"
                                . "👤 ผู้ใช้งาน: {$user->name} ({$user->provider_id})\n"
                                . "🏥 หน่วยงาน: " . ($user->hname_th ?: $user->agency_name)
                            );
                        }
                    } elseif ($replyToken) {
                        $this->messagingService->replyLineMessage(
                            $replyToken,
                            "❌ ไม่พบรหัสยืนยัน {$token} ในระบบ กรุณาตรวจสอบรหัสในหน้าโปรไฟล์ของคุณอีกครั้งครับ"
                        );
                    }
                }
            }
        }

        return response()->json(['status' => 'ok']);
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

