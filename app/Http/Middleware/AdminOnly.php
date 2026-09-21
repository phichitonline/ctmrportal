<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminOnly
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() || ! $request->user()->isAdmin()) {
            abort(403, 'เฉพาะผู้ดูแลระบบส่วนกลาง (Admin) เท่านั้นที่สามารถเข้าถึงโมดูลจัดการผู้ใช้งานได้');
        }

        return $next($request);
    }
}
