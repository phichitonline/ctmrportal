import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import CtmrLayout from '@/Layouts/CtmrLayout';

export default function TwoFactorSettings({
    enabled,
    confirmed_at,
    secret_key,
    qr_code_svg,
    recovery_codes_count,
    recovery_codes,
}) {
    const { flash } = usePage().props;
    const [copiedKey, setCopiedKey] = useState(false);
    const [copiedCodes, setCopiedCodes] = useState(false);
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [showRegenModal, setShowRegenModal] = useState(false);

    // Form for confirming 2FA with 6-digit OTP
    const confirmForm = useForm({
        code: '',
    });

    // Form for disabling 2FA
    const disableForm = useForm({
        password: '',
    });

    // Form for regenerating recovery codes
    const regenForm = useForm({
        password: '',
    });

    const handleConfirm = (e) => {
        e.preventDefault();
        confirmForm.post('/security/two-factor/confirm', {
            onSuccess: () => confirmForm.reset(),
        });
    };

    const handleDisable = (e) => {
        e.preventDefault();
        disableForm.delete('/security/two-factor', {
            onSuccess: () => {
                setShowDisableModal(false);
                disableForm.reset();
            },
        });
    };

    const handleRegenerateCodes = (e) => {
        e.preventDefault();
        regenForm.post('/security/two-factor/recovery-codes', {
            onSuccess: () => {
                setShowRegenModal(false);
                regenForm.reset();
            },
        });
    };

    const copySecretKey = () => {
        if (secret_key) {
            navigator.clipboard.writeText(secret_key);
            setCopiedKey(true);
            setTimeout(() => setCopiedKey(false), 2000);
        }
    };

    const copyAllRecoveryCodes = () => {
        if (recovery_codes && recovery_codes.length > 0) {
            const text = recovery_codes.join('\n');
            navigator.clipboard.writeText(text);
            setCopiedCodes(true);
            setTimeout(() => setCopiedCodes(false), 2000);
        }
    };

    const downloadRecoveryCodes = () => {
        if (recovery_codes && recovery_codes.length > 0) {
            const text = `CTMR R3 Phichit MIS Portal - Emergency 2FA Recovery Codes\nGenerated at: ${new Date().toLocaleString()}\n\n` +
                recovery_codes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
                '\n\n* Keep these codes in a safe, offline location. Each code can be used once.';
            const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'ctmr-2fa-recovery-codes.txt';
            link.click();
            URL.revokeObjectURL(url);
        }
    };

    return (
        <CtmrLayout activeNav="overview" title="ความปลอดภัย 2FA">
            <Head title="ความปลอดภัย 2FA (Google Authenticator) - CTMR R3 Phichit" />

            <div className="max-w-4xl mx-auto space-y-6">
                {/* Header Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-[#006BB4] shrink-0 shadow-xs">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-lg font-bold text-slate-900">
                                    การยืนยันตัวตนสองขั้นตอน (Two-Factor Authentication)
                                </h1>
                                {enabled ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        เปิดใช้งานแล้ว
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                                        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                        ยังไม่ได้เปิดใช้งาน
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                ยกระดับความปลอดภัยให้กับบัญชีของคุณด้วยแอปพลิเคชัน <strong>Google Authenticator</strong> (RFC 6238 TOTP) เพื่อป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต
                            </p>
                        </div>
                    </div>
                </div>

                {/* Newly Generated Recovery Codes Banner */}
                {recovery_codes && recovery_codes.length > 0 && (
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-6 shadow-sm space-y-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 bg-amber-100 rounded-lg text-amber-800 shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-sm font-bold text-amber-900">
                                    ชุดรหัสสำรองฉุกเฉิน (Emergency Recovery Codes)
                                </h2>
                                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                                    กรุณาคัดลอกหรือดาวน์โหลดรหัสเหล่านี้เก็บไว้ในที่ปลอดภัย! หากคุณทำโทรศัพท์มือถือสูญหายหรือไม่สามารถเปิด Google Authenticator ได้ คุณสามารถใช้รหัสใดรหัสหนึ่งด้านล่างนี้ในการเข้าสู่ระบบแทนได้ (รหัสแต่ละชุดใช้งานได้ 1 ครั้ง)
                                </p>
                            </div>
                        </div>

                        {/* Codes Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-4 bg-white/80 rounded-lg border border-amber-200">
                            {recovery_codes.map((code, idx) => (
                                <div key={idx} className="p-2 bg-white rounded border border-slate-200 text-center font-mono font-bold text-xs text-slate-800 tracking-wider select-all">
                                    {code}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-3 pt-1">
                            <button
                                type="button"
                                onClick={copyAllRecoveryCodes}
                                className="px-3 py-1.5 text-xs font-semibold rounded bg-amber-700 hover:bg-amber-800 text-white transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>{copiedCodes ? 'คัดลอกเรียบร้อยแล้ว!' : 'คัดลอกรหัสทั้งหมด'}</span>
                            </button>

                            <button
                                type="button"
                                onClick={downloadRecoveryCodes}
                                className="px-3 py-1.5 text-xs font-semibold rounded bg-white hover:bg-slate-100 text-amber-900 border border-amber-300 transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>ดาวน์โหลดเป็นไฟล์ .txt</span>
                            </button>
                        </div>
                    </div>
                )}

                {/* State: 2FA Is Already Active */}
                {enabled ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-sm font-bold text-slate-800">
                                    บัญชีของคุณได้รับการปกป้องด้วย 2FA เรียบร้อยแล้ว
                                </h3>
                                <p className="text-xs text-slate-500">
                                    เปิดใช้งานเมื่อ: <span className="font-semibold text-slate-700">{confirmed_at}</span>
                                </p>
                                <p className="text-xs text-slate-500">
                                    จำนวนรหัสสำรองฉุกเฉินคงเหลือ: <span className="font-bold text-[#006BB4]">{recovery_codes_count}</span> ชุด
                                </p>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-3">
                            <button
                                type="button"
                                onClick={() => setShowRegenModal(true)}
                                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-sky-50 text-[#006BB4] border border-sky-200 hover:bg-sky-100 transition flex items-center gap-1.5 cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>สร้างชุดรหัสสำรองฉุกเฉินใหม่ (Regenerate Codes)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setShowDisableModal(true)}
                                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition flex items-center gap-1.5 cursor-pointer ml-auto"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>ปิดการใช้งาน 2FA</span>
                            </button>
                        </div>
                    </div>
                ) : (
                    /* State: 2FA Setup Flow */
                    <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-8">
                        {/* Step 1: Explanation */}
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#006BB4] text-white flex items-center justify-center text-xs font-bold">1</span>
                                <h3 className="text-sm font-bold text-slate-800">
                                    ดาวน์โหลดและติดตั้งแอป Google Authenticator
                                </h3>
                            </div>
                            <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                                ติดตั้งแอปพลิเคชัน <strong>Google Authenticator</strong> (หรือ Microsoft Authenticator) ได้ฟรีทั้งบน iOS ผ่าน App Store และ Android ผ่าน Google Play Store
                            </p>
                        </div>

                        {/* Step 2: Scan QR Code */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#006BB4] text-white flex items-center justify-center text-xs font-bold">2</span>
                                <h3 className="text-sm font-bold text-slate-800">
                                    สแกน QR Code ด้วยแอปพลิเคชัน
                                </h3>
                            </div>
                            <div className="pl-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                {/* SVG QR Code Container */}
                                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-xs flex items-center justify-center shrink-0">
                                    {qr_code_svg ? (
                                        <div
                                            className="w-48 h-48"
                                            dangerouslySetInnerHTML={{ __html: qr_code_svg }}
                                        />
                                    ) : (
                                        <div className="w-48 h-48 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
                                            กำลังโหลด QR Code...
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 flex-1">
                                    <p className="text-xs text-slate-600 leading-relaxed">
                                        เปิดแอป Google Authenticator แล้วแตะเครื่องหมาย <strong>+</strong> จากนั้นเลือก <strong>"สแกนคิวอาร์โค้ด"</strong>
                                    </p>

                                    {/* Manual Secret Key */}
                                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                                        <div className="text-[11px] text-slate-500 font-medium">
                                            หากไม่สามารถสแกน QR Code ได้ สามารถกรอกคีย์นี้ในแอปได้โดยตรง:
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <code className="font-mono text-xs font-bold text-[#006BB4] bg-white px-2 py-1 rounded border border-slate-200 select-all tracking-widest">
                                                {secret_key}
                                            </code>
                                            <button
                                                type="button"
                                                onClick={copySecretKey}
                                                className="px-2.5 py-1 text-[11px] font-semibold rounded bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 transition cursor-pointer"
                                            >
                                                {copiedKey ? '✓ คัดลอกแล้ว' : 'คัดลอก'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Step 3: Verify & Enable */}
                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#006BB4] text-white flex items-center justify-center text-xs font-bold">3</span>
                                <h3 className="text-sm font-bold text-slate-800">
                                    กรอกรหัส 6 หลักเพื่อยืนยันและเปิดใช้งาน
                                </h3>
                            </div>

                            <form onSubmit={handleConfirm} className="pl-8 max-w-sm space-y-3">
                                <div>
                                    <label htmlFor="confirm_code" className="block text-xs font-semibold text-slate-700 mb-1">
                                        รหัส 6 หลักจาก Google Authenticator <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        id="confirm_code"
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={6}
                                        value={confirmForm.data.code}
                                        onChange={(e) => confirmForm.setData('code', e.target.value.replace(/\D/g, '').slice(0, 6))}
                                        placeholder="123456"
                                        className={`w-full py-2.5 px-3.5 font-mono text-lg font-bold tracking-[0.3em] bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]/30 focus:border-[#006BB4] transition ${
                                            confirmForm.errors.code ? 'border-rose-400 bg-rose-50/30 text-rose-700' : 'border-slate-300 text-slate-900'
                                        }`}
                                    />
                                    {confirmForm.errors.code && (
                                        <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{confirmForm.errors.code}</span>
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={confirmForm.processing || confirmForm.data.code.length !== 6}
                                    className="w-full py-2.5 px-4 bg-[#006BB4] hover:bg-[#00528A] active:bg-[#00406C] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {confirmForm.processing ? (
                                        <span>กำลังตรวจสอบรหัส...</span>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>ยืนยันและเปิดใช้งาน 2FA ทันที</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL: DISABLE 2FA */}
                {showDisableModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">ยืนยันการปิดใช้งาน 2FA</h4>
                                    <p className="text-xs text-slate-500">บัญชีของคุณจะไม่ได้รับการปกป้องด้วยรหัสยืนยันสองขั้นตอนอีกต่อไป</p>
                                </div>
                            </div>

                            <form onSubmit={handleDisable} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        กรุณากรอกรหัสผ่านปัจจุบันของคุณเพื่อยืนยัน <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        autoFocus
                                        value={disableForm.data.password}
                                        onChange={(e) => disableForm.setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className={`w-full py-2 px-3 text-xs bg-slate-50 border rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/30 focus:border-rose-500 ${
                                            disableForm.errors.password ? 'border-rose-400 bg-rose-50/30 text-rose-700' : 'border-slate-300 text-slate-900'
                                        }`}
                                    />
                                    {disableForm.errors.password && (
                                        <p className="mt-1 text-xs text-rose-600">{disableForm.errors.password}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowDisableModal(false)}
                                        className="px-3.5 py-2 text-xs font-semibold rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={disableForm.processing || !disableForm.data.password}
                                        className="px-4 py-2 text-xs font-semibold rounded-md bg-rose-600 hover:bg-rose-700 text-white disabled:opacity-50 cursor-pointer"
                                    >
                                        {disableForm.processing ? 'กำลังดำเนินการ...' : 'ยืนยันปิดใช้งาน 2FA'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL: REGENERATE RECOVERY CODES */}
                {showRegenModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 space-y-4 border border-slate-200">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-sky-100 text-[#006BB4] rounded-lg shrink-0">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900">สร้างชุดรหัสสำรองฉุกเฉินใหม่</h4>
                                    <p className="text-xs text-slate-500">รหัสสำรองฉุกเฉินเดิมทั้งหมดจะถูกยกเลิกและแทนที่ด้วยชุดใหม่ทันที</p>
                                </div>
                            </div>

                            <form onSubmit={handleRegenerateCodes} className="space-y-3">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        กรุณากรอกรหัสผ่านปัจจุบันของคุณ <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        autoFocus
                                        value={regenForm.data.password}
                                        onChange={(e) => regenForm.setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className={`w-full py-2 px-3 text-xs bg-slate-50 border rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]/30 focus:border-[#006BB4] ${
                                            regenForm.errors.password ? 'border-rose-400 bg-rose-50/30 text-rose-700' : 'border-slate-300 text-slate-900'
                                        }`}
                                    />
                                    {regenForm.errors.password && (
                                        <p className="mt-1 text-xs text-rose-600">{regenForm.errors.password}</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowRegenModal(false)}
                                        className="px-3.5 py-2 text-xs font-semibold rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={regenForm.processing || !regenForm.data.password}
                                        className="px-4 py-2 text-xs font-semibold rounded-md bg-[#006BB4] hover:bg-[#00528A] text-white disabled:opacity-50 cursor-pointer"
                                    >
                                        {regenForm.processing ? 'กำลังสร้างรหัส...' : 'สร้างชุดรหัสใหม่'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </CtmrLayout>
    );
}
