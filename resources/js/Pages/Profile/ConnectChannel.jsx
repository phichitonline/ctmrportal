import React, { useState, useEffect, useRef } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';

export default function ConnectChannel({ token = '', matchedUser = null, tokenNotFound = false, botConfig = {} }) {
    const { auth, flash } = usePage().props;
    const [lookupToken, setLookupToken] = useState(token || '');
    const [syncingTelegram, setSyncingTelegram] = useState(false);
    const [liffStatus, setLiffStatus] = useState('');
    const telegramWidgetRef = useRef(null);

    const tgForm = useForm({
        token: matchedUser?.notification_link_token || token || '',
        channel: 'telegram',
        telegram_chat_id: matchedUser?.telegram_chat_id || '',
        telegram_username: matchedUser?.telegram_username || '',
    });

    const lineForm = useForm({
        token: matchedUser?.notification_link_token || token || '',
        channel: 'line',
        line_user_id: matchedUser?.line_user_id || '',
        line_display_name: matchedUser?.line_display_name || '',
    });

    useEffect(() => {
        setLookupToken(token || '');
        tgForm.setData({
            token: matchedUser?.notification_link_token || token || '',
            channel: 'telegram',
            telegram_chat_id: matchedUser?.telegram_chat_id || '',
            telegram_username: matchedUser?.telegram_username || '',
        });
        lineForm.setData({
            token: matchedUser?.notification_link_token || token || '',
            channel: 'line',
            line_user_id: matchedUser?.line_user_id || '',
            line_display_name: matchedUser?.line_display_name || '',
        });
    }, [token, matchedUser]);

    // Mount Official Telegram Login Widget when matchedUser is present
    useEffect(() => {
        if (!matchedUser || !telegramWidgetRef.current) return;
        const botUsername = (botConfig?.telegram_bot_username || '').replace(/^@/, '');
        if (!botUsername) return;

        telegramWidgetRef.current.innerHTML = '';
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.async = true;
        script.setAttribute('data-telegram-login', botUsername);
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '8');
        script.setAttribute(
            'data-auth-url',
            `${botConfig.telegram_callback_url}?token=${encodeURIComponent(matchedUser.notification_link_token)}`
        );
        script.setAttribute('data-request-access', 'write');
        telegramWidgetRef.current.appendChild(script);
    }, [matchedUser, botConfig?.telegram_bot_username]);

    // Optional LINE LIFF Auto-Detection if LINE_LIFF_ID is configured
    useEffect(() => {
        if (!matchedUser || !botConfig?.line_liff_id) return;

        const existingScript = document.getElementById('line-liff-sdk');
        const initLiff = () => {
            if (!window.liff) return;
            window.liff
                .init({ liffId: botConfig.line_liff_id })
                .then(() => {
                    if (window.liff.isLoggedIn()) {
                        window.liff.getProfile().then((profile) => {
                            if (profile?.userId) {
                                lineForm.setData({
                                    token: matchedUser.notification_link_token,
                                    channel: 'line',
                                    line_user_id: profile.userId,
                                    line_display_name: profile.displayName || '',
                                });
                                setLiffStatus(`ดึงข้อมูลจาก LINE สำเร็จ: ${profile.displayName} (${profile.userId})`);
                            }
                        });
                    }
                })
                .catch(() => {});
        };

        if (!existingScript) {
            const script = document.createElement('script');
            script.id = 'line-liff-sdk';
            script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
            script.onload = initLiff;
            document.body.appendChild(script);
        } else {
            initLiff();
        }
    }, [matchedUser, botConfig?.line_liff_id]);

    const handleVerifyToken = (e) => {
        e.preventDefault();
        const cleaned = lookupToken.trim().toUpperCase();
        if (!cleaned) return;
        router.get('/connect-notification', { token: cleaned });
    };

    const handleSyncTelegram = () => {
        if (!matchedUser) return;
        setSyncingTelegram(true);
        router.post(
            '/connect-notification/sync-telegram',
            { token: matchedUser.notification_link_token },
            {
                preserveScroll: true,
                onFinish: () => setSyncingTelegram(false),
            }
        );
    };

    const handleSaveTelegram = (e) => {
        e.preventDefault();
        tgForm.post('/connect-notification/bind', {
            preserveScroll: true,
        });
    };

    const handleSaveLine = (e) => {
        e.preventDefault();
        lineForm.post('/connect-notification/bind', {
            preserveScroll: true,
        });
    };

    const handleLiffLogin = () => {
        if (window.liff && botConfig?.line_liff_id) {
            if (!window.liff.isLoggedIn()) {
                window.liff.login({ redirectUri: window.location.href });
            }
            return;
        }
        window.location.href = `/connect-notification/line/redirect?token=${encodeURIComponent(
            matchedUser.notification_link_token
        )}`;
    };

    const botUsernameClean = (botConfig?.telegram_bot_username || 'PhichitSocBot').replace(/^@/, '');
    const telegramDeepLink = matchedUser
        ? `https://t.me/${botUsernameClean}?start=${matchedUser.notification_link_token}`
        : null;

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0B2545] via-[#13315C] to-[#F5F7FA] flex flex-col">
            <Head title="หน้าลงทะเบียนเชื่อมต่อ Telegram & LINE OA ประจำบัญชี" />

            {/* TOP HEADER BAR */}
            <header className="bg-slate-900/60 backdrop-blur-md border-b border-white/10 px-4 py-3 text-white">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <img src="/images/wazuh_mark_on_light.svg" alt="CTMR Logo" className="w-7 h-7 object-contain" />
                        <div>
                            <div className="text-xs font-bold tracking-wide text-sky-300 uppercase">
                                CTMR SOC Phichit • Channel Login
                            </div>
                            <div className="text-[11px] text-slate-300">
                                ระบบยืนยันตัวตนเพื่อผูกบัญชีรับแจ้งเตือน Telegram และ LINE OA
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {auth?.user ? (
                            <Link
                                href="/profile/notifications"
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition"
                            >
                                ← กลับหน้าตั้งค่าโปรไฟล์
                            </Link>
                        ) : (
                            <Link
                                href="/login"
                                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition"
                            >
                                เข้าสู่ระบบหลัก (MIS Portal)
                            </Link>
                        )}
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT */}
            <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6">
                {/* FLASH MESSAGES */}
                {flash?.success && (
                    <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-md text-xs sm:text-sm font-medium flex items-center gap-2.5">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{flash.success}</span>
                    </div>
                )}

                {flash?.error && (
                    <div className="bg-rose-600 text-white px-4 py-3 rounded-xl shadow-md text-xs sm:text-sm font-medium flex items-center gap-2.5">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{flash.error}</span>
                    </div>
                )}

                {/* STEP 1: ENTER / VERIFY ACCOUNT LINK TOKEN */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
                    <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-50 to-sky-50/60 border-b border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-[#006BB4]">
                                    ขั้นตอนที่ 1 • ยืนยันรหัสเชื่อมต่อประจำบัญชี
                                </span>
                                <h1 className="text-lg sm:text-xl font-bold text-slate-800 mt-1.5">
                                    เข้าสู่ระบบเชื่อมโยงบัญชีด้วยรหัสประจำตัว (Account Link Code)
                                </h1>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    นำรหัสเชื่อมต่อประจำบัญชี (เช่น <code className="font-mono font-bold text-[#006BB4]">SOC-123456</code>) จากหน้าโปรไฟล์ของคุณมากรอกเพื่ออ้างอิงบัญชีผู้ใช้งาน
                                </p>
                            </div>

                            <form onSubmit={handleVerifyToken} className="flex items-center gap-2 shrink-0">
                                <input
                                    type="text"
                                    value={lookupToken}
                                    onChange={(e) => setLookupToken(e.target.value.toUpperCase())}
                                    placeholder="เช่น SOC-123456"
                                    className="w-40 sm:w-44 px-3.5 py-2 text-sm font-mono font-bold uppercase tracking-wider bg-white border-2 border-sky-300 rounded-lg focus:outline-none focus:border-[#006BB4] text-[#006BB4]"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="px-4 py-2.5 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer shrink-0"
                                >
                                    🔍 ตรวจสอบรหัส
                                </button>
                            </form>
                        </div>

                        {tokenNotFound && (
                            <div className="mt-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
                                ❌ ไม่พบรหัสเชื่อมต่อประจำบัญชี <strong>"{token}"</strong> ในระบบ กรุณาตรวจสอบรหัสจากเมนู "แจ้งเตือน Telegram / LINE" ในหน้าโปรไฟล์ของคุณอีกครั้ง
                            </div>
                        )}
                    </div>

                    {/* MATCHED USER IDENTITY SUMMARY */}
                    {matchedUser ? (
                        <div className="p-5 sm:p-6 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5">
                                <div className="w-12 h-12 rounded-xl bg-[#006BB4] text-white flex items-center justify-center font-bold text-base shadow-xs uppercase shrink-0">
                                    {matchedUser.provider_id ? matchedUser.provider_id.substring(0, 2) : 'U'}
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-base font-bold text-slate-800">{matchedUser.name}</span>
                                        <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-sky-100 text-[#006BB4]">
                                            {matchedUser.provider_id}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                        {matchedUser.position} • สังกัด {matchedUser.agency_code} ({matchedUser.agency_name})
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <span
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${
                                        matchedUser.has_telegram
                                            ? 'bg-sky-50 text-[#0088cc] border-sky-200'
                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                    }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${matchedUser.has_telegram ? 'bg-[#0088cc]' : 'bg-slate-400'}`} />
                                    <span>Telegram: {matchedUser.has_telegram ? 'เชื่อมต่อแล้ว' : 'ยังไม่เชื่อมต่อ'}</span>
                                </span>

                                <span
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1.5 ${
                                        matchedUser.has_line
                                            ? 'bg-emerald-50 text-[#06C755] border-emerald-200'
                                            : 'bg-slate-100 text-slate-500 border-slate-200'
                                    }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${matchedUser.has_line ? 'bg-[#06C755]' : 'bg-slate-400'}`} />
                                    <span>LINE OA: {matchedUser.has_line ? 'เชื่อมต่อแล้ว' : 'ยังไม่เชื่อมต่อ'}</span>
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 text-center text-xs text-slate-500">
                            กรุณากรอกรหัสเชื่อมต่อประจำบัญชี (เช่น <code className="font-mono font-bold text-slate-700">SOC-XXXXXX</code>) ด้านบน เพื่อเริ่มขั้นตอนการล็อกอินผูกบัญชี Telegram และ LINE OA
                        </div>
                    )}
                </div>

                {/* STEP 2: LOGIN & BIND TELEGRAM / LINE OA (SHOWN WHEN TOKEN IS MATCHED) */}
                {matchedUser && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* ==================== TELEGRAM LOGIN & BIND CARD ==================== */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
                            <div className="px-5 py-4 bg-gradient-to-r from-[#0088cc] to-sky-600 text-white flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center font-bold text-base">
                                        ✈️
                                    </div>
                                    <div>
                                        <h2 className="text-sm sm:text-base font-bold">1. ลงทะเบียนเชื่อมต่อ Telegram</h2>
                                        <p className="text-[11px] text-sky-100">
                                            อ้างอิงรหัส: <span className="font-mono font-bold">{matchedUser.notification_link_token}</span>
                                        </p>
                                    </div>
                                </div>
                                {matchedUser.has_telegram && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400/25 border border-emerald-300/40">
                                        เชื่อมต่อแล้ว
                                    </span>
                                )}
                            </div>

                            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between text-xs">
                                <div className="space-y-4">
                                    {matchedUser.has_telegram && (
                                        <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-sky-900 space-y-0.5">
                                            <div className="font-bold">✅ บัญชีนี้ผูก Telegram Chat ID เรียบร้อยแล้ว</div>
                                            <div className="font-mono text-[11px]">
                                                Chat ID: <strong>{matchedUser.telegram_chat_id}</strong>
                                                {matchedUser.telegram_username && ` (@${matchedUser.telegram_username})`}
                                            </div>
                                        </div>
                                    )}

                                    {/* Option A: Telegram Login Widget & Bot Auto-Sync */}
                                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                                        <div className="font-bold text-slate-800">
                                            วิธีที่ 1: ล็อกอินผ่านปุ่ม Telegram Login หรือผ่านแชทบอท
                                        </div>
                                        <p className="text-[11px] text-slate-600 leading-relaxed">
                                            กดปุ่มล็อกอินด้วย Telegram ด้านล่าง หรือกดเปิดบอท <strong>@{botUsernameClean}</strong> แล้วกดปุ่ม <strong>"ดึงรหัส Chat ID อัตโนมัติ"</strong> (ไม่ต้องใช้ Webhook)
                                        </p>

                                        {/* Official Telegram Login Widget Container */}
                                        <div ref={telegramWidgetRef} className="min-h-[40px] flex items-center" />

                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                            {telegramDeepLink && (
                                                <a
                                                    href={telegramDeepLink}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3.5 py-2 bg-[#0088cc] hover:bg-[#0077b5] text-white font-semibold rounded-lg shadow-xs transition inline-flex items-center gap-1.5"
                                                >
                                                    <span>1. เปิดบอท @{botUsernameClean}</span>
                                                </a>
                                            )}

                                            <button
                                                type="button"
                                                onClick={handleSyncTelegram}
                                                disabled={syncingTelegram}
                                                className="px-3.5 py-2 bg-sky-100 hover:bg-sky-200 text-[#006BB4] border border-sky-300 font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
                                            >
                                                {syncingTelegram ? '⏳ กำลังดึงข้อมูล...' : '2. 🔄 ดึงรหัส Chat ID จากบอทอัตโนมัติ'}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Option B: Direct Form Binding with Token */}
                                    <form onSubmit={handleSaveTelegram} className="space-y-3 pt-2 border-t border-slate-200">
                                        <div className="font-bold text-slate-800">
                                            วิธีที่ 2: กรอกหรือยืนยันรหัส Telegram Chat ID เข้ากับรหัส {matchedUser.notification_link_token}
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                Telegram Chat ID <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={tgForm.data.telegram_chat_id}
                                                onChange={(e) => tgForm.setData('telegram_chat_id', e.target.value)}
                                                placeholder="เช่น 123456789"
                                                className="w-full px-3 py-2 font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0088cc]"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                ชื่อผู้ใช้ Telegram Username (ถ้ามี)
                                            </label>
                                            <input
                                                type="text"
                                                value={tgForm.data.telegram_username}
                                                onChange={(e) => tgForm.setData('telegram_username', e.target.value)}
                                                placeholder="เช่น somchai_soc"
                                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0088cc]"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={tgForm.processing}
                                            className="w-full py-2.5 bg-[#0088cc] hover:bg-[#0077b5] text-white font-bold rounded-lg shadow-xs transition cursor-pointer disabled:opacity-50"
                                        >
                                            {tgForm.processing ? 'กำลังบันทึก...' : `💾 บันทึก Telegram ID เข้ากับรหัส ${matchedUser.notification_link_token}`}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* ==================== LINE LOGIN & BIND CARD ==================== */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden flex flex-col">
                            <div className="px-5 py-4 bg-gradient-to-r from-[#06C755] to-emerald-600 text-white flex items-center justify-between">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center font-bold text-base">
                                        💬
                                    </div>
                                    <div>
                                        <h2 className="text-sm sm:text-base font-bold">2. ลงทะเบียนเชื่อมต่อ LINE OA</h2>
                                        <p className="text-[11px] text-emerald-50">
                                            อ้างอิงรหัส: <span className="font-mono font-bold">{matchedUser.notification_link_token}</span>
                                        </p>
                                    </div>
                                </div>
                                {matchedUser.has_line && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/25 border border-white/40">
                                        เชื่อมต่อแล้ว
                                    </span>
                                )}
                            </div>

                            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between text-xs">
                                <div className="space-y-4">
                                    {matchedUser.has_line && (
                                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 space-y-0.5">
                                            <div className="font-bold">✅ บัญชีนี้ผูก LINE User ID เรียบร้อยแล้ว</div>
                                            <div className="font-mono text-[11px] truncate">
                                                LINE ID: <strong>{matchedUser.line_user_id}</strong>
                                                {matchedUser.line_display_name && ` (${matchedUser.line_display_name})`}
                                            </div>
                                        </div>
                                    )}

                                    {liffStatus && (
                                        <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-lg font-medium">
                                            ✨ {liffStatus}
                                        </div>
                                    )}

                                    {/* Option A: LINE Login OAuth 2.0 Button */}
                                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                                        <div className="font-bold text-slate-800">
                                            วิธีที่ 1: เข้าสู่ระบบด้วย LINE (LINE Login OAuth)
                                        </div>
                                        <p className="text-[11px] text-slate-600 leading-relaxed">
                                            คลิกปุ่มด้านล่างเพื่อเข้าสู่ระบบด้วยบัญชี LINE ของคุณ ระบบจะดึง <code>LINE User ID</code> และผูกเข้ากับรหัส <strong>{matchedUser.notification_link_token}</strong> โดยอัตโนมัติ (ไม่ต้องใช้ Webhook)
                                        </p>

                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                            <a
                                                href={`/connect-notification/line/redirect?token=${encodeURIComponent(matchedUser.notification_link_token)}`}
                                                className="w-full sm:w-auto px-4 py-2.5 bg-[#06C755] hover:bg-[#05a847] text-white font-bold rounded-lg shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                                                    <path d="M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                                                </svg>
                                                <span>เข้าสู่ระบบด้วย LINE เพื่อผูกบัญชีอัตโนมัติ</span>
                                            </a>

                                            {botConfig?.line_bot_basic_id && (
                                                <a
                                                    href={`https://line.me/R/ti/p/${encodeURIComponent(botConfig.line_bot_basic_id)}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold rounded-lg transition"
                                                >
                                                    + เพิ่มเพื่อน LINE OA ({botConfig.line_bot_basic_id})
                                                </a>
                                            )}
                                        </div>
                                    </div>

                                    {/* Option B: Direct Form Binding with Token */}
                                    <form onSubmit={handleSaveLine} className="space-y-3 pt-2 border-t border-slate-200">
                                        <div className="font-bold text-slate-800">
                                            วิธีที่ 2: กรอกหรือยืนยันรหัส LINE User ID เข้ากับรหัส {matchedUser.notification_link_token}
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                LINE User ID (ขึ้นต้นด้วย U...) <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={lineForm.data.line_user_id}
                                                onChange={(e) => lineForm.setData('line_user_id', e.target.value)}
                                                placeholder="เช่น U4af4980629..."
                                                className="w-full px-3 py-2 font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#06C755]"
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                ชื่อที่ใช้แสดงใน LINE (Display Name)
                                            </label>
                                            <input
                                                type="text"
                                                value={lineForm.data.line_display_name}
                                                onChange={(e) => lineForm.setData('line_display_name', e.target.value)}
                                                placeholder="เช่น สมชาย (รพ.พิจิตร)"
                                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#06C755]"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={lineForm.processing}
                                            className="w-full py-2.5 bg-[#06C755] hover:bg-[#05a847] text-white font-bold rounded-lg shadow-xs transition cursor-pointer disabled:opacity-50"
                                        >
                                            {lineForm.processing ? 'กำลังบันทึก...' : `💾 บันทึก LINE User ID เข้ากับรหัส ${matchedUser.notification_link_token}`}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

