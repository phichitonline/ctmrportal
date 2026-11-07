<?php

namespace App\Http\Middleware;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user() ? [
                    'id' => $request->user()->id,
                    'name' => $request->user()->name,
                    'provider_id' => $request->user()->provider_id,
                    'email' => $request->user()->email,
                    'role' => $request->user()->role,
                    'is_admin' => $request->user()->isAdmin(),
                    'agency_code' => $request->user()->agency_code,
                    'agency_name' => $request->user()->agency_name,
                    'position' => $request->user()->position,
                    'phone' => $request->user()->phone,
                    'telegram_chat_id' => $request->user()->telegram_chat_id,
                    'telegram_username' => $request->user()->telegram_username,
                    'line_user_id' => $request->user()->line_user_id,
                    'line_display_name' => $request->user()->line_display_name,
                    'has_telegram' => ! empty($request->user()->telegram_chat_id),
                    'has_line' => ! empty($request->user()->line_user_id),
                    'is_active' => $request->user()->is_active,
                    'has_2fa' => $request->user()->hasEnabledTwoFactor(),
                ] : null,
            ],
            'onlineUsers' => fn () => $request->user() ? $this->getOnlineUsersData($request) : ['count' => 0, 'users' => []],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }

    /**
     * Retrieve currently online users based on active sessions (within the last 15 minutes).
     */
    protected function getOnlineUsersData(Request $request): array
    {
        $currentUser = $request->user();
        $threshold = Carbon::now()->subMinutes(15)->timestamp;
        $onlineList = collect();

        try {
            if (Schema::hasTable('sessions')) {
                $sessions = DB::table('sessions')
                    ->whereNotNull('user_id')
                    ->where('last_activity', '>=', $threshold)
                    ->orderByDesc('last_activity')
                    ->get()
                    ->unique('user_id');

                $userIds = $sessions->pluck('user_id')->all();

                if (! in_array($currentUser->id, $userIds)) {
                    $userIds[] = $currentUser->id;
                }

                $usersMap = User::whereIn('id', $userIds)
                    ->get(['id', 'name', 'provider_id', 'role', 'position', 'agency_code', 'agency_name', 'hospcode'])
                    ->keyBy('id');

                $sessionActivityMap = $sessions->pluck('last_activity', 'user_id');

                foreach ($userIds as $uid) {
                    $u = $usersMap->get($uid);
                    if (! $u) {
                        continue;
                    }

                    $lastActTs = $sessionActivityMap->get($uid, time());
                    $diffMins = max(0, (int) floor((time() - $lastActTs) / 60));

                    $onlineList->push([
                        'id' => $u->id,
                        'name' => $u->name,
                        'provider_id' => $u->provider_id,
                        'initials' => mb_strtoupper(mb_substr($u->provider_id ?: $u->name, 0, 2)),
                        'role' => $u->role,
                        'position' => $u->position ?: ($u->role === 'admin' ? 'SOC Administrator' : 'เจ้าหน้าที่สารสนเทศ'),
                        'agency_code' => $u->hospcode ?: $u->agency_code,
                        'agency_name' => $u->agency_name,
                        'is_current' => $u->id === $currentUser->id,
                        'last_active_label' => $diffMins === 0 ? 'กำลังใช้งานขณะนี้' : "{$diffMins} นาทีที่แล้ว",
                    ]);
                }
            }
        } catch (\Throwable $e) {
            // Fallback to current user if session table query fails
        }

        if ($onlineList->isEmpty() && $currentUser) {
            $onlineList->push([
                'id' => $currentUser->id,
                'name' => $currentUser->name,
                'provider_id' => $currentUser->provider_id,
                'initials' => mb_strtoupper(mb_substr($currentUser->provider_id ?: $currentUser->name, 0, 2)),
                'role' => $currentUser->role,
                'position' => $currentUser->position ?: ($currentUser->role === 'admin' ? 'SOC Administrator' : 'เจ้าหน้าที่สารสนเทศ'),
                'agency_code' => $currentUser->hospcode ?: $currentUser->agency_code,
                'agency_name' => $currentUser->agency_name,
                'is_current' => true,
                'last_active_label' => 'กำลังใช้งานขณะนี้',
            ]);
        }

        return [
            'count' => $onlineList->count(),
            'users' => $onlineList->values()->all(),
        ];
    }
}
