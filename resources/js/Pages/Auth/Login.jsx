import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function Login({ mophLoginUrl: initialMophUrl }) {
    const pageProps = usePage().props;
    const { flash, errors } = pageProps;
    const [showPassword, setShowPassword] = useState(false);

    // MOPH Provider ID OAuth URL (using props from backend or default config)
    const mophLoginUrl = initialMophUrl || pageProps.mophLoginUrl || (
        'https://moph.id.th/oauth/redirect?' + new URLSearchParams({
            client_id: '0194e132-099e-7e9b-b25c-a927c7e35d83',
            redirect_uri: 'https://provider.tphcp.go.th/callback',
            response_type: 'code',
            state: 'https://ctmrportal.ppho.go.th/auth/moph/callback',
        }).toString()
    );

    const { data, setData, post, processing, reset } = useForm({
        provider_id: '',
        password: '',
        remember: false,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
            <Head title="เข้าสู่ระบบ - CTMR R3 Phichit MIS Portal" />

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
                                MIS Portal
                            </span>
                        </div>
                        <div className="text-[11px] text-slate-400">สำนักงานสาธารณสุขจังหวัดพิจิตร (เขตสุขภาพที่ 3)</div>
                    </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>CTMR SOC Gateway Active</span>
                    <span className="text-slate-600">•</span>
                    <span className="font-mono text-slate-300">Port: {typeof window !== 'undefined' && window.location.port ? window.location.port : '8081'}</span>
                </div>
            </header>

            {/* MAIN LOGIN CONTAINER */}
            <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
                <div className="w-full max-w-md">
                    {/* Flash Success Notification */}
                    {flash?.success && (
                        <div className="mb-4 bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 text-xs rounded-lg p-3.5 flex items-center gap-2.5 shadow-lg backdrop-blur-xs">
                            <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            <span>{flash.success}</span>
                        </div>
                    )}

                    {/* Flash Error Notification */}
                    {flash?.error && (
                        <div className="mb-4 bg-rose-950/80 border border-rose-700/80 text-rose-200 text-xs rounded-lg p-3.5 flex items-center gap-2.5 shadow-lg backdrop-blur-xs">
                            <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                            <span>{flash.error}</span>
                        </div>
                    )}

                    {/* Main White Card (Theme Match: OpenSearch clean card) */}
                    <div className="bg-white text-[#343741] rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
                        {/* Card Top Accent Bar */}
                        <div className="h-1.5 bg-gradient-to-r from-[#006BB4] via-sky-500 to-[#00A88F]"></div>

                        <div className="p-6 sm:p-8 space-y-6">
                            {/* Card Header */}
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 p-2 mb-1 shadow-xs">
                                    <img
                                        src="/images/wazuh_mark_on_light.svg"
                                        alt="CTMR Logo"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                                <h2 className="text-xl font-bold text-slate-800 tracking-tight">เข้าสู่ระบบ CTMR Portal</h2>
                                <p className="text-xs text-slate-500">
                                    <a
                                        href={mophLoginUrl}
                                        className="inline-flex items-center gap-1 text-slate-500 hover:text-[#006BB4] transition group"
                                        title="คลิกเพื่อยืนยันตัวตนด้วย Provider ID กระทรวงสาธารณสุข"
                                    >
                                        <span>ยืนยันตัวตนด้วย <span className="font-semibold text-[#006BB4] group-hover:underline">Provider ID</span> ของกระทรวงสาธารณสุข</span>
                                        <svg className="w-3.5 h-3.5 text-[#006BB4] group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                        </svg>
                                    </a>
                                </p>
                            </div>

                            {/* MOPH Provider ID Single Sign-On Primary Button */}
                            <div className="space-y-3">
                                <a
                                    href={mophLoginUrl}
                                    id="btn-moph-provider-login"
                                    className="w-full py-2.5 px-4 bg-gradient-to-r from-[#006BB4] via-[#007cc7] to-[#00A88F] hover:from-[#005a96] hover:via-[#006cae] hover:to-[#008f7a] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm hover:shadow-md transition duration-150 flex items-center justify-center gap-2.5 group cursor-pointer"
                                    title="เข้าสู่ระบบยืนยันตัวตนผ่าน Provider ID กระทรวงสาธารณสุข"
                                >
                                    <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                                        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M19 10.5h-5.5V5c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v5.5H5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5h5.5V19c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5v-5.5H19c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5z" />
                                        </svg>
                                    </span>
                                    <span>เข้าสู่ระบบด้วย Provider ID (MOPH)</span>
                                    <svg className="w-4 h-4 text-white/80 group-hover:text-white group-hover:translate-x-0.5 transition-transform shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </a>

                                <div className="relative flex items-center justify-center">
                                    <div className="border-t border-slate-200 w-full"></div>
                                    <span className="bg-white px-3 text-[11px] text-slate-400 font-medium tracking-wide whitespace-nowrap">
                                        หรือ เข้าสู่ระบบด้วยรหัสผ่าน
                                    </span>
                                    <div className="border-t border-slate-200 w-full"></div>
                                </div>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Provider ID */}
                                <div>
                                    <label htmlFor="provider_id" className="block text-xs font-semibold text-slate-700 mb-1.5">
                                        ชื่อผู้ใช้ (User Name) <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <input
                                            id="provider_id"
                                            type="text"
                                            value={data.provider_id}
                                            onChange={(e) => setData('provider_id', e.target.value)}
                                            placeholder="เช่น ADMIN001 หรือ HOS002"
                                            autoComplete="username"
                                            autoFocus
                                            className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]/30 focus:border-[#006BB4] font-mono uppercase tracking-wider transition ${
                                                errors.provider_id ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                                            }`}
                                        />
                                    </div>
                                    {errors.provider_id && (
                                        <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {errors.provider_id}
                                        </p>
                                    )}
                                </div>

                                {/* Password */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label htmlFor="password" className="text-xs font-semibold text-slate-700">
                                            รหัสผ่าน (Password) <span className="text-rose-500">*</span>
                                        </label>
                                        <span className="text-[11px] text-slate-400">เริ่มต้น: password</span>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" />
                                                <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth="2" />
                                            </svg>
                                        </div>
                                        <input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={data.password}
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="••••••••"
                                            autoComplete="current-password"
                                            className={`w-full pl-9 pr-10 py-2 text-xs sm:text-sm bg-slate-50 border rounded-md focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]/30 focus:border-[#006BB4] transition ${
                                                errors.password ? 'border-rose-400 bg-rose-50/30' : 'border-slate-300'
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                                            title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                                        >
                                            {showPassword ? (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                </svg>
                                            ) : (
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <p className="mt-1.5 text-xs text-rose-600 flex items-center gap-1 font-medium">
                                            <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {/* Remember Me */}
                                <div className="flex items-center justify-between pt-1">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="w-4 h-4 text-[#006BB4] rounded border-slate-300 focus:ring-[#006BB4]"
                                        />
                                        <span className="text-xs text-slate-600">จดจำการเข้าสู่ระบบ</span>
                                    </label>
                                    <span className="text-[11px] text-slate-400">ระบบรักษาความปลอดภัย SSL/TLS</span>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="w-full py-2.5 px-4 bg-[#006BB4] hover:bg-[#00528A] active:bg-[#00406C] text-white text-xs sm:text-sm font-semibold rounded-md shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>กำลังตรวจสอบสิทธิ์...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                            </svg>
                                            <span>เข้าสู่ระบบ (Sign In)</span>
                                        </>
                                    )}
                                </button>
                            </form>

                        </div>
                    </div>

                    {/* Security Notice */}
                    <div className="mt-4 text-center text-xs text-slate-400 space-y-1">
                        <p className="flex items-center justify-center gap-1.5 text-[11px]">
                            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                            ระบบเฝ้าระวังความมั่นคงปลอดภัยตามมาตรฐาน ISO 27001 / TH-CERT
                        </p>
                        <p className="text-[10px] text-slate-400">
                            สงวนสิทธิ์เฉพาะเจ้าหน้าที่ผู้ได้รับมอบหมายในสังกัดสำนักงานสาธารณสุขจังหวัดพิจิตรเท่านั้น
                        </p>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="relative z-10 border-t border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-3 text-center text-xs text-slate-400">
                CTMR R3 Phichit MIS Security Operations Center • Contact MIS Admin สสจ.พิจิตร 056-611234
            </footer>
        </div>
    );
}
