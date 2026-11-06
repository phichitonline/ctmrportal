import React, { useState, useEffect } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import CtmrLayout from '../../Layouts/CtmrLayout';

export default function Notifications({ userProfile, botConfig }) {
    const { errors } = usePage().props;
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedWebhook, setCopiedWebhook] = useState('');
    const [syncingTelegram, setSyncingTelegram] = useState(false);
    const [testingChannel, setTestingChannel] = useState(null);
    const [regeneratingToken, setRegeneratingToken] = useState(false);
    const [showWebhookGuide, setShowWebhookGuide] = useState(false);

    const prefs = userProfile.notification_preferences || {};

    const { data, setData, put, processing } = useForm({
        phone: userProfile.phone || '',
        email: userProfile.email || '',
        telegram_chat_id: userProfile.telegram_chat_id || '',
        telegram_username: userProfile.telegram_username || '',
        line_user_id: userProfile.line_user_id || '',
        line_display_name: userProfile.line_display_name || '',
        preferences: {
            telegram_enabled: prefs.telegram_enabled ?? true,
            line_enabled: prefs.line_enabled ?? true,
            notify_shift_assigned: prefs.notify_shift_assigned ?? true,
            notify_shift_reminder: prefs.notify_shift_reminder ?? true,
            notify_soc_report: prefs.notify_soc_report ?? true,
            notify_incident_alert: prefs.notify_incident_alert ?? true,
        },
    });

    // Keep form in sync when userProfile updates after sync/unlink
    useEffect(() => {
        const updatedPrefs = userProfile.notification_preferences || {};
        setData({
            phone: userProfile.phone || '',
            email: userProfile.email || '',
            telegram_chat_id: userProfile.telegram_chat_id || '',
            telegram_username: userProfile.telegram_username || '',
            line_user_id: userProfile.line_user_id || '',
            line_display_name: userProfile.line_display_name || '',
            preferences: {
                telegram_enabled: updatedPrefs.telegram_enabled ?? true,
                line_enabled: updatedPrefs.line_enabled ?? true,
                notify_shift_assigned: updatedPrefs.notify_shift_assigned ?? true,
                notify_shift_reminder: updatedPrefs.notify_shift_reminder ?? true,
                notify_soc_report: updatedPrefs.notify_soc_report ?? true,
                notify_incident_alert: updatedPrefs.notify_incident_alert ?? true,
            },
        });
    }, [
        userProfile.telegram_chat_id,
        userProfile.telegram_username,
        userProfile.line_user_id,
        userProfile.line_display_name,
        userProfile.notification_link_token,
    ]);

    const handleCopyToken = () => {
        if (!userProfile.notification_link_token) return;
        navigator.clipboard.writeText(userProfile.notification_link_token);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleCopyText = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopiedWebhook(key);
        setTimeout(() => setCopiedWebhook(''), 2000);
    };

    const handleRegenerateToken = () => {
        setRegeneratingToken(true);
        router.post('/profile/notifications/regenerate-token', {}, {
            preserveScroll: true,
            onFinish: () => setRegeneratingToken(false),
        });
    };

    const handleSyncTelegram = () => {
        setSyncingTelegram(true);
        router.post('/profile/notifications/sync-telegram', {}, {
            preserveScroll: true,
            onFinish: () => setSyncingTelegram(false),
        });
    };

    const handleTestNotification = (channel) => {
        setTestingChannel(channel);
        router.post(`/profile/notifications/test/${channel}`, {}, {
            preserveScroll: true,
            onFinish: () => setTestingChannel(null),
        });
    };

    const handleUnlinkChannel = (channel) => {
        const label = channel === 'telegram' ? 'Telegram' : 'LINE Official Account';
        if (!window.confirm(`คุณต้องการยกเลิกการผูกบัญชี ${label} ออกจากโปรไฟล์ของคุณหรือไม่?`)) {
            return;
        }
        router.delete(`/profile/notifications/unlink/${channel}`, {
            preserveScroll: true,
        });
    };

    const handlePreferenceChange = (key, checked) => {
        setData('preferences', {
            ...data.preferences,
            [key]: checked,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put('/profile/notifications', {
            preserveScroll: true,
        });
    };

    const isTelegramLinked = Boolean(userProfile.telegram_chat_id);
    const isLineLinked = Boolean(userProfile.line_user_id);
    const telegramBotClean = (botConfig?.telegram_bot_username || '').replace(/^@/, '');
    const telegramDeepLink = telegramBotClean
        ? `https://t.me/${telegramBotClean}?start=${userProfile.notification_link_token}`
        : null;

    return (
        <CtmrLayout title="โปรไฟล์ & แจ้งเตือน Telegram / LINE" activeNav="profile-notifications">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* PAGE HEADER */}
                <div className="bg-gradient-to-r from-[#0B2545] via-[#134074] to-[#006BB4] rounded-xl p-5 sm:p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                SOC Alert Channels
                            </span>
                            <span className="text-xs text-sky-200 font-mono">
                                Provider ID: {userProfile.provider_id}
                            </span>
                        </div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                            ตั้งค่าโปรไฟล์และการรับข้อความแจ้งเตือน (Telegram & LINE OA)
                        </h1>
                        <p className="text-xs sm:text-sm text-sky-100/90 max-w-3xl">
                            ลงทะเบียนผูกไอดี Telegram (`Chat ID`) และ LINE Official Account (`LINE User ID`) ประจำตัวของคุณ เพื่อรับแจ้งเตือนตารางเวรเฝ้าระวัง รายงานผล SOC และเหตุภัยคุกคามเร่งด่วนแบบเรียลไทม์
                        </p>
                    </div>

                    {/* Summary Status Pills */}
                    <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
                        <div className={`px-3.5 py-2 rounded-lg border text-xs flex items-center gap-2 ${
                            isTelegramLinked
                                ? 'bg-sky-500/20 border-sky-300/40 text-white'
                                : 'bg-white/10 border-white/15 text-slate-300'
                        }`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${isTelegramLinked ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider opacity-80">Telegram Bot</div>
                                <div className="font-bold">{isTelegramLinked ? 'เชื่อมต่อแล้ว' : 'ยังไม่เชื่อมต่อ'}</div>
                            </div>
                        </div>

                        <div className={`px-3.5 py-2 rounded-lg border text-xs flex items-center gap-2 ${
                            isLineLinked
                                ? 'bg-emerald-500/20 border-emerald-300/40 text-white'
                                : 'bg-white/10 border-white/15 text-slate-300'
                        }`}>
                            <span className={`w-2.5 h-2.5 rounded-full ${isLineLinked ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                            <div>
                                <div className="text-[10px] uppercase tracking-wider opacity-80">LINE OA</div>
                                <div className="font-bold">{isLineLinked ? 'เชื่อมต่อแล้ว' : 'ยังไม่เชื่อมต่อ'}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* USER PROFILE SUMMARY & ONE-TIME LINK TOKEN BANNER */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* User Identity Card */}
                    <div className="bg-white border border-[#D3DAE6] rounded-xl p-5 shadow-2xs flex flex-col justify-between">
                        <div>
                            <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
                                <div className="w-12 h-12 rounded-xl bg-[#006BB4] text-white flex items-center justify-center font-bold text-base shadow-xs uppercase">
                                    {userProfile.provider_id ? userProfile.provider_id.substring(0, 2) : 'U'}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-base font-bold text-slate-800 truncate">{userProfile.name}</h2>
                                    <div className="text-xs text-slate-500 truncate">{userProfile.position || 'เจ้าหน้าที่ศูนย์เฝ้าระวัง SOC'}</div>
                                    <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded text-[10px] font-bold bg-sky-100 text-[#006BB4]">
                                        {userProfile.agency_code} • {userProfile.agency_name}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 space-y-3 text-xs">
                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        เบอร์โทรศัพท์ติดต่อ (สำหรับประสานงานเวร SOC)
                                    </label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="เช่น 081-234-5678"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    />
                                    {errors.phone && <p className="text-rose-600 text-[11px] mt-1">{errors.phone}</p>}
                                </div>

                                <div>
                                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                        อีเมลหน่วยงาน
                                    </label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="name@ppho.go.th"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    />
                                    {errors.email && <p className="text-rose-600 text-[11px] mt-1">{errors.email}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* One-Time Verification Token Card */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-sky-50 via-white to-indigo-50/60 border border-sky-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006BB4] uppercase tracking-wider">
                                    🔑 รหัสยืนยันตัวตนเพื่อผูกบัญชีอัตโนมัติ (One-Time Link Code)
                                </span>
                                <span className="text-[11px] text-slate-500">
                                    ใช้ได้ทั้ง Telegram Bot และ LINE Official Account
                                </span>
                            </div>

                            <p className="text-xs text-slate-600 leading-relaxed">
                                คุณสามารถผูกบัญชีได้ <strong>2 วิธี</strong> คือ: <strong>(1) ส่งรหัสยืนยันด้านล่างไปในแชทของบอท</strong> เพื่อให้ระบบบันทึก ID เข้ากับโปรไฟล์ของคุณโดยอัตโนมัติ หรือ <strong>(2) กรอกรหัส Chat ID / LINE User ID ด้วยตนเอง</strong> ในการ์ดด้านล่าง
                            </p>

                            <div className="mt-3 p-3.5 bg-white border-2 border-dashed border-sky-300 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                                <div className="text-center sm:text-left">
                                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                        รหัสเชื่อมต่อประจำบัญชีของคุณ (ส่งข้อความนี้ในแชทบอท)
                                    </div>
                                    <div className="text-2xl font-mono font-extrabold text-[#006BB4] tracking-widest mt-0.5 select-all">
                                        {userProfile.notification_link_token}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={handleCopyToken}
                                        className="px-3.5 py-2 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                        <span>{copiedCode ? 'คัดลอกรหัสแล้ว!' : 'คัดลอกรหัส'}</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={handleRegenerateToken}
                                        disabled={regeneratingToken}
                                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition cursor-pointer disabled:opacity-50"
                                        title="สร้างรหัสยืนยันใหม่"
                                    >
                                        {regeneratingToken ? 'กำลังสร้าง...' : '🔄 เปลี่ยนรหัสใหม่'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="mt-3 pt-3 border-t border-sky-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                            <span>💡 ทริค: พิมพ์ <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700">/id</code> ในห้องแชท Telegram หรือ LINE OA เพื่อให้บอทตอบกลับรหัส ID ของคุณได้เช่นกัน</span>
                            <button
                                type="button"
                                onClick={() => setShowWebhookGuide(!showWebhookGuide)}
                                className="text-[#006BB4] font-semibold hover:underline cursor-pointer"
                            >
                                {showWebhookGuide ? 'ซ่อนข้อมูลตั้งค่าบอท (Admin)' : '⚙️ ดูคู่มือตั้งค่า Bot Token & Webhook'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* COLLAPSIBLE BOT & WEBHOOK SETUP GUIDE FOR ADMIN */}
                {showWebhookGuide && (
                    <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-700 space-y-4 text-xs">
                        <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                            <div>
                                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                                    <span>🛠️ สำหรับผู้ดูแลระบบ: การตั้งค่าเชื่อมต่อ Telegram Bot และ LINE Messaging API</span>
                                </h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">
                                    กำหนดค่าในไฟล์ <code className="text-amber-300">.env</code> ของเซิร์ฟเวอร์ (หากยังไม่ได้ใส่ Token ระบบจะทำงานในโหมดจำลอง Simulation Mode เพื่อทดสอบหน้าเว็บได้ทันที)
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowWebhookGuide(false)}
                                className="text-slate-400 hover:text-white px-2 py-1"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3.5 space-y-2">
                                <div className="font-bold text-sky-400 flex items-center justify-between">
                                    <span>1. Telegram Bot (@BotFather)</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] ${botConfig?.telegram_configured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                        {botConfig?.telegram_configured ? 'ตั้งค่า Token แล้ว' : 'โหมดจำลอง (ยังไม่ตั้งค่า Token)'}
                                    </span>
                                </div>
                                <pre className="bg-slate-950 p-2.5 rounded text-[11px] font-mono text-sky-200 overflow-x-auto">
{`TELEGRAM_BOT_TOKEN="123456789:AAH..."
TELEGRAM_BOT_USERNAME="PhichitSocBot"`}
                                </pre>
                                <div className="flex items-center justify-between gap-2 bg-slate-950/60 px-2.5 py-1.5 rounded">
                                    <span className="font-mono text-[11px] text-slate-300 truncate">
                                        Webhook: {botConfig?.telegram_webhook_url}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopyText(botConfig?.telegram_webhook_url, 'tg')}
                                        className="text-sky-400 hover:underline shrink-0 cursor-pointer"
                                    >
                                        {copiedWebhook === 'tg' ? 'คัดลอกแล้ว' : 'คัดลอก'}
                                    </button>
                                </div>
                            </div>

                            <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3.5 space-y-2">
                                <div className="font-bold text-emerald-400 flex items-center justify-between">
                                    <span>2. LINE Official Account (Messaging API)</span>
                                    <span className={`px-2 py-0.5 rounded text-[10px] ${botConfig?.line_configured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                        {botConfig?.line_configured ? 'ตั้งค่า Token แล้ว' : 'โหมดจำลอง (ยังไม่ตั้งค่า Token)'}
                                    </span>
                                </div>
                                <pre className="bg-slate-950 p-2.5 rounded text-[11px] font-mono text-emerald-200 overflow-x-auto">
{`LINE_CHANNEL_ACCESS_TOKEN="eyJhbGci..."
LINE_CHANNEL_SECRET="a1b2c3d4..."
LINE_BOT_BASIC_ID="@phichitsoc"`}
                                </pre>
                                <div className="flex items-center justify-between gap-2 bg-slate-950/60 px-2.5 py-1.5 rounded">
                                    <span className="font-mono text-[11px] text-slate-300 truncate">
                                        Webhook: {botConfig?.line_webhook_url}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleCopyText(botConfig?.line_webhook_url, 'line')}
                                        className="text-emerald-400 hover:underline shrink-0 cursor-pointer"
                                    >
                                        {copiedWebhook === 'line' ? 'คัดลอกแล้ว' : 'คัดลอก'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* DUAL-CHANNEL REGISTRATION CARDS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* ==================== TELEGRAM CARD ==================== */}
                        <div className="bg-white border border-[#D3DAE6] rounded-xl shadow-2xs overflow-hidden flex flex-col">
                            {/* Card Header */}
                            <div className="px-5 py-4 bg-gradient-to-r from-sky-600 to-[#0088cc] text-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold">Telegram Bot Notification</h3>
                                        <p className="text-xs text-sky-100">
                                            บอทประจำศูนย์: <span className="font-mono font-semibold">@{telegramBotClean || 'PhichitSocBot'}</span>
                                        </p>
                                    </div>
                                </div>

                                {isTelegramLinked ? (
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-400/25 text-white border border-emerald-300/40 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-300"></span>
                                        เชื่อมต่อแล้ว
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/15 text-sky-100">
                                        ยังไม่เชื่อมต่อ
                                    </span>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                                <div className="space-y-4">
                                    {/* Connection Info Banner */}
                                    {isTelegramLinked ? (
                                        <div className="bg-sky-50 border border-sky-200 rounded-lg p-3.5 flex items-center justify-between gap-3">
                                            <div className="text-xs space-y-0.5">
                                                <div className="font-bold text-sky-900 flex items-center gap-1.5">
                                                    <span>✅ ผูกบัญชี Telegram สำเร็จแล้ว</span>
                                                </div>
                                                <div className="text-slate-600 font-mono text-[11px]">
                                                    Chat ID: <strong className="text-sky-700">{userProfile.telegram_chat_id}</strong>
                                                    {userProfile.telegram_username && (
                                                        <span> • Username: <strong>@{userProfile.telegram_username}</strong></span>
                                                    )}
                                                </div>
                                                {userProfile.telegram_linked_at && (
                                                    <div className="text-[10px] text-slate-400">
                                                        เชื่อมต่อเมื่อ: {userProfile.telegram_linked_at}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleUnlinkChannel('telegram')}
                                                className="px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition cursor-pointer shrink-0"
                                            >
                                                ยกเลิกผูกบัญชี
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 space-y-2">
                                            <div className="font-bold text-slate-800">ขั้นตอนการลงทะเบียน Telegram:</div>
                                            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                                                <li>
                                                    คลิกปุ่มเปิดแชทบอท{' '}
                                                    {telegramDeepLink && (
                                                        <a
                                                            href={telegramDeepLink}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-[#0088cc] font-bold underline"
                                                        >
                                                            @{telegramBotClean}
                                                        </a>
                                                    )}{' '}
                                                    แล้วกด <strong>Start</strong>
                                                </li>
                                                <li>
                                                    ส่งข้อความรหัส <code className="bg-sky-100 text-sky-800 font-mono font-bold px-1.5 py-0.5 rounded">{userProfile.notification_link_token}</code> ในแชทบอท
                                                </li>
                                                <li>
                                                    กดปุ่ม <strong>"🔄 ซิงค์ข้อมูลจาก Telegram Bot"</strong> ด้านล่าง หรือกรอก <code>Chat ID</code> ด้วยตนเอง
                                                </li>
                                            </ol>
                                        </div>
                                    )}

                                    {/* Quick Action Buttons for Telegram */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {telegramDeepLink && (
                                            <a
                                                href={telegramDeepLink}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-3 py-2 bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-2xs"
                                            >
                                                <span>✈️ เปิดแอป Telegram Bot</span>
                                            </a>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleSyncTelegram}
                                            disabled={syncingTelegram}
                                            className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-[#006BB4] border border-sky-200 text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                        >
                                            <span>{syncingTelegram ? '⏳ กำลังตรวจสอบ...' : '🔄 ซิงค์ข้อมูลจาก Telegram Bot'}</span>
                                        </button>

                                        {isTelegramLinked && (
                                            <button
                                                type="button"
                                                onClick={() => handleTestNotification('telegram')}
                                                disabled={testingChannel === 'telegram'}
                                                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ml-auto"
                                            >
                                                <span>{testingChannel === 'telegram' ? 'กำลังส่ง...' : '🔔 ทดสอบส่งข้อความ'}</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Manual Input Fields */}
                                    <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                Telegram Chat ID (ตัวเลข)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.telegram_chat_id}
                                                onChange={(e) => setData('telegram_chat_id', e.target.value)}
                                                placeholder="เช่น 123456789 หรือ -100123456"
                                                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0088cc]"
                                            />
                                            {errors.telegram_chat_id && (
                                                <p className="text-rose-600 text-[11px] mt-1">{errors.telegram_chat_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                Telegram Username (ไม่บังคับ)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.telegram_username}
                                                onChange={(e) => setData('telegram_username', e.target.value)}
                                                placeholder="เช่น somchai_soc (ไม่ต้องใส่ @)"
                                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0088cc]"
                                            />
                                            {errors.telegram_username && (
                                                <p className="text-rose-600 text-[11px] mt-1">{errors.telegram_username}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Channel Toggle */}
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-700">เปิดรับการแจ้งเตือนผ่านช่องทาง Telegram</span>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.preferences.telegram_enabled}
                                            onChange={(e) => handlePreferenceChange('telegram_enabled', e.target.checked)}
                                            className="w-4 h-4 text-[#0088cc] rounded border-slate-300 focus:ring-[#0088cc]"
                                        />
                                        <span className="ml-2 text-xs font-semibold text-slate-700">
                                            {data.preferences.telegram_enabled ? 'เปิดใช้งาน' : 'ปิดชั่วคราว'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* ==================== LINE OA CARD ==================== */}
                        <div className="bg-white border border-[#D3DAE6] rounded-xl shadow-2xs overflow-hidden flex flex-col">
                            {/* Card Header */}
                            <div className="px-5 py-4 bg-gradient-to-r from-[#06C755] to-[#05a847] text-white flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center">
                                        <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold">LINE Official Account (LINE OA)</h3>
                                        <p className="text-xs text-emerald-50">
                                            LINE OA ID: <span className="font-mono font-semibold">{botConfig?.line_bot_basic_id || '@phichitsoc'}</span>
                                        </p>
                                    </div>
                                </div>

                                {isLineLinked ? (
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-white/25 text-white border border-white/40 flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-white"></span>
                                        เชื่อมต่อแล้ว
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-white/15 text-emerald-50">
                                        ยังไม่เชื่อมต่อ
                                    </span>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                                <div className="space-y-4">
                                    {/* Connection Status Banner */}
                                    {isLineLinked ? (
                                        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-center justify-between gap-3">
                                            <div className="text-xs space-y-0.5 min-w-0">
                                                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                                                    <span>✅ ผูกบัญชี LINE Official Account สำเร็จแล้ว</span>
                                                </div>
                                                <div className="text-slate-600 font-mono text-[11px] truncate">
                                                    LINE User ID: <strong className="text-emerald-700">{userProfile.line_user_id}</strong>
                                                </div>
                                                {userProfile.line_display_name && (
                                                    <div className="text-[11px] text-slate-600">
                                                        ชื่อโปรไฟล์ LINE: <strong>{userProfile.line_display_name}</strong>
                                                    </div>
                                                )}
                                                {userProfile.line_linked_at && (
                                                    <div className="text-[10px] text-slate-400">
                                                        เชื่อมต่อเมื่อ: {userProfile.line_linked_at}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleUnlinkChannel('line')}
                                                className="px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition cursor-pointer shrink-0"
                                            >
                                                ยกเลิกผูกบัญชี
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 space-y-2">
                                            <div className="font-bold text-slate-800">ขั้นตอนการลงทะเบียน LINE OA:</div>
                                            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                                                <li>
                                                    เพิ่มเพื่อน LINE Official Account <strong className="text-emerald-700 font-mono">{botConfig?.line_bot_basic_id || '@phichitsoc'}</strong>
                                                </li>
                                                <li>
                                                    พิมพ์รหัสยืนยัน <code className="bg-emerald-100 text-emerald-800 font-mono font-bold px-1.5 py-0.5 rounded">{userProfile.notification_link_token}</code> ส่งเข้าไปในแชท LINE OA
                                                </li>
                                                <li>
                                                    ระบบจะบันทึก <code>LINE User ID</code> ให้โดยอัตโนมัติ (หรือพิมพ์ <code>/id</code> ในแชท LINE เพื่อนำรหัส <code>U...</code> มากรอกด้านล่าง)
                                                </li>
                                            </ol>
                                        </div>
                                    )}

                                    {/* Quick Action Buttons for LINE */}
                                    <div className="flex flex-wrap items-center gap-2">
                                        {botConfig?.line_bot_basic_id && (
                                            <a
                                                href={`https://line.me/R/ti/p/${encodeURIComponent(botConfig.line_bot_basic_id)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="px-3 py-2 bg-[#06C755] hover:bg-[#05a847] text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-2xs"
                                            >
                                                <span>💬 เพิ่มเพื่อน LINE OA</span>
                                            </a>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => router.reload({ preserveScroll: true })}
                                            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1.5"
                                        >
                                            <span>🔄 รีเฟรชสถานะการเชื่อมต่อ</span>
                                        </button>

                                        {isLineLinked && (
                                            <button
                                                type="button"
                                                onClick={() => handleTestNotification('line')}
                                                disabled={testingChannel === 'line'}
                                                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5 ml-auto"
                                            >
                                                <span>{testingChannel === 'line' ? 'กำลังส่ง...' : '🔔 ทดสอบส่งข้อความ LINE'}</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Manual Input Fields */}
                                    <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                LINE User ID (ขึ้นต้นด้วย U...)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.line_user_id}
                                                onChange={(e) => setData('line_user_id', e.target.value)}
                                                placeholder="เช่น U4af4980629..."
                                                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#06C755]"
                                            />
                                            {errors.line_user_id && (
                                                <p className="text-rose-600 text-[11px] mt-1">{errors.line_user_id}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                ชื่อที่ใช้แสดงใน LINE (ไม่บังคับ)
                                            </label>
                                            <input
                                                type="text"
                                                value={data.line_display_name}
                                                onChange={(e) => setData('line_display_name', e.target.value)}
                                                placeholder="เช่น สมชาย (รพ.พิจิตร)"
                                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#06C755]"
                                            />
                                            {errors.line_display_name && (
                                                <p className="text-rose-600 text-[11px] mt-1">{errors.line_display_name}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Channel Toggle */}
                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-xs font-medium text-slate-700">เปิดรับการแจ้งเตือนผ่านช่องทาง LINE OA</span>
                                    <label className="inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.preferences.line_enabled}
                                            onChange={(e) => handlePreferenceChange('line_enabled', e.target.checked)}
                                            className="w-4 h-4 text-[#06C755] rounded border-slate-300 focus:ring-[#06C755]"
                                        />
                                        <span className="ml-2 text-xs font-semibold text-slate-700">
                                            {data.preferences.line_enabled ? 'เปิดใช้งาน' : 'ปิดชั่วคราว'}
                                        </span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* NOTIFICATION EVENT PREFERENCES */}
                    <div className="bg-white border border-[#D3DAE6] rounded-xl p-5 shadow-2xs space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h3 className="text-base font-bold text-slate-800">
                                ประเภทเหตุการณ์ที่ต้องการรับแจ้งเตือน (Notification Preferences)
                            </h3>
                            <p className="text-xs text-slate-500">
                                เลือกประเภทข้อความที่คุณต้องการให้ระบบส่งไปยัง Telegram และ LINE OA ที่ผูกไว้กับโปรไฟล์ของคุณ
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.preferences.notify_shift_assigned}
                                    onChange={(e) => handlePreferenceChange('notify_shift_assigned', e.target.checked)}
                                    className="mt-0.5 w-4 h-4 text-[#006BB4] rounded border-slate-300 focus:ring-[#006BB4]"
                                />
                                <div className="text-xs">
                                    <div className="font-bold text-slate-800">📅 แจ้งเตือนเมื่อได้รับมอบหมายเวรเฝ้าระวัง SOC</div>
                                    <div className="text-slate-500 mt-0.5">
                                        รับข้อความทันทีเมื่อผู้ดูแลระบบจัดตารางเวรหรืออัปเดตวันเข้าเวรของคุณ (ทั้งเวรหลักและเวรสำรอง)
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.preferences.notify_shift_reminder}
                                    onChange={(e) => handlePreferenceChange('notify_shift_reminder', e.target.checked)}
                                    className="mt-0.5 w-4 h-4 text-[#006BB4] rounded border-slate-300 focus:ring-[#006BB4]"
                                />
                                <div className="text-xs">
                                    <div className="font-bold text-slate-800">⏰ แจ้งเตือนย้ำก่อนเริ่มกะเข้าเวรเฝ้าระวัง</div>
                                    <div className="text-slate-500 mt-0.5">
                                        รับข้อความเตือนความจำในวันที่คุณมีรายชื่อปฏิบัติหน้าที่เฝ้าระวังศูนย์ SOC ประจำวัน
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.preferences.notify_soc_report}
                                    onChange={(e) => handlePreferenceChange('notify_soc_report', e.target.checked)}
                                    className="mt-0.5 w-4 h-4 text-[#006BB4] rounded border-slate-300 focus:ring-[#006BB4]"
                                />
                                <div className="text-xs">
                                    <div className="font-bold text-slate-800">📋 แจ้งเตือนเมื่อมีการส่งรายงานผลเฝ้าระวังเวร (SOC Shift Report)</div>
                                    <div className="text-slate-500 mt-0.5">
                                        รับสรุปรายงานผลการเฝ้าระวังและบันทึกส่งมอบเวร (Handover Notes) เมื่อเจ้าหน้าที่ส่งรายงาน
                                    </div>
                                </div>
                            </label>

                            <label className="flex items-start gap-3 p-3.5 rounded-lg border border-rose-200 bg-rose-50/30 hover:bg-rose-50/60 transition cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={data.preferences.notify_incident_alert}
                                    onChange={(e) => handlePreferenceChange('notify_incident_alert', e.target.checked)}
                                    className="mt-0.5 w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                                />
                                <div className="text-xs">
                                    <div className="font-bold text-rose-800">🚨 แจ้งเตือนเหตุการณ์ความมั่นคงปลอดภัยระดับสูง / วิกฤต (Critical Incident)</div>
                                    <div className="text-slate-600 mt-0.5">
                                        รับข้อความด่วนเมื่อมีรายงานเหตุผิดปกติระดับ High หรือ Critical ในระบบเครือข่ายโรงพยาบาล
                                    </div>
                                </div>
                            </label>
                        </div>

                        {/* Submit Footer */}
                        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                            <span className="text-xs text-slate-500">
                                * การกดปุ่มบันทึกจะจัดเก็บทั้งข้อมูลติดต่อ, รหัส Telegram Chat ID, LINE User ID และการตั้งค่าการแจ้งเตือนไว้ในโปรไฟล์ของคุณ
                            </span>

                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full sm:w-auto px-6 py-2.5 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-bold rounded-lg shadow-sm transition cursor-pointer disabled:opacity-50"
                            >
                                {processing ? 'กำลังบันทึกข้อมูล...' : '💾 บันทึกการตั้งค่าโปรไฟล์และแจ้งเตือน'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </CtmrLayout>
    );
}

