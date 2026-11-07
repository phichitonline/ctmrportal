import React, { useState, useEffect, useRef } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import CtmrLayout from '../../Layouts/CtmrLayout';

export default function Notifications({
    initialTab = 'all',
    userProfile,
    agencies = [],
    activitySummary = {},
    botConfig = {},
}) {
    const { errors } = usePage().props;
    const [activeTab, setActiveTab] = useState(initialTab || 'all');
    const [copiedCode, setCopiedCode] = useState(false);
    const [copiedWebhook, setCopiedWebhook] = useState('');
    const [syncingTelegram, setSyncingTelegram] = useState(false);
    const [testingChannel, setTestingChannel] = useState(null);
    const [regeneratingToken, setRegeneratingToken] = useState(false);
    const [showWebhookGuide, setShowWebhookGuide] = useState(false);
    const telegramWidgetRef = useRef(null);

    const prefs = userProfile.notification_preferences || {};

    // Main Profile & Notification Form
    const { data, setData, put, processing } = useForm({
        name: userProfile.name || '',
        position: userProfile.position || '',
        agency_code: userProfile.agency_code || '001',
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

    // Password Update Form
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    // Keep form in sync when userProfile updates after sync/unlink/save
    useEffect(() => {
        const updatedPrefs = userProfile.notification_preferences || {};
        setData({
            name: userProfile.name || '',
            position: userProfile.position || '',
            agency_code: userProfile.agency_code || '001',
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
        userProfile.name,
        userProfile.position,
        userProfile.agency_code,
        userProfile.phone,
        userProfile.email,
        userProfile.telegram_chat_id,
        userProfile.telegram_username,
        userProfile.line_user_id,
        userProfile.line_display_name,
        userProfile.notification_link_token,
    ]);

    useEffect(() => {
        if (initialTab) {
            setActiveTab(initialTab);
        }
    }, [initialTab]);

    const handleCopyToken = () => {
        if (!userProfile.notification_link_token) return;
        navigator.clipboard.writeText(userProfile.notification_link_token);
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
    };

    const handleCopyText = (text, key) => {
        if (!text) return;
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

    const handleSubmitProfile = (e) => {
        e.preventDefault();
        put('/profile', {
            preserveScroll: true,
        });
    };

    const handleSubmitPassword = (e) => {
        e.preventDefault();
        passwordForm.put('/profile/password', {
            preserveScroll: true,
            onSuccess: () => passwordForm.reset(),
        });
    };

    const isTelegramLinked = Boolean(userProfile.telegram_chat_id);
    const isLineLinked = Boolean(userProfile.line_user_id);
    const isMophLinked = Boolean(userProfile.moph_id || userProfile.pid);
    const telegramBotClean = (botConfig?.telegram_bot_username || '').replace(/^@/, '');
    const telegramDeepLink = telegramBotClean
        ? `https://t.me/${telegramBotClean}?start=${userProfile.notification_link_token}`
        : null;

    const showPersonalSection = activeTab === 'all' || activeTab === 'personal';
    const showConnectionsSection = activeTab === 'all' || activeTab === 'connections';
    const showSecuritySection = activeTab === 'all' || activeTab === 'security';
    const showActivitySection = activeTab === 'all' || activeTab === 'activity';

    // Mount Official Telegram Login Widget inside Profile page (only when not linked yet and connections section is visible)
    useEffect(() => {
        if (
            !showConnectionsSection ||
            isTelegramLinked ||
            !telegramWidgetRef.current ||
            !telegramBotClean ||
            !userProfile.notification_link_token
        ) {
            return;
        }

        telegramWidgetRef.current.innerHTML = '';
        const script = document.createElement('script');
        script.src = 'https://telegram.org/js/telegram-widget.js?22';
        script.async = true;
        script.setAttribute('data-telegram-login', telegramBotClean);
        script.setAttribute('data-size', 'large');
        script.setAttribute('data-radius', '8');
        script.setAttribute(
            'data-auth-url',
            `${botConfig.telegram_callback_url}?token=${encodeURIComponent(userProfile.notification_link_token)}&from=profile`
        );
        script.setAttribute('data-request-access', 'write');
        telegramWidgetRef.current.appendChild(script);
    }, [
        showConnectionsSection,
        isTelegramLinked,
        telegramBotClean,
        userProfile.notification_link_token,
        botConfig?.telegram_callback_url,
    ]);

    return (
        <CtmrLayout title="โปรไฟล์ส่วนตัว & การเชื่อมต่อบัญชี" activeNav="profile-notifications">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* ==================== HERO PROFILE HEADER ==================== */}
                <div className="bg-gradient-to-r from-[#0B2545] via-[#134074] to-[#006BB4] rounded-xl p-5 sm:p-6 text-white shadow-md">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                        <div className="flex items-start sm:items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-xs text-white flex items-center justify-center font-extrabold text-2xl shadow-inner shrink-0 uppercase">
                                {userProfile.provider_id ? userProfile.provider_id.substring(0, 2) : 'U'}
                            </div>
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                                        {userProfile.name}
                                    </h1>
                                    {userProfile.is_admin ? (
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/20 text-amber-200 border border-amber-300/30">
                                            Super Administrator
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-300/30">
                                            เจ้าหน้าที่ศูนย์เฝ้าระวัง (Hospital Staff)
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs sm:text-sm text-sky-100/90">
                                    {userProfile.position || 'เจ้าหน้าที่ศูนย์ปฏิบัติการความมั่นคงปลอดภัยไซเบอร์ (SOC)'} •{' '}
                                    <span className="font-semibold text-white">
                                        สังกัด {userProfile.agency_code} ({userProfile.agency_name})
                                    </span>
                                </p>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-sky-200/90 pt-0.5">
                                    <span className="font-mono">
                                        Provider ID: <strong className="text-white">{userProfile.provider_id}</strong>
                                    </span>
                                    <span>•</span>
                                    <span className="font-mono">
                                        รหัสเชื่อมต่อบัญชี: <strong className="text-amber-300">{userProfile.notification_link_token}</strong>
                                    </span>
                                    {userProfile.last_login_at && (
                                        <>
                                            <span>•</span>
                                            <span>เข้าใช้งานล่าสุด: {userProfile.last_login_at}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Connection Status Badges */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 shrink-0">
                            <div className={`px-3 py-2 rounded-lg border text-xs flex items-center gap-2 ${
                                isTelegramLinked
                                    ? 'bg-sky-500/25 border-sky-300/40 text-white'
                                    : 'bg-white/10 border-white/15 text-slate-300'
                            }`}>
                                <span className={`w-2 h-2 rounded-full shrink-0 ${isTelegramLinked ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                                <div className="min-w-0">
                                    <div className="text-[10px] uppercase tracking-wider opacity-80">Telegram</div>
                                    <div className="font-bold truncate">{isTelegramLinked ? 'เชื่อมต่อแล้ว' : 'ยังไม่เชื่อมต่อ'}</div>
                                </div>
                            </div>

                            <div className={`px-3 py-2 rounded-lg border text-xs flex items-center gap-2 ${
                                isLineLinked
                                    ? 'bg-emerald-500/25 border-emerald-300/40 text-white'
                                    : 'bg-white/10 border-white/15 text-slate-300'
                            }`}>
                                <span className={`w-2 h-2 rounded-full shrink-0 ${isLineLinked ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                                <div className="min-w-0">
                                    <div className="text-[10px] uppercase tracking-wider opacity-80">LINE OA</div>
                                    <div className="font-bold truncate">{isLineLinked ? 'เชื่อมต่อแล้ว' : 'ยังไม่เชื่อมต่อ'}</div>
                                </div>
                            </div>

                            <div className={`px-3 py-2 rounded-lg border text-xs flex items-center gap-2 ${
                                userProfile.has_2fa
                                    ? 'bg-indigo-500/25 border-indigo-300/40 text-white'
                                    : 'bg-white/10 border-white/15 text-slate-300'
                            }`}>
                                <span className={`w-2 h-2 rounded-full shrink-0 ${userProfile.has_2fa ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                                <div className="min-w-0">
                                    <div className="text-[10px] uppercase tracking-wider opacity-80">2FA OTP</div>
                                    <div className="font-bold truncate">{userProfile.has_2fa ? 'เปิดใช้งาน' : 'ยังไม่เปิด'}</div>
                                </div>
                            </div>

                            <div className={`px-3 py-2 rounded-lg border text-xs flex items-center gap-2 ${
                                isMophLinked
                                    ? 'bg-teal-500/25 border-teal-300/40 text-white'
                                    : 'bg-white/10 border-white/15 text-slate-300'
                            }`}>
                                <span className={`w-2 h-2 rounded-full shrink-0 ${isMophLinked ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                                <div className="min-w-0">
                                    <div className="text-[10px] uppercase tracking-wider opacity-80">MOPH ID</div>
                                    <div className="font-bold truncate">{isMophLinked ? 'เชื่อมโยงแล้ว' : 'บัญชีภายใน'}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="mt-5 pt-4 border-t border-white/15 flex flex-wrap items-center gap-1.5">
                        {[
                            { id: 'all', label: '📋 ภาพรวมทั้งหมด (All-in-One)' },
                            { id: 'personal', label: '👤 ข้อมูลส่วนตัว & สังกัด' },
                            { id: 'connections', label: '🔗 การเชื่อมต่อ (Telegram / LINE / SSO)' },
                            { id: 'security', label: '🔐 รหัสผ่าน & ความปลอดภัย 2FA' },
                            { id: 'activity', label: '📅 ตารางเวร & งาน SOC ของฉัน' },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                    activeTab === tab.id
                                        ? 'bg-white text-[#0B2545] shadow-xs font-bold'
                                        : 'text-sky-100 hover:bg-white/10'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ==================== MAIN PROFILE & CONNECTIONS FORM ==================== */}
                <form onSubmit={handleSubmitProfile} className="space-y-6">
                    {/* 1. PERSONAL INFORMATION & AGENCY SECTION */}
                    {showPersonalSection && (
                        <div className="bg-white border border-[#D3DAE6] rounded-xl shadow-2xs overflow-hidden">
                            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div>
                                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                        <span>👤 ข้อมูลส่วนตัวและหน่วยงานสังกัด (Personal & Agency Information)</span>
                                    </h2>
                                    <p className="text-xs text-slate-500">
                                        อัปเดตชื่อ-นามสกุล ตำแหน่ง หน่วยงานสังกัด เบอร์โทรศัพท์ และอีเมลสำหรับใช้ในการจัดตารางเวรและติดต่อประสานงาน SOC
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-bold rounded-lg shadow-2xs transition cursor-pointer disabled:opacity-50 shrink-0"
                                >
                                    {processing ? 'กำลังบันทึก...' : '💾 บันทึกข้อมูลส่วนตัว'}
                                </button>
                            </div>

                            <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Editable Fields (2 Columns) */}
                                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            ชื่อ - นามสกุล (Full Name) <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="ระบุชื่อ-นามสกุล"
                                            required
                                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]"
                                        />
                                        {errors.name && <p className="text-rose-600 text-[11px] mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            ตำแหน่งงาน (Position / Role Title)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.position}
                                            onChange={(e) => setData('position', e.target.value)}
                                            placeholder="เช่น นักวิชาการคอมพิวเตอร์ปฏิบัติการ"
                                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]"
                                        />
                                        {errors.position && <p className="text-rose-600 text-[11px] mt-1">{errors.position}</p>}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            หน่วยงาน / โรงพยาบาลสังกัด (Hospital / Agency)
                                        </label>
                                        <select
                                            value={data.agency_code}
                                            onChange={(e) => setData('agency_code', e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]"
                                        >
                                            {agencies.map((ag) => (
                                                <option key={ag.code || ag.hospcode} value={ag.code || ag.hospcode}>
                                                    [{ag.code || ag.hospcode}] {ag.name} {ag.type ? `(${ag.type})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.agency_code && <p className="text-rose-600 text-[11px] mt-1">{errors.agency_code}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            เบอร์โทรศัพท์ติดต่อ (สำหรับประสานงานเวร SOC)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="เช่น 081-234-5678"
                                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]"
                                        />
                                        {errors.phone && <p className="text-rose-600 text-[11px] mt-1">{errors.phone}</p>}
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            อีเมลหน่วยงาน (Official Email)
                                        </label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="name@ppho.go.th"
                                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]"
                                        />
                                        {errors.email && <p className="text-rose-600 text-[11px] mt-1">{errors.email}</p>}
                                    </div>
                                </div>

                                {/* Read-Only Account Identity Metadata */}
                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs flex flex-col justify-between">
                                    <div className="space-y-2.5">
                                        <div className="font-bold text-slate-800 border-b border-slate-200 pb-2 flex items-center justify-between">
                                            <span>🪪 ข้อมูลอ้างอิงระบบ (System Identity)</span>
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                                Active
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                                            <span className="text-slate-500">รหัสผู้ใช้งาน (Provider ID):</span>
                                            <span className="font-mono font-bold text-[#006BB4]">{userProfile.provider_id}</span>
                                        </div>

                                        <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                                            <span className="text-slate-500">MOPH Provider ID:</span>
                                            <span className="font-mono font-semibold text-slate-700">
                                                {userProfile.moph_id || 'บัญชีภายในระบบ'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                                            <span className="text-slate-500">สิทธิ์การใช้งาน (Role):</span>
                                            <span className="font-semibold text-slate-800">
                                                {userProfile.role === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'เจ้าหน้าที่โรงพยาบาล'}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between py-1 border-b border-slate-200/60">
                                            <span className="text-slate-500">วันที่สร้างบัญชี:</span>
                                            <span className="text-slate-700">{userProfile.created_at || '-'}</span>
                                        </div>
                                    </div>

                                    <div className="pt-2 text-[11px] text-slate-500">
                                        ข้อมูลชื่อ-นามสกุล ตำแหน่ง และเบอร์โทรศัพท์จะถูกนำไปแสดงในตารางเวรเฝ้าระวัง SOC อัตโนมัติ
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 2. ACCOUNT CONNECTIONS & MESSAGING CHANNELS SECTION */}
                    {showConnectionsSection && (
                        <>
                            {/* Account Link Token Banner */}
                            <div className="bg-gradient-to-br from-sky-50 via-white to-indigo-50/60 border border-sky-200 rounded-xl p-5 shadow-2xs">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="space-y-1.5">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#006BB4] uppercase tracking-wider">
                                                🔑 รหัสเชื่อมต่อประจำบัญชี & หน้าเพจ Login ยืนยันตัวตน (ไม่ต้องใช้ Webhook)
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                                            ใช้รหัสประจำบัญชีด้านขวา (<code className="font-mono font-bold text-[#006BB4]">{userProfile.notification_link_token}</code>) สำหรับผูกบัญชี <strong>Telegram</strong> และ <strong>LINE Official Account</strong> เข้ากับโปรไฟล์ของคุณ หรือส่งลิงก์ไปเปิดบนสมาร์ทโฟนเพื่อกดปุ่ม Login ได้ทันที
                                        </p>
                                    </div>

                                    <div className="p-3 bg-white border-2 border-dashed border-sky-300 rounded-xl flex flex-col sm:flex-row items-center gap-3 shrink-0">
                                        <div className="text-center sm:text-left px-2">
                                            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                                Account Link Code
                                            </div>
                                            <div className="text-2xl font-mono font-extrabold text-[#006BB4] tracking-widest select-all">
                                                {userProfile.notification_link_token}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center justify-center gap-2">
                                            <Link
                                                href={`/connect-notification?token=${userProfile.notification_link_token}`}
                                                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-2xs transition flex items-center gap-1.5"
                                            >
                                                <span>🔗 เปิดหน้าเพจ Login เชื่อมต่อบัญชี</span>
                                            </Link>

                                            <button
                                                type="button"
                                                onClick={handleCopyToken}
                                                className="px-3 py-2 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer"
                                            >
                                                {copiedCode ? '✓ คัดลอกแล้ว' : '📋 คัดลอกรหัส'}
                                            </button>

                                            <button
                                                type="button"
                                                onClick={handleRegenerateToken}
                                                disabled={regeneratingToken}
                                                className="px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition cursor-pointer disabled:opacity-50"
                                                title="สร้างรหัสยืนยันใหม่"
                                            >
                                                {regeneratingToken ? '...' : '🔄 สุ่มรหัสใหม่'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-3 pt-3 border-t border-sky-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                                    <div className="flex items-center gap-2 truncate">
                                        <span>📱 ลิงก์ลงทะเบียนสำหรับเปิดบนมือถือ:</span>
                                        <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-700 truncate">
                                            {botConfig?.connect_page_url}
                                        </code>
                                        <button
                                            type="button"
                                            onClick={() => handleCopyText(botConfig?.connect_page_url, 'connect_url')}
                                            className="text-[#006BB4] font-semibold hover:underline cursor-pointer shrink-0"
                                        >
                                            {copiedWebhook === 'connect_url' ? 'คัดลอกลิงก์แล้ว!' : 'คัดลอกลิงก์'}
                                        </button>
                                    </div>
                                    {userProfile.is_admin && (
                                        <button
                                            type="button"
                                            onClick={() => setShowWebhookGuide(!showWebhookGuide)}
                                            className="text-[#006BB4] font-semibold hover:underline cursor-pointer"
                                        >
                                            {showWebhookGuide ? 'ซ่อนข้อมูลตั้งค่า .env (Admin)' : '⚙️ ดูคู่มือตั้งค่า Telegram & LINE Login (.env)'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Collapsible Admin Guide */}
                            {showWebhookGuide && (
                                <div className="bg-slate-900 text-slate-100 rounded-xl p-5 border border-slate-700 space-y-4 text-xs">
                                    <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                                        <div>
                                            <h3 className="text-sm font-bold text-white">
                                                🛠️ สำหรับผู้ดูแลระบบ: การตั้งค่า Telegram Login / Bot และ LINE Login / Messaging API
                                            </h3>
                                            <p className="text-[11px] text-slate-400 mt-0.5">
                                                กำหนดค่าในไฟล์ <code className="text-amber-300">.env</code> ของเซิร์ฟเวอร์
                                            </p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowWebhookGuide(false)}
                                            className="text-slate-400 hover:text-white px-2 py-1 cursor-pointer"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3.5 space-y-2">
                                            <div className="font-bold text-sky-400 flex items-center justify-between">
                                                <span>1. Telegram Bot & Login Widget (@BotFather)</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] ${botConfig?.telegram_configured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                                    {botConfig?.telegram_configured ? 'ตั้งค่า Token แล้ว' : 'โหมดจำลอง'}
                                                </span>
                                            </div>
                                            <pre className="bg-slate-950 p-2.5 rounded text-[11px] font-mono text-sky-200 overflow-x-auto">
{`TELEGRAM_BOT_TOKEN="123456789:AAH..."
TELEGRAM_BOT_USERNAME="${telegramBotClean}"`}
                                            </pre>
                                        </div>

                                        <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-3.5 space-y-2">
                                            <div className="font-bold text-emerald-400 flex items-center justify-between">
                                                <span>2. LINE Login & LINE OA Push API</span>
                                                <span className={`px-2 py-0.5 rounded text-[10px] ${botConfig?.line_configured ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'}`}>
                                                    {botConfig?.line_configured ? 'ตั้งค่า Token แล้ว' : 'โหมดจำลอง'}
                                                </span>
                                            </div>
                                            <pre className="bg-slate-950 p-2.5 rounded text-[11px] font-mono text-emerald-200 overflow-x-auto">
{`LINE_LOGIN_CHANNEL_ID="1654..."
LINE_LOGIN_CHANNEL_SECRET="..."
LINE_CHANNEL_ACCESS_TOKEN="..."
LINE_BOT_BASIC_ID="${botConfig?.line_bot_basic_id || '@phichitsoc'}"`}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* DUAL-CHANNEL REGISTRATION CARDS (TELEGRAM & LINE OA) */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* ==================== TELEGRAM CARD ==================== */}
                                <div className="bg-white border border-[#D3DAE6] rounded-xl shadow-2xs overflow-hidden flex flex-col">
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

                                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            {isTelegramLinked ? (
                                                <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="text-xs space-y-1">
                                                        <div className="font-bold text-sky-900 flex items-center gap-1.5 text-sm">
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
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleTestNotification('telegram')}
                                                            disabled={testingChannel === 'telegram'}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-md transition cursor-pointer disabled:opacity-50"
                                                        >
                                                            {testingChannel === 'telegram' ? 'กำลังส่ง...' : '🔔 ทดสอบส่งข้อความ'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUnlinkChannel('telegram')}
                                                            className="px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition cursor-pointer"
                                                        >
                                                            ยกเลิกผูกบัญชี
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 space-y-2">
                                                        <div className="font-bold text-slate-800">ขั้นตอนการลงทะเบียน Telegram:</div>
                                                        <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                                                            <li>
                                                                กดปุ่ม <strong>Telegram Login</strong> ด้านล่าง หรือคลิกปุ่มเปิดแชทบอท{' '}
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
                                                                กดปุ่ม <strong>"🔄 ดึงรหัส Chat ID จากบอทอัตโนมัติ"</strong> ด้านล่าง หรือกรอก <code>Chat ID</code> ด้วยตนเอง
                                                            </li>
                                                        </ol>
                                                    </div>

                                                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                                                        <div className="text-xs font-bold text-slate-800">
                                                            ล็อกอินผ่านปุ่ม Telegram Login หรือผ่านแชทบอท (อ้างอิงรหัส {userProfile.notification_link_token})
                                                        </div>

                                                        <div ref={telegramWidgetRef} className="min-h-[40px] flex items-center" />

                                                        <div className="flex flex-wrap items-center gap-2 pt-1">
                                                            {telegramDeepLink && (
                                                                <a
                                                                    href={telegramDeepLink}
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                    className="px-3 py-2 bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-semibold rounded-lg transition flex items-center gap-1.5 shadow-2xs"
                                                                >
                                                                    <span>1. ✈️ เปิดบอท @{telegramBotClean}</span>
                                                                </a>
                                                            )}

                                                            <button
                                                                type="button"
                                                                onClick={handleSyncTelegram}
                                                                disabled={syncingTelegram}
                                                                className="px-3 py-2 bg-sky-50 hover:bg-sky-100 text-[#006BB4] border border-sky-200 text-xs font-semibold rounded-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                                                            >
                                                                <span>{syncingTelegram ? '⏳ กำลังตรวจสอบ...' : '2. 🔄 ดึงรหัส Chat ID จากบอทอัตโนมัติ'}</span>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                                                Telegram Chat ID (ตัวเลข)
                                                            </label>
                                                            <input
                                                                type="text"
                                                                value={data.telegram_chat_id}
                                                                onChange={(e) => setData('telegram_chat_id', e.target.value)}
                                                                placeholder="เช่น 123456789"
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
                                                                placeholder="เช่น somchai_soc"
                                                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#0088cc]"
                                                            />
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

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

                                    <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                                        <div className="space-y-4">
                                            {isLineLinked ? (
                                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="text-xs space-y-1 min-w-0">
                                                        <div className="font-bold text-emerald-900 flex items-center gap-1.5 text-sm">
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
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleTestNotification('line')}
                                                            disabled={testingChannel === 'line'}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-md transition cursor-pointer disabled:opacity-50"
                                                        >
                                                            {testingChannel === 'line' ? 'กำลังส่ง...' : '🔔 ทดสอบส่งข้อความ LINE'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleUnlinkChannel('line')}
                                                            className="px-2.5 py-1.5 text-[11px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-md transition cursor-pointer"
                                                        >
                                                            ยกเลิกผูกบัญชี
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 text-xs text-slate-600 space-y-2">
                                                        <div className="font-bold text-slate-800">ขั้นตอนการลงทะเบียน LINE OA (ผ่านหน้าเพจ Login):</div>
                                                        <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed">
                                                            <li>
                                                                คลิกปุ่ม <strong>"เข้าสู่ระบบด้วย LINE (LINE Login)"</strong> ด้านล่าง หรือเปิดผ่าน <strong>หน้าเพจ Login เชื่อมต่อบัญชี</strong> ด้วยรหัส <code className="bg-emerald-100 text-emerald-800 font-mono font-bold px-1.5 py-0.5 rounded">{userProfile.notification_link_token}</code>
                                                            </li>
                                                            <li>
                                                                เพิ่มเพื่อน LINE OA <strong className="text-emerald-700 font-mono">{botConfig?.line_bot_basic_id || '@phichitsoc'}</strong> เพื่อรับข้อความแจ้งเตือน
                                                            </li>
                                                            <li>
                                                                ระบบจะดึงและบันทึก <code>LINE User ID</code> เข้ากับรหัสประจำบัญชีของคุณโดยอัตโนมัติ
                                                            </li>
                                                        </ol>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2">
                                                        <a
                                                            href={`/connect-notification/line/redirect?token=${encodeURIComponent(userProfile.notification_link_token)}`}
                                                            className="px-3 py-2 bg-[#06C755] hover:bg-[#05a847] text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-2xs"
                                                        >
                                                            <span>🟢 เข้าสู่ระบบด้วย LINE (ผูก ID อัตโนมัติ)</span>
                                                        </a>

                                                        <Link
                                                            href={`/connect-notification?token=${userProfile.notification_link_token}`}
                                                            className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-lg transition flex items-center gap-1.5"
                                                        >
                                                            <span>🔗 หน้าเพจ Login ด้วยรหัส {userProfile.notification_link_token}</span>
                                                        </Link>
                                                    </div>

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
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>

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
                                <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <div>
                                        <h3 className="text-base font-bold text-slate-800">
                                            🔔 ประเภทเหตุการณ์ที่ต้องการรับแจ้งเตือน (Notification Preferences)
                                        </h3>
                                        <p className="text-xs text-slate-500">
                                            เลือกประเภทข้อความที่คุณต้องการให้ระบบส่งไปยัง Telegram และ LINE OA ที่ผูกไว้กับโปรไฟล์ของคุณ
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-bold rounded-lg shadow-2xs transition cursor-pointer disabled:opacity-50 shrink-0"
                                    >
                                        {processing ? 'กำลังบันทึก...' : '💾 บันทึกการตั้งค่าทั้งหมด'}
                                    </button>
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
                            </div>
                        </>
                    )}
                </form>

                {/* ==================== 3. PASSWORD & 2FA SECURITY SECTION ==================== */}
                {showSecuritySection && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Change Password Card */}
                        <div className="bg-white border border-[#D3DAE6] rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
                            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
                                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                    <span>🔑 เปลี่ยนรหัสผ่านเข้าสู่ระบบ (Change Password)</span>
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    อัปเดตรหัสผ่านสำหรับการเข้าสู่ระบบด้วย Provider ID ({userProfile.provider_id})
                                </p>
                            </div>

                            <form onSubmit={handleSubmitPassword} className="p-5 space-y-3.5 text-xs flex-1 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            รหัสผ่านปัจจุบัน (Current Password) <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={passwordForm.data.current_password}
                                            onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                            placeholder="กรอกรหัสผ่านปัจจุบันของคุณ"
                                            required
                                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]"
                                        />
                                        {passwordForm.errors.current_password && (
                                            <p className="text-rose-600 text-[11px] mt-1">{passwordForm.errors.current_password}</p>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                รหัสผ่านใหม่ (New Password) <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordForm.data.password}
                                                onChange={(e) => passwordForm.setData('password', e.target.value)}
                                                placeholder="อย่างน้อย 6 ตัวอักษร"
                                                required
                                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]"
                                            />
                                            {passwordForm.errors.password && (
                                                <p className="text-rose-600 text-[11px] mt-1">{passwordForm.errors.password}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                ยืนยันรหัสผ่านใหม่ (Confirm Password) <span className="text-rose-500">*</span>
                                            </label>
                                            <input
                                                type="password"
                                                value={passwordForm.data.password_confirmation}
                                                onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                                                required
                                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                                    <button
                                        type="submit"
                                        disabled={passwordForm.processing}
                                        className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-2xs transition cursor-pointer disabled:opacity-50"
                                    >
                                        {passwordForm.processing ? 'กำลังอัปเดตรหัสผ่าน...' : '🔒 เปลี่ยนรหัสผ่านใหม่'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Two-Factor Authentication (2FA) & SSO Security Status Card */}
                        <div className="bg-white border border-[#D3DAE6] rounded-xl shadow-2xs overflow-hidden flex flex-col justify-between">
                            <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                                <div>
                                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                        <span>🛡️ การยืนยันตัวตน 2 ขั้นตอน (2FA & MOPH SSO)</span>
                                    </h3>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        จัดการความปลอดภัยด้วยแอป Google Authenticator และการเชื่อมโยง Provider ID
                                    </p>
                                </div>
                                {userProfile.has_2fa ? (
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                                        เปิดใช้งาน 2FA แล้ว
                                    </span>
                                ) : (
                                    <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                                        ยังไม่เปิด 2FA
                                    </span>
                                )}
                            </div>

                            <div className="p-5 space-y-4 text-xs flex-1 flex flex-col justify-between">
                                <div className="space-y-3">
                                    <div className={`p-3.5 rounded-xl border ${
                                        userProfile.has_2fa
                                            ? 'bg-emerald-50/70 border-emerald-200'
                                            : 'bg-amber-50/70 border-amber-200'
                                    }`}>
                                        <div className="font-bold text-slate-800 flex items-center justify-between">
                                            <span>Google Authenticator (TOTP 6 หลัก)</span>
                                            {userProfile.two_factor_confirmed_at && (
                                                <span className="text-[11px] font-normal text-slate-500">
                                                    เปิดเมื่อ: {userProfile.two_factor_confirmed_at}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                                            {userProfile.has_2fa
                                                ? `บัญชีของคุณได้รับการปกป้องด้วยรหัส OTP 2 ชั้นแล้ว (มีรหัสสำรองฉุกเฉินคงเหลือ ${userProfile.recovery_codes_count} รหัส)`
                                                : 'แนะนำให้เปิดใช้งาน 2FA เพื่อป้องกันการเข้าถึงข้อมูลความมั่นคงปลอดภัยไซเบอร์โดยไม่ได้รับอนุญาต'}
                                        </p>
                                    </div>

                                    <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                                        <div className="font-bold text-slate-800 flex items-center justify-between">
                                            <span>การเชื่อมโยง MOPH Provider ID (Single Sign-On)</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                                isMophLinked ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                                {isMophLinked ? 'เชื่อมโยงแล้ว' : 'ยังไม่เชื่อมโยง'}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500">
                                            {isMophLinked
                                                ? `เชื่อมโยงกับ MOPH ID: ${userProfile.moph_id || userProfile.provider_id} เรียบร้อยแล้ว สามารถล็อกอินผ่านปุ่ม Provider ID ได้ทันที`
                                                : 'เมื่อคุณเข้าสู่ระบบผ่านปุ่ม MOPH Provider ID ด้วยอีเมลหรือรหัสเดียวกัน ระบบจะผูกบัญชีให้อัตโนมัติ'}
                                        </p>
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                                    <span className="text-[11px] text-slate-500">
                                        สแกน QR Code หรือจัดการรหัสกู้คืนฉุกเฉิน
                                    </span>
                                    <Link
                                        href="/security/two-factor"
                                        className="px-4 py-2 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-bold rounded-lg shadow-2xs transition"
                                    >
                                        ⚙️ จัดการตั้งค่า 2FA
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ==================== 4. MY SOC ACTIVITY & UPCOMING SHIFTS SECTION ==================== */}
                {showActivitySection && (
                    <div className="bg-white border border-[#D3DAE6] rounded-xl shadow-2xs overflow-hidden">
                        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    📅 สรุปตารางเวรเฝ้าระวังและประวัติการปฏิบัติงาน SOC ของฉัน
                                </h3>
                                <p className="text-xs text-slate-500">
                                    ข้อมูลเวรเฝ้าระวังศูนย์ปฏิบัติการความมั่นคงปลอดภัยไซเบอร์ (SOC) ที่ผูกกับบัญชีของคุณ
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/soc-schedule"
                                    className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg transition"
                                >
                                    📅 ดูปฏิทินเวรทั้งหมด
                                </Link>
                                <Link
                                    href="/webboard"
                                    className="px-3.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#006BB4] border border-sky-200 text-xs font-semibold rounded-lg transition"
                                >
                                    💬 กระดานข่าว SOC
                                </Link>
                            </div>
                        </div>

                        <div className="p-5 space-y-5">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-indigo-700 font-semibold">เวรเฝ้าระวังที่ได้รับมอบหมายทั้งหมด</div>
                                        <div className="text-2xl font-extrabold text-indigo-900 mt-0.5">
                                            {activitySummary?.total_shifts ?? 0} <span className="text-xs font-normal">ผลัด</span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                                        📅
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-emerald-700 font-semibold">เวรที่ส่งรายงานผลเฝ้าระวังแล้ว</div>
                                        <div className="text-2xl font-extrabold text-emerald-900 mt-0.5">
                                            {activitySummary?.completed_shifts ?? 0} <span className="text-xs font-normal">ผลัด</span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg">
                                        ✅
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-sky-700 font-semibold">รายงานเหตุการณ์ / กระทู้ Webboard</div>
                                        <div className="text-2xl font-extrabold text-sky-900 mt-0.5">
                                            {activitySummary?.topics_count ?? 0} <span className="text-xs font-normal">รายการ</span>
                                        </div>
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-lg">
                                        📋
                                    </div>
                                </div>
                            </div>

                            {/* Upcoming Shifts Table */}
                            <div className="space-y-2">
                                <div className="text-xs font-bold text-slate-700">
                                    📌 คิวเวรเฝ้าระวังที่กำลังจะมาถึงของคุณ (Upcoming Duty Shifts)
                                </div>
                                {activitySummary?.upcoming_shifts?.length > 0 ? (
                                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                                        <table className="w-full text-xs text-left">
                                            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                                                <tr>
                                                    <th className="px-4 py-2.5">วันที่เข้าเวร</th>
                                                    <th className="px-4 py-2.5">บทบาทในเวร</th>
                                                    <th className="px-4 py-2.5">สถานะ</th>
                                                    <th className="px-4 py-2.5">หมายเหตุ</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200">
                                                {activitySummary.upcoming_shifts.map((shift) => (
                                                    <tr key={shift.id} className="hover:bg-slate-50">
                                                        <td className="px-4 py-2.5 font-mono font-bold text-slate-800">
                                                            {shift.shift_date}
                                                        </td>
                                                        <td className="px-4 py-2.5">
                                                            {shift.is_primary ? (
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                                                                    เจ้าหน้าที่เวรหลัก
                                                                </span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                                                    เจ้าหน้าที่เวรสำรอง
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-2.5">
                                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                                                shift.status === 'completed'
                                                                    ? 'bg-emerald-100 text-emerald-800'
                                                                    : shift.status === 'on_duty'
                                                                    ? 'bg-sky-100 text-sky-800'
                                                                    : 'bg-amber-100 text-amber-800'
                                                            }`}>
                                                                {shift.status === 'completed'
                                                                    ? 'ส่งรายงานแล้ว'
                                                                    : shift.status === 'on_duty'
                                                                    ? 'กำลังปฏิบัติหน้าที่'
                                                                    : 'รอปฏิบัติหน้าที่'}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2.5 text-slate-500">
                                                            {shift.notes || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-xs text-slate-500">
                                        ยังไม่มีรายการเวรเฝ้าระวังที่กำลังจะมาถึงในขณะนี้
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </CtmrLayout>
    );
}
