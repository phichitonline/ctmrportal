<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About Us - ทีมรักษาความมั่นคงปลอดภัยไซเบอร์ สสจ.พิจิตร (CTMR R3 Phichit)</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Sarabun:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    @vite(['resources/css/app.css', 'resources/js/app.js'])
    <style>
        body {
            font-family: 'Inter', 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #F5F7FA;
            color: #343741;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }

        .ctmr-navbar {
            height: 48px;
            background-color: #FFFFFF;
            border-bottom: 1px solid #D3DAE6;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            position: sticky;
            top: 0;
            z-index: 1000;
        }

        .ctmr-nav-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 6px;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #343741;
            transition: background 0.15s ease;
        }

        .ctmr-nav-btn:hover {
            background-color: #F0F4F8;
        }

        .ctmr-breadcrumb-pill {
            background-color: #D3E5F5;
            color: #006BB4;
            font-size: 13px;
            font-weight: 600;
            padding: 4px 18px;
            border-radius: 4px;
            clip-path: polygon(8px 0%, 100% 0%, calc(100% - 8px) 100%, 0% 100%);
            display: inline-flex;
            align-items: center;
            letter-spacing: 0.01em;
            cursor: pointer;
            transition: all 0.15s ease;
            text-decoration: none;
        }

        .ctmr-breadcrumb-pill:hover {
            background-color: #C2DCF2;
        }

        .ctmr-breadcrumb-inactive {
            color: #535966;
            font-size: 13px;
            font-weight: 500;
            padding: 4px 10px;
            text-decoration: none;
            border-radius: 4px;
            transition: all 0.15s;
        }
        .ctmr-breadcrumb-inactive:hover {
            background-color: #F0F4F8;
            color: #006BB4;
        }

        .ctmr-card {
            background-color: #FFFFFF;
            border: 1px solid #D3DAE6;
            border-radius: 6px;
            position: relative;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
        }

        .ctmr-pill-badge {
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background-color: #FFFFFF;
            border: 1px solid #D3DAE6;
            border-radius: 9999px;
            padding: 2px 18px;
            font-size: 11px;
            font-weight: 700;
            letter-spacing: 0.06em;
            color: #343741;
            text-transform: uppercase;
            white-space: nowrap;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
            z-index: 10;
        }

        /* Sidebar Navigation Drawer */
        .ctmr-drawer {
            position: fixed;
            top: 48px;
            left: 0;
            bottom: 0;
            width: 260px;
            background-color: #FFFFFF;
            border-right: 1px solid #D3DAE6;
            z-index: 999;
            transform: translateX(-100%);
            transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            box-shadow: 4px 0 16px rgba(0, 0, 0, 0.08);
        }

        .ctmr-drawer.open {
            transform: translateX(0);
        }

        .ctmr-drawer-backdrop {
            position: fixed;
            top: 48px;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.25);
            z-index: 998;
            opacity: 0;
            pointer-events: none;
            transition: opacity 0.2s ease;
        }

        .ctmr-drawer-backdrop.open {
            opacity: 1;
            pointer-events: auto;
        }

        .nav-drawer-item {
            padding: 10px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            color: #343741;
            text-decoration: none;
            font-size: 13.5px;
            font-weight: 500;
            border-bottom: 1px solid #F0F4F8;
            transition: background 0.15s;
        }

        .nav-drawer-item:hover, .nav-drawer-item.active {
            background-color: #F5F8FC;
            color: #006BB4;
            font-weight: 600;
        }

        .nav-drawer-item .nav-icon {
            width: 18px;
            height: 18px;
            margin-right: 12px;
            color: #535966;
        }

        .nav-drawer-item:hover .nav-icon, .nav-drawer-item.active .nav-icon {
            color: #006BB4;
        }

        .step-circle {
            width: 32px;
            height: 32px;
            border-radius: 50%;
            background-color: #D3E5F5;
            color: #006BB4;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
            flex-shrink: 0;
        }
    </style>
</head>
<body>

    <!-- TOP NAVBAR -->
    <header class="ctmr-navbar">
        <div class="flex items-center gap-2 sm:gap-3">
            <!-- Sidebar toggle button -->
            <button id="drawerToggle" class="ctmr-nav-btn" title="Toggle Navigation Menu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>

            <div class="h-5 w-px bg-slate-200"></div>

            <!-- Shield Logo -->
            <a href="/" class="flex items-center gap-2 text-decoration-none" title="Go to home page">
                <div class="w-7 h-7 flex items-center justify-center text-[#006BB4]">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="#E8F2FA" stroke="#006BB4"></path>
                        <path d="M9 12l2 2 4-4" stroke="#006BB4" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5"></path>
                    </svg>
                </div>
            </a>

            <!-- Breadcrumbs -->
            <a href="/" class="ctmr-breadcrumb-inactive hidden sm:inline-block">Overview</a>
            <span class="text-slate-300 hidden sm:inline-block">/</span>
            <div class="ctmr-breadcrumb-pill">
                <span>About Team</span>
            </div>

            <!-- Regional Subtitle -->
            <div class="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs text-slate-500">
                <span class="font-semibold text-[#006BB4]">CTMR R3 Phichit</span>
                <span>•</span>
                <span>ศูนย์ปฏิบัติการความมั่นคงปลอดภัยไซเบอร์ สสจ.พิจิตร (Cyber Security Operations)</span>
            </div>
        </div>

        <!-- Right Quick Links -->
        <div class="flex items-center gap-2 sm:gap-3">
            <a href="/team" class="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#E8F2FA] text-[#006BB4] hover:bg-[#D3E5F5] rounded text-xs font-semibold transition">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                รายชื่อทีมงาน MIS Admin
            </a>

            <a href="/" class="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                กลับหน้าแดชบอร์ด
            </a>

            <!-- Avatar -->
            <div class="w-7 h-7 rounded-full bg-[#F5A35C] text-white flex items-center justify-center font-semibold text-xs shadow-sm" title="ผู้ดูแลระบบ MIS Admin พิจิตร (ctmr-admin)">
                d
            </div>
        </div>
    </header>

    <!-- NAVIGATION DRAWER (SIDEBAR) -->
    <div id="drawerBackdrop" class="ctmr-drawer-backdrop"></div>
    <aside id="navDrawer" class="ctmr-drawer">
        <div class="p-3 border-b border-slate-200 flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500">MIS Navigation Menu</span>
            <button id="drawerClose" class="text-slate-400 hover:text-slate-600 p-1">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>

        <div class="py-1">
            <a href="/" class="nav-drawer-item">
                <div class="flex items-center">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                        <polyline points="9 22 9 12 15 12 15 22"></polyline>
                    </svg>
                    <span>Home (แดชบอร์ดหลัก)</span>
                </div>
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>

            <a href="/about" class="nav-drawer-item active">
                <div class="flex items-center">
                    <svg class="nav-icon text-[#006BB4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>About Us (เกี่ยวกับทีมงาน)</span>
                </div>
                <span class="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">Active</span>
            </a>

            <a href="/team" class="nav-drawer-item">
                <div class="flex items-center">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>Team Members (รายชื่อทีมงาน)</span>
                </div>
                <span class="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full">12 คน</span>
            </a>

            <div class="my-2 border-t border-slate-200"></div>

            <a href="/#threat-hunting" class="nav-drawer-item">
                <div class="flex items-center">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <span>Threat Hunting (ตรวจจับภัยคุกคาม)</span>
                </div>
            </a>

            <a href="/#endpoint-security" class="nav-drawer-item">
                <div class="flex items-center">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                    <span>Endpoint Security</span>
                </div>
            </a>

            <a href="/#security-operations" class="nav-drawer-item">
                <div class="flex items-center">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <span>PDPA & Cyber Security Act</span>
                </div>
            </a>
        </div>
    </aside>

    <!-- MAIN CONTENT -->
    <main class="max-w-[1400px] mx-auto p-4 sm:p-6 space-y-6">

        <!-- HERO BANNER CARD -->
        <div class="ctmr-card p-6 sm:p-8 bg-gradient-to-r from-white via-white to-sky-50/60 overflow-hidden">
            <div class="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div class="space-y-3 max-w-3xl">
                    <div class="inline-flex items-center gap-2 px-3 py-1 bg-sky-100/80 border border-sky-200 text-[#006BB4] rounded-full text-xs font-semibold">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                        ศูนย์ปฏิบัติการความมั่นคงปลอดภัยไซเบอร์ (CSOC) สสจ.พิจิตร
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                        ทีมบริหารจัดการความมั่นคงปลอดภัยสารสนเทศและไซเบอร์ (MIS Cyber Security Admin)
                    </h1>
                    <p class="text-sm sm:text-base text-slate-600 leading-relaxed">
                        หน่วยงานภายใต้กลุ่มงานพัฒนายุทธศาสตร์สาธารณสุขและเทคโนโลยีสารสนเทศ สำนักงานสาธารณสุขจังหวัดพิจิตร 
                        รับผิดชอบการเฝ้าระวัง ตรวจจับ ป้องกัน และตอบสนองต่อภัยคุกคามทางไซเบอร์ที่อาจส่งผลกระทบต่อระบบบริการสุขภาพและข้อมูลเวชระเบียนผู้ป่วยของโรงพยาบาลทุกแห่งในจังหวัดพิจิตร
                    </p>
                    <div class="flex flex-wrap gap-4 pt-2">
                        <div class="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-xs">
                            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                            เฝ้าระวัง 24/7 SIEM & EDR
                        </div>
                        <div class="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-xs">
                            <span class="w-2 h-2 rounded-full bg-sky-500"></span>
                            ครอบคลุม 12 รพ. + 120 รพ.สต.
                        </div>
                        <div class="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-xs">
                            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                            มาตรฐาน พ.ร.บ. ไซเบอร์ & PDPA
                        </div>
                    </div>
                </div>

                <!-- Stats summary badge block -->
                <div class="grid grid-cols-2 gap-3 w-full lg:w-auto flex-shrink-0">
                    <div class="bg-white border border-slate-200 rounded-lg p-4 text-center shadow-xs">
                        <div class="text-2xl font-bold text-[#006BB4]">613</div>
                        <div class="text-xs text-slate-500 mt-0.5">เครื่องแม่ข่าย & ลูกข่าย</div>
                    </div>
                    <div class="bg-white border border-slate-200 rounded-lg p-4 text-center shadow-xs">
                        <div class="text-2xl font-bold text-emerald-600">12</div>
                        <div class="text-xs text-slate-500 mt-0.5">โรงพยาบาลในเครือข่าย</div>
                    </div>
                    <div class="bg-white border border-slate-200 rounded-lg p-4 text-center shadow-xs">
                        <div class="text-2xl font-bold text-amber-600">99.9%</div>
                        <div class="text-xs text-slate-500 mt-0.5">System Availability</div>
                    </div>
                    <div class="bg-white border border-slate-200 rounded-lg p-4 text-center shadow-xs">
                        <div class="text-2xl font-bold text-purple-600">&lt; 15 นาที</div>
                        <div class="text-xs text-slate-500 mt-0.5">Incident Response SLA</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 3 KEY PILLARS (MISSION, SCOPE, SECURITY ARCHITECTURE) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">

            <!-- Card 1: ภารกิจหลัก -->
            <div class="ctmr-card p-6 pt-7">
                <div class="ctmr-pill-badge">MISSION & OBJECTIVES</div>
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-lg bg-sky-100 text-[#006BB4] flex items-center justify-center font-bold">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <h3 class="font-bold text-slate-800 text-base">วิสัยทัศน์และภารกิจหลัก</h3>
                </div>
                <ul class="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <li class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        <span>ปกป้องระบบสารสนเทศโรงพยาบาล (HIS/HOSxP) และฐานข้อมูล HDC พิจิตร ให้มีความปลอดภัยและพร้อมให้บริการต่อเนื่อง</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        <span>ป้องกันการรั่วไหลของข้อมูลเวชระเบียนและข้อมูลสุขภาพส่วนบุคคลของผู้ป่วย (PDPA & HIPAA Compliance)</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        <span>ตรวจจับและยับยั้งมัลแวร์เรียกค่าไถ่ (Ransomware) และการโจมตีทางไซเบอร์ในทุกจุดเชื่อมต่อ</span>
                    </li>
                </ul>
            </div>

            <!-- Card 2: ขอบเขตงานรับผิดชอบ -->
            <div class="ctmr-card p-6 pt-7">
                <div class="ctmr-pill-badge">OPERATIONAL SCOPE</div>
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <h3 class="font-bold text-slate-800 text-base">ขอบเขตงานรับผิดชอบ</h3>
                </div>
                <ul class="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <li class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        <span><strong>แม่ข่ายและศูนย์ข้อมูล:</strong> PPHO Data Center, Health Cloud Server, Virtual Machines, Docker Containers</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        <span><strong>เครือข่ายโรงพยาบาล:</strong> รพ.พิจิตร, รพ.สมเด็จพระยุพราชตะพานหิน และ รพช. อีก 10 แห่ง รวมถึง รพ.สต. ในสังกัด</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <svg class="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
                        <span><strong>ระบบบริหารจัดการ:</strong> Wazuh Security Platform, OpenSearch SIEM, Active Directory, Firewalls และ VPN Gateway</span>
                    </li>
                </ul>
            </div>

            <!-- Card 3: กรอบมาตรฐานสากล -->
            <div class="ctmr-card p-6 pt-7">
                <div class="ctmr-pill-badge">COMPLIANCE & STANDARDS</div>
                <div class="flex items-center gap-3 mb-4">
                    <div class="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                    </div>
                    <h3 class="font-bold text-slate-800 text-base">กรอบมาตรฐานการกำกับดูแล</h3>
                </div>
                <ul class="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                    <li class="flex items-start gap-2">
                        <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">CII</span>
                        <span>พ.ร.บ. การรักษาความมั่นคงปลอดภัยไซเบอร์ พ.ศ. 2562 (หน่วยงานโครงสร้างพื้นฐานสำคัญทางสารสนเทศ)</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">PDPA</span>
                        <span>พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 มาตรการรักษาความมั่นคงปลอดภัยข้อมูลสุขภาพ</span>
                    </li>
                    <li class="flex items-start gap-2">
                        <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">NIST</span>
                        <span>NIST Cybersecurity Framework (CSF) & CIS Critical Security Controls v8</span>
                    </li>
                </ul>
            </div>

        </div>

        <!-- INCIDENT RESPONSE WORKFLOW -->
        <div class="ctmr-card p-6 pt-7">
            <div class="ctmr-pill-badge">INCIDENT RESPONSE WORKFLOW</div>
            <h3 class="font-bold text-slate-800 text-base mb-2">ขั้นตอนการรับมือและตอบสนองต่อเหตุการณ์ภัยคุกคามไซเบอร์ (SOP Incident Response)</h3>
            <p class="text-xs sm:text-sm text-slate-500 mb-6">แนวทางการปฏิบัติงานร่วมกันระหว่างทีม MIS Admin สสจ.พิจิตร และโรงพยาบาลทุกแห่งเมื่อตรวจพบภัยคุกคาม</p>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <!-- Step 1 -->
                <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                    <div class="flex items-center gap-2">
                        <div class="step-circle">1</div>
                        <span class="font-bold text-slate-800 text-sm">ตรวจจับและแจ้งเตือน</span>
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed">
                        Wazuh Agent ตรวจจับ Event ผิดปกติ (Brute force, File modification หรือ Malware) แล้วส่งแจ้งเตือนผ่าน Telegram/LINE Notify ถึงทีม Admin
                    </p>
                </div>

                <!-- Step 2 -->
                <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                    <div class="flex items-center gap-2">
                        <div class="step-circle">2</div>
                        <span class="font-bold text-slate-800 text-sm">วิเคราะห์คัดกรอง</span>
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed">
                        เจ้าหน้าที่ SOC ตรวจสอบ Log, IP ต้นทาง, เทคนิค MITRE ATT&CK เพื่อประเมินระดับความรุนแรง (Level 1–15) ภายใน 15 นาที
                    </p>
                </div>

                <!-- Step 3 -->
                <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                    <div class="flex items-center gap-2">
                        <div class="step-circle">3</div>
                        <span class="font-bold text-slate-800 text-sm">จำกัดวงความเสียหาย</span>
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed">
                        สั่งการตัดการเชื่อมต่อเครือข่ายของโหนดที่ได้รับผลกระทบ (Isolation) และบล็อก IP ผู้โจมตีที่ Firewall ทันทีเพื่อปกป้องระบบส่วนรวม
                    </p>
                </div>

                <!-- Step 4 -->
                <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                    <div class="flex items-center gap-2">
                        <div class="step-circle">4</div>
                        <span class="font-bold text-slate-800 text-sm">กวาดล้างและฟื้นฟู</span>
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed">
                        กำจัดมัลแวร์ อุดช่องโหว่ (Patch) และกู้คืนข้อมูลจากระบบสำรอง (Immutable Backup) พร้อมตรวจสอบความถูกต้องครบถ้วนของฐานข้อมูล
                    </p>
                </div>

                <!-- Step 5 -->
                <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                    <div class="flex items-center gap-2">
                        <div class="step-circle">5</div>
                        <span class="font-bold text-slate-800 text-sm">สรุปและรายงาน สกมช.</span>
                    </div>
                    <p class="text-xs text-slate-600 leading-relaxed">
                        จัดทำรายงาน Incident Report ส่งผู้บริหาร สสจ. และรายงานศูนย์ประสานการรักษาความมั่นคงปลอดภัยไซเบอร์ (NCSA/CERT) ตามเกณฑ์กฎหมาย
                    </p>
                </div>
            </div>
        </div>

        <!-- EMERGENCY CONTACT & REPORTING CARD -->
        <div class="ctmr-card p-6 pt-7 bg-white">
            <div class="ctmr-pill-badge">CONTACT & EMERGENCY REPORTING</div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div class="space-y-3">
                    <div class="flex items-center gap-2 text-rose-600 font-bold text-sm">
                        <span class="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                        ศูนย์ประสานงานรับแจ้งเหตุการณ์ไซเบอร์ฉุกเฉิน (24/7 Hotlines)
                    </div>
                    <h3 class="text-lg font-bold text-slate-800">
                        พบเหตุผิดปกติหรือต้องการความช่วยเหลือด้านความปลอดภัยสารสนเทศ
                    </h3>
                    <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
                        หากโรงพยาบาลหรือหน่วยงานสาธารณสุขในจังหวัดพิจิตรพบข้อความเรียกค่าไถ่, ระบบ HOSxP เข้าไม่ได้ผิดปกติ, หรือตรวจพบการเข้าถึงข้อมูลโดยไม่ได้รับอนุญาต โปรดติดต่อทีม MIS Admin ทันที
                    </p>
                    <div class="flex flex-wrap gap-3 pt-1">
                        <a href="/team" class="inline-flex items-center gap-2 px-4 py-2 bg-[#006BB4] hover:bg-[#004F85] text-white rounded text-xs font-semibold shadow-xs transition">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                            ดูรายชื่อและเบอร์ติดต่อทีมงาน (Team Directory)
                        </a>
                        <a href="/" class="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition">
                            ไปยังหน้าแดชบอร์ดหลัก
                        </a>
                    </div>
                </div>

                <!-- Contact details table -->
                <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 text-xs">
                    <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span class="text-slate-500">สถานที่ปฏิบัติงาน:</span>
                        <span class="font-medium text-slate-800 text-right">ศูนย์ข้อมูลเทคโนโลยีสารสนเทศ ชั้น 3 สสจ.พิจิตร</span>
                    </div>
                    <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span class="text-slate-500">โทรศัพท์สายตรง (ห้อง MIS):</span>
                        <span class="font-mono font-bold text-[#006BB4]">056-611-131 ต่อ 104, 105</span>
                    </div>
                    <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span class="text-slate-500">สายด่วนฉุกเฉิน (Hotline 24 ชม.):</span>
                        <span class="font-mono font-bold text-rose-600">089-xxx-xxxx (หัวหน้ากลุ่มงาน MIS)</span>
                    </div>
                    <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                        <span class="text-slate-500">อีเมลทางการรับแจ้งเหตุ:</span>
                        <span class="font-mono font-medium text-slate-700">cybersec@ppho.go.th</span>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-slate-500">LINE Official Group:</span>
                        <span class="font-medium text-emerald-700 font-mono">@MIS-Phichit-Cyber</span>
                    </div>
                </div>
            </div>

        </div>

        <!-- FOOTER BAR -->
        <footer class="text-center py-6 text-xs text-slate-400 border-t border-slate-200 mt-8 space-y-1">
            <p>CTMR R3 Phichit MIS Admin Portal • ศูนย์เทคโนโลยีสารสนเทศ สำนักงานสาธารณสุขจังหวัดพิจิตร</p>
            <p class="text-[11px] text-slate-400">ระบบปฏิบัติการรักษาความมั่นคงปลอดภัยไซเบอร์สาธารณสุข จังหวัดพิจิตร</p>
        </footer>

    </main>

    <!-- DRAWER SCRIPT -->
    <script>
        const drawerToggle = document.getElementById('drawerToggle');
        const drawerClose = document.getElementById('drawerClose');
        const navDrawer = document.getElementById('navDrawer');
        const drawerBackdrop = document.getElementById('drawerBackdrop');

        function toggleDrawer(open) {
            if (open) {
                navDrawer.classList.add('open');
                drawerBackdrop.classList.add('open');
            } else {
                navDrawer.classList.remove('open');
                drawerBackdrop.classList.remove('open');
            }
        }

        drawerToggle.addEventListener('click', () => toggleDrawer(true));
        drawerClose.addEventListener('click', () => toggleDrawer(false));
        drawerBackdrop.addEventListener('click', () => toggleDrawer(false));
    </script>
</body>
</html>
