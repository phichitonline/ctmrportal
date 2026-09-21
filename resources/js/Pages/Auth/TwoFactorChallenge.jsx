import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';

export default function TwoFactorChallenge({ provider_id, user_name }) {
    const [useRecovery, setUseRecovery] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        code: '',
        recovery_code: '',
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/two-factor-challenge', {
            onFinish: () => {
                if (useRecovery) {
                    reset('recovery_code');
                } else {
                    reset('code');
                }
            },
        });
    };

    const handleCancel = () => {
        router.post('/two-factor-cancel');
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
            <Head title="ยืนยันตัวตน 2FA - CTMR R3 Phichit MIS Portal" />

            {/* Background Ambient Glow & Grid Lines */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,107,180,0.18)_0%,_transparent_65%)] pointer-events-none" />
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(to right, #ffffff 1px, transparent 1px)`,
                    backgroundSize: '40px 40px',
                }}
            />

            {/* TOP BAR */}
            <header className="relative z-10 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 p-1 flex items-center justify-center shadow-xs">
                        <img
                            src="/images/wazuh_mark_on_light.svg"
                            alt="Wazuh CTMR Logo"
                            className="w-full h-full object-contain"
                        />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
                            CTMR R3 Phichit
                            <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800/60">
                                2FA Authentication
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-400">สำนักงานสาธารณสุขจังหวัดพิจิตร (เขตสุขภาพที่ 3)</div>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-2 text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="font-mono text-[11px]">2FA TOTP Protected</span>
                    </div>
                </div>
            </header>

            {/* MAIN CONTENT AREA */}
            <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
                <div className="w-full max-w-md">
                    {/* Login Card */}
                    <div className="bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-200 overflow-hidden relative">
                        {/* Top Decorative Border */}
                        <div className="h-1.5 w-full bg-gradient-to-r from-[#006BB4] via-sky-400 to-emerald-500"></div>

                        <div className="p-6 sm:p-8">
                            {/* Icon & Title */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-sky-50 border border-sky-100 text-[#006BB4] mb-3 shadow-xs">
                                    {useRecovery ? (
                                        <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                        </svg>
                                    ) : (
                                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                    )}
                                </div>
                                <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                                    {useRecovery ? 'ยืนยันด้วยรหัสกู้คืนฉุกเฉิน' : 'ยืนยันตัวตนสองขั้นตอน (2FA)'}
                                </h1>
                                <p className="text-xs text-slate-500 mt-1">
                                    ผู้ใช้งาน: <span className="font-semibold text-slate-700">{user_name}</span> ({provider_id})
                                </p>
                            </div>

                            {/* Help Banner */}
                            <div className="mb-5 p-3 rounded-lg bg-sky-50/70 border border-sky-100 text-xs text-slate-600 flex items-start gap-2.5 leading-relaxed">
                                <svg className="w-4 h-4 text-[#006BB4] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {useRecovery ? (
                                    <span>
                                        กรอกหนึ่งในชุดรหัสกู้คืนฉุกเฉิน (Recovery Codes 10 ตัวอักษร) ที่คุณบันทึกไว้เมื่อเปิดใช้งาน 2FA
                                    </span>
                                ) : (
                                    <span>
                                        เปิดแอป <strong className="text-[#006BB4]">Google Authenticator</strong> บนสมาร์ตโฟน แล้วนำรหัสตัวเลข 6 หลักที่ปรากฏมากรอกด้านล่าง
                                    </span>
                                )}
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {!useRecovery ? (
                                    /* 6-Digit TOTP PIN */
                                    <div>
                                        <label htmlFor="code" className="block text-xs font-semibold text-slate-700 mb-1.5 text-center">
                                            รหัสความปลอดภัย 6 หลัก (Google Authenticator) <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="code"
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                maxLength={6}
                                                autoComplete="one-time-code"
                                                autoFocus
                                                value={data.code}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                    setData('code', val);
                                                }}
                                                placeholder="••••••"
                                                className={`w-full py-3 px-4 text-center font-mono text-2xl font-bold tracking-[0.4em] bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]/30 focus:border-[#006BB4] transition ${
                                                    errors.code ? 'border-rose-400 bg-rose-50/30 text-rose-700' : 'border-slate-300 text-slate-900'
                                                }`}
                                            />
                                        </div>
                                        {errors.code && (
                                            <p className="mt-1.5 text-xs text-rose-600 flex items-center justify-center gap-1 font-medium">
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{errors.code}</span>
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    /* Recovery Code */
                                    <div>
                                        <label htmlFor="recovery_code" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                            รหัสกู้คืนฉุกเฉิน (Emergency Recovery Code) <span className="text-rose-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                id="recovery_code"
                                                type="text"
                                                autoFocus
                                                value={data.recovery_code}
                                                onChange={(e) => setData('recovery_code', e.target.value.toUpperCase())}
                                                placeholder="เช่น ABCDE-FGHIJ"
                                                className={`w-full py-2.5 px-3.5 font-mono text-sm uppercase tracking-wider bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]/30 focus:border-[#006BB4] transition ${
                                                    errors.recovery_code ? 'border-rose-400 bg-rose-50/30 text-rose-700' : 'border-slate-300 text-slate-900'
                                                }`}
                                            />
                                        </div>
                                        {errors.recovery_code && (
                                            <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span>{errors.recovery_code}</span>
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing || (!useRecovery && data.code.length !== 6) || (useRecovery && !data.recovery_code)}
                                    className="w-full py-2.5 px-4 bg-[#006BB4] hover:bg-[#00528A] active:bg-[#00406C] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>กำลังตรวจสอบความถูกต้อง...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>ยืนยันและเข้าสู่ระบบ</span>
                                        </>
                                    )}
                                </button>
                            </form>

                            {/* Options: Switch to Recovery Code & Cancel */}
                            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setUseRecovery(!useRecovery);
                                        reset('code', 'recovery_code');
                                    }}
                                    className="text-[#006BB4] hover:underline font-medium cursor-pointer"
                                >
                                    {useRecovery ? '← กลับไปใช้รหัส Google Authenticator' : '🔑 ใช้งานรหัสสำรองฉุกเฉิน (Recovery Code)'}
                                </button>

                                <button
                                    type="button"
                                    onClick={handleCancel}
                                    className="text-slate-500 hover:text-slate-700 cursor-pointer"
                                >
                                    ยกเลิก / บัญชีอื่น
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-4 text-center text-xs text-slate-400 space-y-1">
                        <p className="flex items-center justify-center gap-1.5 text-[11px]">
                            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            Time-based One-Time Password (TOTP) RFC 6238 Standard
                        </p>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="relative z-10 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-3 text-center text-xs text-slate-400">
                CTMR R3 Phichit MIS Security Operations Center • หากพบปัญหา 2FA ติดต่อ MIS Admin 056-611234
            </footer>
        </div>
    );
}
