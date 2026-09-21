import React, { useState, useEffect } from 'react';
import { Link, Head, usePage } from '@inertiajs/react';

export default function CtmrLayout({ children, title = 'Overview', activeNav = 'overview' }) {
    const { auth, flash } = usePage().props;
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [hospitalModalOpen, setHospitalModalOpen] = useState(false);
    const [moduleModal, setModuleModal] = useState({ open: false, title: '', desc: '', target: '' });
    const [flashVisible, setFlashVisible] = useState(true);

    const [selectedAgency, setSelectedAgency] = useState({
        id: '002',
        name: 'โรงพยาบาลพิจิตร (HIS/HOSxP)',
        ip: '192.168.10.254',
        os: 'Windows Server 2022 / Rocky Linux',
        his: 'HOSxP v4 / JHCIS',
        status: 'Active',
    });
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        setLastUpdated(new Date().toLocaleTimeString('th-TH'));
    }, []);

    // If hospital user, automatically bind view to their agency
    useEffect(() => {
        if (auth?.user?.role === 'hospital_user' && auth?.user?.agency_name) {
            setSelectedAgency({
                id: auth.user.agency_code || '002',
                name: auth.user.agency_name,
                ip: auth.user.agency_code === '002' ? '192.168.10.254' : '192.168.20.10',
                os: 'Hospital Node Linux/Windows',
                his: 'HOSxP / Hospital Information System',
                status: 'Active',
            });
        }
    }, [auth?.user]);

    // Show flash when it changes
    useEffect(() => {
        if (flash?.success || flash?.error) {
            setFlashVisible(true);
        }
    }, [flash]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            setIsRefreshing(false);
            setLastUpdated(new Date().toLocaleTimeString('th-TH'));
        }, 600);
    };

    const handleSelectHospital = (id, name, ip, os, his, status) => {
        // Only allow admin to switch nodes
        if (auth?.user?.role === 'hospital_user' && id !== auth.user.agency_code && id !== 'my') {
            alert('คุณได้รับสิทธิ์ให้เข้าถึงข้อมูลเฉพาะหน่วยงานของคุณ (' + auth.user.agency_name + ') เท่านั้น');
            return;
        }

        setSelectedAgency({ id, name, ip, os, his, status });
        setHospitalModalOpen(false);
        setLastUpdated(new Date().toLocaleTimeString('th-TH'));
    };

    const openModule = (modTitle, modDesc) => {
        setModuleModal({
            open: true,
            title: modTitle,
            desc: modDesc,
            target: selectedAgency.name + ` (Agent ${selectedAgency.id})`,
        });
    };

    const closeModule = () => {
        setModuleModal({ ...moduleModal, open: false });
    };

    const isHospitalUser = auth?.user?.role === 'hospital_user';
    const isAdmin = auth?.user?.is_admin;

    return (
        <div className="min-h-screen bg-[#F5F7FA] text-[#343741] font-sans antialiased flex flex-col">
            <Head title={title} />

            {/* TOP NAVBAR */}
            <header className="h-12 bg-white border-b border-[#D3DAE6] px-4 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Hamburger Drawer Toggle */}
                    <button
                        onClick={() => setDrawerOpen(true)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                        title="เปิดเมนูนำทาง"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>

                    <div className="h-5 w-px bg-slate-200"></div>

                    {/* Wazuh Project Logo */}
                    <Link href="/" className="flex items-center gap-2 text-decoration-none hover:opacity-90 transition" title="หน้าแรกแดชบอร์ด">
                        <img
                            src="/images/wazuh_mark_on_light.svg"
                            alt="Wazuh CTMR Logo"
                            className="w-7 h-7 object-contain"
                        />
                    </Link>

                    {/* Breadcrumbs */}
                    {activeNav === 'overview' ? (
                        <div className="bg-[#D3E5F5] text-[#006BB4] text-[13px] font-semibold px-4 py-1 rounded-[4px] [clip-path:polygon(8px_0%,100%_0%,calc(100%-8px)_100%,0%_100%)] flex items-center">
                            Overview
                        </div>
                    ) : (
                        <Link href="/" className="text-slate-500 hover:text-[#006BB4] text-[13px] font-medium px-2.5 py-1 rounded hover:bg-slate-100 transition">
                            Overview
                        </Link>
                    )}

                    {activeNav !== 'overview' && (
                        <>
                            <span className="text-slate-300">/</span>
                            <div className="bg-[#D3E5F5] text-[#006BB4] text-[13px] font-semibold px-4 py-1 rounded-[4px] [clip-path:polygon(8px_0%,100%_0%,calc(100%-8px)_100%,0%_100%)] flex items-center">
                                {title}
                            </div>
                        </>
                    )}

                    {/* Regional Subtitle */}
                    <div className="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs text-slate-500">
                        <span className="font-semibold text-[#006BB4]">CTMR Phichit</span>
                        <span>•</span>
                        <span>ระบบบริหารจัดการความปลอดภัยสารสนเทศ สสจ.พิจิตร</span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span> Live Node
                        </span>
                    </div>
                </div>

                {/* Right Tools */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Node Selector Filter */}
                    <div className="hidden lg:flex items-center text-xs">
                        <span className="text-slate-400 mr-1.5 font-medium">มุมมองโหนด:</span>
                        {isHospitalUser ? (
                            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded px-2.5 py-1 flex items-center gap-1.5 font-medium" title="บัญชีผู้ใช้งานถูกล็อกการเข้าถึงเฉพาะโหนดของโรงพยาบาลของคุณ">
                                <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" strokeWidth="2" />
                                    <path d="M7 11V7a5 5 0 0110 0v4" strokeWidth="2" />
                                </svg>
                                <span>{auth?.user?.agency_name} (Agent {auth?.user?.agency_code})</span>
                            </div>
                        ) : (
                            <select
                                value={selectedAgency.id}
                                onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '001') handleSelectHospital('001', 'แม่ข่ายศูนย์เทคโนโลยี สสจ.พิจิตร', '192.168.1.10', 'Rocky Linux 9 / Docker', 'HDC / Gateway', 'Active');
                                    else if (val === '002') handleSelectHospital('002', 'โรงพยาบาลพิจิตร (HIS/HOSxP)', '192.168.10.254', 'Windows Server 2022', 'HOSxP v4', 'Active');
                                    else if (val === '003') handleSelectHospital('003', 'รพ.สมเด็จพระยุพราชตะพานหิน', '192.168.20.10', 'Ubuntu 22.04 LTS', 'HOSxP', 'Active');
                                    else if (val === '004') handleSelectHospital('004', 'รพ.บางมูลนาก', '192.168.30.15', 'Windows Server 2019', 'HOSxP', 'Active');
                                    else if (val === '005') handleSelectHospital('005', 'รพ.โพทะเล', '192.168.40.8', 'CentOS 7', 'HOSxP', 'Disconnected');
                                    else handleSelectHospital('all', 'เครือข่ายสาธารณสุขจังหวัดพิจิตร (ทุกโหนด)', '192.168.0.0/16', 'Mixed OS', 'All HIS', 'Active');
                                }}
                                className="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded px-2.5 py-1 focus:ring-1 focus:ring-sky-500 focus:outline-none font-medium cursor-pointer"
                            >
                                <option value="all">ทุกโหนดในจังหวัดพิจิตร (613 Nodes)</option>
                                <option value="001">Agent 001 - แม่ข่ายศูนย์เทคโนโลยี สสจ.พิจิตร</option>
                                <option value="002">Agent 002 - โรงพยาบาลพิจิตร (HIS/HOSxP)</option>
                                <option value="003">Agent 003 - รพ.สมเด็จพระยุพราชตะพานหิน</option>
                                <option value="004">Agent 004 - รพ.บางมูลนาก</option>
                                <option value="005">Agent 005 - รพ.โพทะเล</option>
                            </select>
                        )}
                    </div>

                    {/* Time Filter */}
                    <div className="hidden sm:flex items-center bg-slate-100 px-2.5 py-1 rounded text-xs text-slate-600 font-medium">
                        <svg className="w-3.5 h-3.5 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                            <polyline points="12 6 12 12 16 14" strokeWidth="2"></polyline>
                        </svg>
                        <span>24 ชม. ล่าสุด</span>
                    </div>

                    {/* Refresh Button */}
                    <button
                        onClick={handleRefresh}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-600 transition cursor-pointer"
                        title="รีเฟรชข้อมูล"
                    >
                        <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                    </button>

                    {/* USER PROFILE & LOGOUT DROPDOWN */}
                    <div className="relative">
                        <button
                            onClick={() => setUserMenuOpen(!userMenuOpen)}
                            className="flex items-center gap-2 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer focus:outline-none"
                            title={auth?.user ? `${auth.user.name} (${auth.user.provider_id})` : 'เข้าสู่ระบบ'}
                        >
                            <div className="w-7 h-7 rounded-full bg-[#006BB4] text-white flex items-center justify-center font-bold text-xs shadow-xs uppercase">
                                {auth?.user?.provider_id ? auth.user.provider_id.substring(0, 2) : 'U'}
                            </div>
                            <span className="hidden md:inline text-xs font-semibold text-slate-700 max-w-[120px] truncate">
                                {auth?.user?.name ? auth.user.name.split(' ')[0] : 'ผู้ใช้งาน'}
                            </span>
                            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {userMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                                <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-xl z-50 py-2 text-xs divide-y divide-slate-100">
                                    <div className="px-4 py-2.5 space-y-1 bg-slate-50/50">
                                        <div className="font-bold text-slate-800 text-sm">{auth?.user?.name}</div>
                                        <div className="flex items-center gap-1.5 font-mono text-slate-500 text-[11px]">
                                            <span>Provider ID:</span>
                                            <span className="font-bold text-[#006BB4]">{auth?.user?.provider_id}</span>
                                        </div>
                                        <div className="text-[11px] text-slate-500 truncate">{auth?.user?.agency_name}</div>
                                        <div className="pt-1">
                                            {isAdmin ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                                                    Super Administrator
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                                                    Hospital Staff ({auth?.user?.agency_code})
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="py-1">
                                        <Link
                                            href="/security/two-factor"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="w-full text-left px-4 py-2 flex items-center justify-between hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer"
                                        >
                                            <div className="flex items-center gap-2">
                                                <svg className="w-4 h-4 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                <span>ความปลอดภัย 2FA</span>
                                            </div>
                                            {auth?.user?.has_2fa ? (
                                                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">เปิดแล้ว</span>
                                            ) : (
                                                <span className="text-[10px] font-medium text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">ยังไม่เปิด</span>
                                            )}
                                        </Link>

                                        {isAdmin && (
                                            <Link
                                                href="/users"
                                                onClick={() => setUserMenuOpen(false)}
                                                className="w-full text-left px-4 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700 font-medium transition cursor-pointer"
                                            >
                                                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                                <span>จัดการผู้ใช้งาน (User Management)</span>
                                            </Link>
                                        )}

                                        <Link
                                            href="/logout"
                                            method="post"
                                            as="button"
                                            className="w-full text-left px-4 py-2 flex items-center gap-2 text-rose-600 hover:bg-rose-50 font-semibold transition cursor-pointer"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                            </svg>
                                            <span>ออกจากระบบ (Sign Out)</span>
                                        </Link>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Help Button */}
                    <button
                        onClick={() => openModule('คู่มือการใช้งาน CTMR R3 Phichit', 'ศูนย์ปฏิบัติการความมั่นคงปลอดภัยไซเบอร์สาธารณสุขจังหวัดพิจิตร (MIS Security Operations Manual v4.7.2)')}
                        className="w-6 h-6 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center text-xs font-semibold hover:bg-slate-100 cursor-pointer"
                        title="ช่วยเหลือ / เอกสารคู่มือ"
                    >
                        ?
                    </button>
                </div>
            </header>

            {/* FLASH NOTIFICATION BAR */}
            {flashVisible && flash?.success && (
                <div className="bg-emerald-600 text-white px-4 py-2 text-xs flex items-center justify-between shadow-xs">
                    <div className="max-w-[1720px] mx-auto w-full flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{flash.success}</span>
                        <button onClick={() => setFlashVisible(false)} className="ml-auto text-emerald-200 hover:text-white cursor-pointer font-bold">
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {flashVisible && flash?.error && (
                <div className="bg-rose-600 text-white px-4 py-2 text-xs flex items-center justify-between shadow-xs">
                    <div className="max-w-[1720px] mx-auto w-full flex items-center gap-2">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <span>{flash.error}</span>
                        <button onClick={() => setFlashVisible(false)} className="ml-auto text-rose-200 hover:text-white cursor-pointer font-bold">
                            ✕
                        </button>
                    </div>
                </div>
            )}

            {/* NAVIGATION DRAWER BACKDROP */}
            <div
                onClick={() => setDrawerOpen(false)}
                className={`fixed inset-0 top-12 bg-slate-900/30 backdrop-blur-xs z-40 transition-opacity duration-200 ${
                    drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
            />

            {/* SIDEBAR NAVIGATION DRAWER */}
            <aside
                className={`fixed top-12 left-0 bottom-0 w-64 bg-white border-r border-[#D3DAE6] z-50 transform transition-transform duration-250 ease-out flex flex-col shadow-xl ${
                    drawerOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                        <img
                            src="/images/wazuh_mark_on_light.svg"
                            alt="Wazuh CTMR Logo"
                            className="w-5 h-5 object-contain"
                        />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-600">MIS Navigation</span>
                    </div>
                    <button onClick={() => setDrawerOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                <div className="py-1 overflow-y-auto flex-1 text-xs">
                    <div className="px-4 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Main Portals
                    </div>

                    <Link
                        href="/"
                        onClick={() => setDrawerOpen(false)}
                        className={`px-4 py-2.5 flex items-center justify-between border-b border-slate-100 transition ${
                            activeNav === 'overview' ? 'bg-[#F0F6FC] text-[#006BB4] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            <span>Home (แดชบอร์ดหลัก)</span>
                        </div>
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </Link>

                    <Link
                        href="/webboard"
                        onClick={() => setDrawerOpen(false)}
                        className={`px-4 py-2.5 flex items-center justify-between border-b border-slate-100 transition ${
                            activeNav === 'webboard' ? 'bg-[#F0F6FC] text-[#006BB4] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <svg className="w-4 h-4 text-[#006BB4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            <span>SOC Webboard (กระดานข่าว & รายงานเวร)</span>
                        </div>
                        <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded-full">SOC</span>
                    </Link>

                    <Link
                        href="/agency-docs"
                        onClick={() => setDrawerOpen(false)}
                        className={`px-4 py-2.5 flex items-center justify-between border-b border-slate-100 transition ${
                            activeNav === 'agency-docs' ? 'bg-[#F0F6FC] text-[#006BB4] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <svg className="w-4 h-4 text-[#00A88F]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                            <span>เอกสาร & ติดตามงาน (Docs & Timeline)</span>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-full">New</span>
                    </Link>

                    <Link
                        href="/about"
                        onClick={() => setDrawerOpen(false)}
                        className={`px-4 py-2.5 flex items-center justify-between border-b border-slate-100 transition ${
                            activeNav === 'about' ? 'bg-[#F0F6FC] text-[#006BB4] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="16" x2="12" y2="12"></line>
                                <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                            <span>About Us (เกี่ยวกับทีมงาน)</span>
                        </div>
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </Link>

                    <Link
                        href="/team"
                        onClick={() => setDrawerOpen(false)}
                        className={`px-4 py-2.5 flex items-center justify-between border-b border-slate-100 transition ${
                            activeNav === 'team' ? 'bg-[#F0F6FC] text-[#006BB4] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            <span>Team Members (รายชื่อทีมงาน)</span>
                        </div>
                        <span className="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded-full">12 คน</span>
                    </Link>

                    {/* Admin-only Section */}
                    {isAdmin && (
                        <>
                            <div className="px-4 py-2 mt-2 text-[11px] font-bold text-[#006BB4] uppercase tracking-wider bg-sky-50/50">
                                Administration
                            </div>

                            <Link
                                href="/users"
                                onClick={() => setDrawerOpen(false)}
                                className={`px-4 py-2.5 flex items-center justify-between border-b border-slate-100 transition ${
                                    activeNav === 'users' ? 'bg-[#F0F6FC] text-[#006BB4] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <svg className="w-4 h-4 text-[#006BB4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                    <span>User Management (จัดการผู้ใช้)</span>
                                </div>
                                <span className="text-[9px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">RBAC</span>
                            </Link>
                        </>
                    )}

                    <div className="px-4 py-2 mt-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        Security Modules
                    </div>

                    <button
                        onClick={() => { setDrawerOpen(false); openModule('Threat Hunting', 'สืบค้นและวิเคราะห์เหตุการณ์ความมั่นคงปลอดภัยสารสนเทศ สสจ.พิจิตร'); }}
                        className="w-full text-left px-4 py-2.5 flex items-center justify-between border-b border-slate-100 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5">
                            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <span>Threat Hunting</span>
                        </div>
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>

                    <button
                        onClick={() => { setDrawerOpen(false); openModule('Endpoint Security', 'การตรวจจับมัลแวร์ การเฝ้าระวังไฟล์สำคัญ (FIM) และการตรวจสอบการตั้งค่าความปลอดภัย (SCA)'); }}
                        className="w-full text-left px-4 py-2.5 flex items-center justify-between border-b border-slate-100 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5">
                            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                            </svg>
                            <span>Endpoint Security</span>
                        </div>
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                    </button>

                    <button
                        onClick={() => { setDrawerOpen(false); setHospitalModalOpen(true); }}
                        className="w-full text-left px-4 py-2.5 flex items-center justify-between border-b border-slate-100 text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5">
                            <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="18" cy="5" r="3"></circle>
                                <circle cx="6" cy="12" r="3"></circle>
                                <circle cx="18" cy="19" r="3"></circle>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                            </svg>
                            <span>Agents Management (613 โหนด)</span>
                        </div>
                        <span className="text-[11px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-full">613</span>
                    </button>
                </div>

                <div className="p-3 border-t border-slate-200 text-xs text-slate-500 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700">{auth?.user?.provider_id}</span>
                        <span className="text-[10px] bg-slate-200 px-1.5 py-0.2 rounded font-mono">{auth?.user?.role}</span>
                    </div>
                    <Link
                        href="/logout"
                        method="post"
                        as="button"
                        className="w-full py-1.5 text-center text-xs bg-rose-50 text-rose-600 hover:bg-rose-100 rounded font-semibold transition cursor-pointer"
                    >
                        ออกจากระบบ (Sign Out)
                    </Link>
                </div>
            </aside>

            {/* HOSPITAL CONTEXT SUB-BAR */}
            <div className="max-w-[1720px] w-full mx-auto px-4 sm:px-6 pt-4">
                <div className="bg-white border border-[#D3DAE6] rounded-md px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2.5">
                        <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="font-semibold text-slate-800 text-sm">{selectedAgency.name}</span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono border border-slate-200">
                            Agent: {selectedAgency.id} ({selectedAgency.status})
                        </span>
                        <span className="text-xs text-slate-400">|</span>
                        <span className="text-xs text-slate-500">
                            IP: {selectedAgency.ip} • {selectedAgency.os} • HIS: {selectedAgency.his}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        {isAdmin ? (
                            <button
                                onClick={() => setHospitalModalOpen(true)}
                                className="text-xs text-[#006BB4] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                รายชื่อ 12 โรงพยาบาลในพิจิตร
                            </button>
                        ) : (
                            <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                โหนดสังกัด: {auth?.user?.agency_name}
                            </span>
                        )}
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-500">
                            อัปเดตล่าสุด: <span className="font-mono font-medium text-slate-700">{lastUpdated}</span>
                        </span>
                    </div>
                </div>
            </div>

            {/* PAGE CONTENT */}
            <main className="flex-1 max-w-[1720px] w-full mx-auto p-4 sm:p-6">
                {typeof children === 'function' ? children({ openModule }) : children}
            </main>

            {/* FOOTER BAR */}
            <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200 mt-auto space-y-1 bg-white">
                <p>CTMR R3 Phichit MIS Admin Portal • ศูนย์เทคโนโลยีสารสนเทศ สำนักงานสาธารณสุขจังหวัดพิจิตร</p>
                <p className="text-[11px] text-slate-400">
                    พัฒนาด้วย Laravel 13 + Inertia.js v3 + React 19 • Wazuh Security Engine & OpenSearch Dashboard 4.7.2
                </p>
            </footer>

            {/* HOSPITAL NETWORK MODAL */}
            {hospitalModalOpen && (
                <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded bg-sky-100 text-[#006BB4] flex items-center justify-center font-bold">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">สถานะโหนดเครือข่ายโรงพยาบาลในจังหวัดพิจิตร (CTMR Health Nodes)</h3>
                                    <p className="text-xs text-slate-500">รายงานการเชื่อมต่อระบบเฝ้าระวังความมั่นคงปลอดภัยสารสนเทศ สสจ.พิจิตร</p>
                                </div>
                            </div>
                            <button onClick={() => setHospitalModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-200 cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-center">
                                    <div className="text-xs text-emerald-700 font-medium">โหนดที่ Active ปกติ</div>
                                    <div className="text-2xl font-bold text-emerald-800">418</div>
                                </div>
                                <div className="bg-rose-50 border border-rose-200 rounded p-3 text-center">
                                    <div className="text-xs text-rose-700 font-medium">โหนด Disconnected</div>
                                    <div className="text-2xl font-bold text-rose-800">195</div>
                                </div>
                                <div className="bg-sky-50 border border-sky-200 rounded p-3 text-center">
                                    <div className="text-xs text-sky-700 font-medium">จำนวนโหนดทั้งหมด</div>
                                    <div className="text-2xl font-bold text-sky-800">613</div>
                                </div>
                            </div>

                            <div className="border border-slate-200 rounded-md overflow-hidden">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase">
                                        <tr>
                                            <th className="p-3">Agent ID</th>
                                            <th className="p-3">ชื่อหน่วยงาน / โรงพยาบาล</th>
                                            <th className="p-3">IP Address</th>
                                            <th className="p-3">ระบบ HIS / OS</th>
                                            <th className="p-3">สถานะ</th>
                                            <th className="p-3 text-right">การจัดการ</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200">
                                        <tr className="hover:bg-slate-50">
                                            <td className="p-3 font-mono font-semibold">001</td>
                                            <td className="p-3 font-medium text-slate-800">แม่ข่ายศูนย์เทคโนโลยี สสจ.พิจิตร</td>
                                            <td className="p-3 font-mono text-slate-600">192.168.1.10</td>
                                            <td className="p-3 text-slate-600">Rocky Linux 9 / Docker</td>
                                            <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Active</span></td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => handleSelectHospital('001', 'แม่ข่ายศูนย์เทคโนโลยี สสจ.พิจิตร', '192.168.1.10', 'Rocky Linux 9 / Docker', 'HDC / Gateway', 'Active')}
                                                    className="text-[#006BB4] font-semibold hover:underline cursor-pointer"
                                                >
                                                    เลือกมุมมอง
                                                </button>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50 bg-sky-50/50">
                                            <td className="p-3 font-mono font-semibold text-[#006BB4]">002</td>
                                            <td className="p-3 font-semibold text-slate-800">โรงพยาบาลพิจิตร (HIS/HOSxP)</td>
                                            <td className="p-3 font-mono text-slate-600">192.168.10.254</td>
                                            <td className="p-3 text-slate-600">Windows Server 2022 / HOSxP v4</td>
                                            <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Active (Current)</span></td>
                                            <td className="p-3 text-right">
                                                <span className="text-slate-400 font-medium">กำลังดูอยู่นี้</span>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50">
                                            <td className="p-3 font-mono font-semibold">003</td>
                                            <td className="p-3 font-medium text-slate-800">รพ.สมเด็จพระยุพราชตะพานหิน</td>
                                            <td className="p-3 font-mono text-slate-600">192.168.20.10</td>
                                            <td className="p-3 text-slate-600">Ubuntu 22.04 LTS / HOSxP</td>
                                            <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Active</span></td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => handleSelectHospital('003', 'รพ.สมเด็จพระยุพราชตะพานหิน', '192.168.20.10', 'Ubuntu 22.04 LTS', 'HOSxP', 'Active')}
                                                    className="text-[#006BB4] font-semibold hover:underline cursor-pointer"
                                                >
                                                    เลือกมุมมอง
                                                </button>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50">
                                            <td className="p-3 font-mono font-semibold">004</td>
                                            <td className="p-3 font-medium text-slate-800">รพ.บางมูลนาก</td>
                                            <td className="p-3 font-mono text-slate-600">192.168.30.15</td>
                                            <td className="p-3 text-slate-600">Windows Server 2019</td>
                                            <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Active</span></td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => handleSelectHospital('004', 'รพ.บางมูลนาก', '192.168.30.15', 'Windows Server 2019', 'HOSxP', 'Active')}
                                                    className="text-[#006BB4] font-semibold hover:underline cursor-pointer"
                                                >
                                                    เลือกมุมมอง
                                                </button>
                                            </td>
                                        </tr>
                                        <tr className="hover:bg-slate-50">
                                            <td className="p-3 font-mono font-semibold">005</td>
                                            <td className="p-3 font-medium text-slate-800">รพ.โพทะเล</td>
                                            <td className="p-3 font-mono text-slate-600">192.168.40.8</td>
                                            <td className="p-3 text-slate-600">CentOS 7 / HOSxP</td>
                                            <td className="p-3"><span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">Disconnected</span></td>
                                            <td className="p-3 text-right">
                                                <button
                                                    onClick={() => handleSelectHospital('005', 'รพ.โพทะเล', '192.168.40.8', 'CentOS 7', 'HOSxP', 'Disconnected')}
                                                    className="text-[#006BB4] font-semibold hover:underline cursor-pointer"
                                                >
                                                    เลือกมุมมอง
                                                </button>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                            <button
                                onClick={() => setHospitalModalOpen(false)}
                                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded cursor-pointer"
                            >
                                ปิดหน้าต่าง
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* SECURITY MODULE DETAIL MODAL */}
            {moduleModal.open && (
                <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full flex flex-col overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-[#006BB4]"></span>
                                <h3 className="text-base font-bold text-slate-800">{moduleModal.title}</h3>
                            </div>
                            <button onClick={closeModule} className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                        </div>
                        <div className="p-6 space-y-3">
                            <p className="text-sm text-slate-600 leading-relaxed">{moduleModal.desc}</p>
                            <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">สถานะการทำงานในปัจจุบัน:</span>
                                    <span className="font-semibold text-emerald-600">เปิดใช้งานและกำลังเฝ้าระวังแบบ Real-time</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">หน่วยงานเป้าหมาย:</span>
                                    <span className="font-semibold text-slate-700">{moduleModal.target}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">กฎความปลอดภัย (Ruleset):</span>
                                    <span className="font-mono text-slate-700">Wazuh Ruleset v4.7.2-r3</span>
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                            <button onClick={closeModule} className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded cursor-pointer">
                                ตกลง
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
