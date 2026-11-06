<?php

namespace App\Services;

use App\Models\User;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MessagingNotificationService
{
    protected string $telegramBotToken;

    protected string $telegramBotUsername;

    protected string $lineAccessToken;

    protected string $lineChannelSecret;

    protected string $lineBotBasicId;

    public function __construct()
    {
        $this->telegramBotToken = trim((string) config('services.telegram.bot_token', ''));
        $this->telegramBotUsername = ltrim(trim((string) config('services.telegram.bot_username', '')), '@');
        $this->lineAccessToken = trim((string) config('services.line.channel_access_token', ''));
        $this->lineChannelSecret = trim((string) config('services.line.channel_secret', ''));
        $this->lineBotBasicId = trim((string) config('services.line.bot_basic_id', ''));
    }

    public function isTelegramConfigured(): bool
    {
        return ! empty($this->telegramBotToken);
    }

    public function isLineConfigured(): bool
    {
        return ! empty($this->lineAccessToken);
    }

    /**
     * Send a message via Telegram Bot API to a specific chat_id.
     */
    public function sendTelegramMessage(string $chatId, string $message, bool $parseMarkdown = false): array
    {
        $chatId = trim($chatId);
        if (empty($chatId)) {
            return ['success' => false, 'message' => 'ไม่ได้ระบุ Telegram Chat ID'];
        }

        if (! $this->isTelegramConfigured()) {
            Log::info("[Telegram Simulated -> {$chatId}]: {$message}");

            return [
                'success' => true,
                'simulated' => true,
                'message' => "บันทึกการส่งข้อความจำลองไปยัง Telegram Chat ID: {$chatId} เรียบร้อยแล้ว (ตั้งค่า TELEGRAM_BOT_TOKEN ใน .env เพื่อส่งจริง)",
            ];
        }

        try {
            $payload = [
                'chat_id' => $chatId,
                'text' => $message,
            ];

            if ($parseMarkdown) {
                $payload['parse_mode'] = 'HTML';
            }

            $response = Http::timeout(10)
                ->post("https://api.telegram.org/bot{$this->telegramBotToken}/sendMessage", $payload);

            if ($response->successful() && ($response->json('ok') === true)) {
                return [
                    'success' => true,
                    'simulated' => false,
                    'message' => "ส่งข้อความเข้า Telegram (Chat ID: {$chatId}) สำเร็จ",
                ];
            }

            $desc = $response->json('description') ?? $response->body();
            Log::warning("Telegram sendMessage failed for {$chatId}: {$desc}");

            return [
                'success' => false,
                'message' => "ไม่สามารถส่งข้อความ Telegram ได้: {$desc}",
            ];
        } catch (Exception $e) {
            Log::error('Telegram API Error: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการเชื่อมต่อ Telegram API: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Send a push message via LINE Messaging API to a specific LINE userId.
     */
    public function sendLinePushMessage(string $lineUserId, string $message): array
    {
        $lineUserId = trim($lineUserId);
        if (empty($lineUserId)) {
            return ['success' => false, 'message' => 'ไม่ได้ระบุ LINE User ID'];
        }

        if (! $this->isLineConfigured()) {
            Log::info("[LINE OA Simulated -> {$lineUserId}]: {$message}");

            return [
                'success' => true,
                'simulated' => true,
                'message' => "บันทึกการส่งข้อความจำลองไปยัง LINE User ID: {$lineUserId} เรียบร้อยแล้ว (ตั้งค่า LINE_CHANNEL_ACCESS_TOKEN ใน .env เพื่อส่งจริง)",
            ];
        }

        try {
            $response = Http::withToken($this->lineAccessToken)
                ->timeout(10)
                ->post('https://api.line.me/v2/bot/message/push', [
                    'to' => $lineUserId,
                    'messages' => [
                        [
                            'type' => 'text',
                            'text' => $message,
                        ],
                    ],
                ]);

            if ($response->successful()) {
                return [
                    'success' => true,
                    'simulated' => false,
                    'message' => "ส่งข้อความเข้า LINE OA (User ID: {$lineUserId}) สำเร็จ",
                ];
            }

            $errMsg = $response->json('message') ?? $response->body();
            Log::warning("LINE Push Message failed for {$lineUserId}: {$errMsg}");

            return [
                'success' => false,
                'message' => "ไม่สามารถส่งข้อความ LINE OA ได้: {$errMsg}",
            ];
        } catch (Exception $e) {
            Log::error('LINE Messaging API Error: ' . $e->getMessage());

            return [
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการเชื่อมต่อ LINE Messaging API: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Reply to a LINE webhook event using replyToken.
     */
    public function replyLineMessage(string $replyToken, string $message): bool
    {
        if (! $this->isLineConfigured() || empty($replyToken)) {
            return false;
        }

        try {
            $response = Http::withToken($this->lineAccessToken)
                ->timeout(8)
                ->post('https://api.line.me/v2/bot/message/reply', [
                    'replyToken' => $replyToken,
                    'messages' => [
                        [
                            'type' => 'text',
                            'text' => $message,
                        ],
                    ],
                ]);

            return $response->successful();
        } catch (Exception $e) {
            Log::warning('LINE Reply Error: ' . $e->getMessage());

            return false;
        }
    }

    /**
     * Fetch user display name from LINE Profile API.
     */
    public function getLineUserProfile(string $lineUserId): ?array
    {
        if (! $this->isLineConfigured() || empty($lineUserId)) {
            return null;
        }

        try {
            $response = Http::withToken($this->lineAccessToken)
                ->timeout(6)
                ->get("https://api.line.me/v2/bot/profile/{$lineUserId}");

            if ($response->successful()) {
                return $response->json();
            }
        } catch (Exception $e) {
            Log::warning('LINE Get Profile Error: ' . $e->getMessage());
        }

        return null;
    }

    /**
     * Poll Telegram getUpdates to match a user's notification_link_token (works even on localhost without webhook).
     */
    public function syncTelegramUpdatesForUser(User $user): array
    {
        if (empty($user->notification_link_token)) {
            return ['success' => false, 'message' => 'กรุณากดสร้างรหัสเชื่อมโยง (Link Code) ก่อน'];
        }

        if (! $this->isTelegramConfigured()) {
            return [
                'success' => false,
                'message' => 'ยังไม่ได้ตั้งค่า TELEGRAM_BOT_TOKEN ในไฟล์ .env (คุณสามารถกรอก Telegram Chat ID ด้วยตนเองด้านล่างได้ทันที)',
            ];
        }

        try {
            $response = Http::timeout(10)
                ->get("https://api.telegram.org/bot{$this->telegramBotToken}/getUpdates", [
                    'limit' => 50,
                ]);

            if (! $response->successful() || ! $response->json('ok')) {
                $desc = $response->json('description') ?? 'ไม่สามารถดึงข้อมูลจาก Telegram Bot ได้';

                return ['success' => false, 'message' => $desc];
            }

            $updates = $response->json('result') ?? [];
            $token = strtoupper(trim($user->notification_link_token));

            foreach (array_reverse($updates) as $update) {
                $msg = $update['message'] ?? null;
                if (! $msg) {
                    continue;
                }

                $text = strtoupper(trim((string) ($msg['text'] ?? '')));
                $chatId = (string) ($msg['chat']['id'] ?? '');
                $username = $msg['from']['username'] ?? ($msg['from']['first_name'] ?? 'TelegramUser');

                if ($chatId && str_contains($text, $token)) {
                    $user->update([
                        'telegram_chat_id' => $chatId,
                        'telegram_username' => $username,
                        'telegram_linked_at' => Carbon::now(),
                    ]);

                    $this->sendTelegramMessage(
                        $chatId,
                        "✅ เชื่อมต่อบัญชีแจ้งเตือนศูนย์ SOC สสจ.พิจิตร สำเร็จ!\n👤 ผู้ใช้งาน: {$user->name} ({$user->provider_id})\n🏥 หน่วยงาน: {$user->agency_name}"
                    );

                    return [
                        'success' => true,
                        'message' => "เชื่อมต่อ Telegram สำเร็จ! บันทึก Chat ID: {$chatId} (@{$username}) เข้าสู่โปรไฟล์เรียบร้อยแล้ว",
                    ];
                }
            }

            return [
                'success' => false,
                'message' => "ยังไม่พบข้อความรหัส \"{$token}\" ในแชทของบอท กรุณาส่งข้อความรหัส {$token} ไปที่ Telegram Bot แล้วลองกดตรวจสอบอีกครั้ง",
            ];
        } catch (Exception $e) {
            return [
                'success' => false,
                'message' => 'เกิดข้อผิดพลาดในการเชื่อมต่อ Telegram API: ' . $e->getMessage(),
            ];
        }
    }

    /**
     * Send notification to a User across all their enabled & linked channels (Telegram & LINE OA).
     */
    public function notifyUser(User $user, string $message, string $preferenceKey = ''): array
    {
        if ($preferenceKey && ! $user->wantsNotification($preferenceKey)) {
            return ['telegram' => null, 'line' => null, 'skipped' => true];
        }

        $results = [
            'telegram' => null,
            'line' => null,
        ];

        $prefs = $user->getNotificationPrefs();

        if (! empty($user->telegram_chat_id) && ($prefs['telegram_enabled'] ?? true)) {
            $results['telegram'] = $this->sendTelegramMessage($user->telegram_chat_id, $message);
        }

        if (! empty($user->line_user_id) && ($prefs['line_enabled'] ?? true)) {
            $results['line'] = $this->sendLinePushMessage($user->line_user_id, $message);
        }

        return $results;
    }

    /**
     * Broadcast notification to all active users who have linked Telegram or LINE OA and enabled the given preference.
     */
    public function broadcastToLinkedUsers(string $message, string $preferenceKey = ''): void
    {
        $users = User::where('is_active', true)
            ->where(function ($q) {
                $q->whereNotNull('telegram_chat_id')
                    ->orWhereNotNull('line_user_id');
            })
            ->get();

        foreach ($users as $user) {
            $this->notifyUser($user, $message, $preferenceKey);
        }
    }
}

