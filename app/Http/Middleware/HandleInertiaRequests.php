<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
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
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
        ];
    }
}
