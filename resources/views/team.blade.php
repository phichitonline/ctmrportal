<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>รายชื่อทีมงาน MIS Cyber Security Admin - สสจ.พิจิตร (CTMR R3 Phichit)</title>
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

        /* Filter Pills */
        .filter-pill {
            padding: 6px 14px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid #D3DAE6;
            background-color: #FFFFFF;
            color: #535966;
            cursor: pointer;
            transition: all 0.15s;
        }
        .filter-pill:hover {
            border-color: #006BB4;
            color: #006BB4;
        }
        .filter-pill.active {
            background-color: #006BB4;
            border-color: #006BB4;
            color: #FFFFFF;
            font-weight: 600;
        }

        .member-card {
            background: #FFFFFF;
            border: 1px solid #D3DAE6;
            border-radius: 8px;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .member-card:hover {
            border-color: #006BB4;
            box-shadow: 0 4px 14px rgba(0, 107, 180, 0.08);
            transform: translateY(-2px);
        }

        /* Pulse live indicator */
        @keyframes pulse-dot {
            0% { transform: scale(0.95); opacity: 0.8; }
            50% { transform: scale(1.15); opacity: 1; }
            100% { transform: scale(0.95); opacity: 0.8; }
        }
        .pulse-live {
            animation: pulse-dot 2s infinite ease-in-out;
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
                <span>Team Members</span>
            </div>

            <!-- Regional Subtitle -->
            <div class="hidden lg:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs text-slate-500">
                <span class="font-semibold text-[#006BB4]">CTMR R3 Phichit</span>
                <span>•</span>
                <span>ทำเนียบรายชื่อบุคลากรทีม MIS Cyber Security Admin</span>
            </div>
        </div>

        <!-- Right Tools -->
        <div class="flex items-center gap-2 sm:gap-3">
            <a href="/about" class="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition">
                <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                เกี่ยวกับทีมงาน (About)
            </a>

            <a href="/" class="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-[#E8F2FA] text-[#006BB4] hover:bg-[#D3E5F5] rounded text-xs font-semibold transition">
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

            <a href="/about" class="nav-drawer-item">
                <div class="flex items-center">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="16" x2="12" y2="12"></line>
                        <line x1="12" y1="8" x2="12.01" y2="8"></line>
                    </svg>
                    <span>About Us (เกี่ยวกับทีมงาน)</span>
                </div>
            </a>

            <a href="/team" class="nav-drawer-item active">
                <div class="flex items-center">
                    <svg class="nav-icon text-[#006BB4]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>Team Members (รายชื่อทีมงาน)</span>
                </div>
                <span class="text-[10px] bg-sky-100 text-sky-800 font-bold px-1.5 py-0.5 rounded">Active</span>
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

        <!-- HEADER BANNER -->
        <div class="ctmr-card p-6 sm:p-8">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div class="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 text-[#006BB4] rounded-full text-xs font-semibold mb-2">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                        ทีมปฏิบัติการความมั่นคงปลอดภัยสารสนเทศ สสจ.พิจิตร
                    </div>
                    <h1 class="text-2xl font-bold text-slate-900 tracking-tight">
                        ทำเนียบบุคลากรและผู้รับผิดชอบระบบความปลอดภัยทางไซเบอร์
                    </h1>
                    <p class="text-xs sm:text-sm text-slate-500 mt-1">
                        รายชื่อวิศวกรความปลอดภัย นักวิชาการคอมพิวเตอร์ และผู้ประสานงานความมั่นคงปลอดภัยไซเบอร์ประจำโรงพยาบาลในจังหวัดพิจิตร
                    </p>
                </div>

                <!-- Quick Search Input -->
                <div class="w-full md:w-72">
                    <div class="relative">
                        <input type="text" id="memberSearch" onkeyup="searchMembers()" placeholder="ค้นหาชื่อ, ตำแหน่ง หรือโรงพยาบาล..." 
                               class="w-full bg-slate-50 border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006BB4]">
                        <svg class="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    </div>
                </div>
            </div>

            <!-- Unit Filter Tabs -->
            <div class="flex flex-wrap gap-2 pt-6 border-t border-slate-200 mt-6">
                <button class="filter-pill active" onclick="filterCategory('all', this)">ทั้งหมด (8 เจ้าหน้าที่)</button>
                <button class="filter-pill" onclick="filterCategory('soc', this)">SOC & Threat Detection</button>
                <button class="filter-pill" onclick="filterCategory('network', this)">Network & Infrastructure</button>
                <button class="filter-pill" onclick="filterCategory('his', this)">HOSxP / Database Security</button>
                <button class="filter-pill" onclick="filterCategory('pdpa', this)">PDPA & Compliance</button>
            </div>
        </div>

        <!-- MEMBER CARDS GRID -->
        <div id="membersGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            <!-- Member 1: Head of IT / CISO -->
            <div class="member-card p-5 space-y-4" data-category="soc network">
                <div class="flex items-start justify-between">
                    <div class="relative">
                        <!-- Avatar -->
                        <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-[#006BB4] to-sky-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            ณพ
                        </div>
                        <span class="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white" title="On Duty / ปฏิบัติหน้าที่ปกติ"></span>
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-[#006BB4] px-2 py-0.5 rounded">
                        Team Lead
                    </span>
                </div>

                <div>
                    <h3 class="font-bold text-slate-900 text-base">นายณฐพงศ์ ครุฑเทศ</h3>
                    <p class="text-xs text-[#006BB4] font-semibold">หัวหน้าศูนย์เทคโนโลยีสารสนเทศ (CISO)</p>
                    <p class="text-[11px] text-slate-500">กลุ่มงานพัฒนายุทธศาสตร์สาธารณสุข สสจ.พิจิตร</p>
                </div>

                <div class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1">
                    <div class="font-medium text-slate-700">ภารกิจที่รับผิดชอบ:</div>
                    <p class="text-[11px] leading-relaxed text-slate-500">
                        กำกับดูแลสถาปัตยกรรมความปลอดภัยไซเบอร์ระดับจังหวัด, นโยบายตอบสนองเหตุฉุกเฉิน (Incident Commander), ประสานงาน สกมช.
                    </p>
                </div>

                <div class="flex flex-wrap gap-1">
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">CISSP</span>
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Wazuh Admin</span>
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Incident Cmd</span>
                </div>

                <div class="pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                    <div class="flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <span>056-611-131 ต่อ 101</span>
                    </div>
                    <div class="flex items-center gap-2 truncate">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        <span class="font-mono text-[11px] truncate">nathaphong.k@ppho.go.th</span>
                    </div>
                </div>

                <button onclick="viewProfile('นายณฐพงศ์ ครุฑเทศ', 'หัวหน้าศูนย์เทคโนโลยีสารสนเทศ (CISO)', 'สสจ.พิจิตร (Agent 001 - 002)', '056-611-131 ต่อ 101', 'nathaphong.k@ppho.go.th', 'กำกับดูแลระบบรักษาความมั่นคงปลอดภัยไซเบอร์ทั้งหมดในจังหวัดพิจิตร ประสานงานศูนย์ประสานการรักษาความมั่นคงปลอดภัยระบบคอมพิวเตอร์แห่งชาติ (NCSA) และขับเคลื่อนเกณฑ์ความปลอดภัยโรงพยาบาลอัจฉริยะ')" class="w-full py-1.5 bg-slate-50 hover:bg-sky-50 text-[#006BB4] font-semibold text-xs rounded border border-slate-200 hover:border-sky-300 transition">
                    ดูประวัติและโหนดที่รับผิดชอบ
                </button>
            </div>

            <!-- Member 2: Senior SOC Analyst -->
            <div class="member-card p-5 space-y-4" data-category="soc">
                <div class="flex items-start justify-between">
                    <div class="relative">
                        <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            กศ
                        </div>
                        <span class="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"></span>
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                        SOC Lead
                    </span>
                </div>

                <div>
                    <h3 class="font-bold text-slate-900 text-base">นายกิตติศักดิ์ สุขเจริญ</h3>
                    <p class="text-xs text-[#006BB4] font-semibold">วิศวกรความมั่นคงปลอดภัยไซเบอร์ (SOC Lead)</p>
                    <p class="text-[11px] text-slate-500">ศูนย์ปฏิบัติการความมั่นคงปลอดภัย สสจ.พิจิตร</p>
                </div>

                <div class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1">
                    <div class="font-medium text-slate-700">ภารกิจที่รับผิดชอบ:</div>
                    <p class="text-[11px] leading-relaxed text-slate-500">
                        มอนิเตอร์เหตุการณ์ Wazuh SIEM 24 ชม., วิเคราะห์ภัยคุกคาม Threat Hunting, คัดกรอง False Positive และจัดการ Alert ระดับสูง
                    </p>
                </div>

                <div class="flex flex-wrap gap-1">
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">CompTIA Sec+</span>
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Threat Hunting</span>
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">OpenSearch</span>
                </div>

                <div class="pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                    <div class="flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <span>056-611-131 ต่อ 104</span>
                    </div>
                    <div class="flex items-center gap-2 truncate">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        <span class="font-mono text-[11px] truncate">kittisak.s@ppho.go.th</span>
                    </div>
                </div>

                <button onclick="viewProfile('นายกิตติศักดิ์ สุขเจริญ', 'วิศวกรความมั่นคงปลอดภัยไซเบอร์ (SOC Lead)', 'รพ.พิจิตร, รพ.โพทะเล, รพ.บางมูลนาก', '056-611-131 ต่อ 104', 'kittisak.s@ppho.go.th', 'ดูแลระบบเฝ้าระวังความปลอดภัยไซเบอร์ การวิเคราะห์พฤติกรรมมัลแวร์ การเฝ้าระวัง Log แม่ข่ายโรงพยาบาลพิจิตร และโรงพยาบาลโซนใต้ของจังหวัด')" class="w-full py-1.5 bg-slate-50 hover:bg-sky-50 text-[#006BB4] font-semibold text-xs rounded border border-slate-200 hover:border-sky-300 transition">
                    ดูประวัติและโหนดที่รับผิดชอบ
                </button>
            </div>

            <!-- Member 3: Network & Infrastructure Engineer -->
            <div class="member-card p-5 space-y-4" data-category="network">
                <div class="flex items-start justify-between">
                    <div class="relative">
                        <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            อพ
                        </div>
                        <span class="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"></span>
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                        Network Eng
                    </span>
                </div>

                <div>
                    <h3 class="font-bold text-slate-900 text-base">นายอนุภาพ มงคลชัย</h3>
                    <p class="text-xs text-[#006BB4] font-semibold">วิศวกรเครือข่ายและความมั่นคงระบบ (Network Admin)</p>
                    <p class="text-[11px] text-slate-500">ศูนย์เทคโนโลยีสารสนเทศ สสจ.พิจิตร</p>
                </div>

                <div class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1">
                    <div class="font-medium text-slate-700">ภารกิจที่รับผิดชอบ:</div>
                    <p class="text-[11px] leading-relaxed text-slate-500">
                        ดูแล Firewall จังหวัด, วง VPN ระหว่างโรงพยาบาล, ระบบป้องกัน DDoS, การทำ Network Segmentation แยกวงผู้ป่วยและระบบ HIS
                    </p>
                </div>

                <div class="flex flex-wrap gap-1">
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">CCNA</span>
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Fortinet NSE</span>
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">VPN/VLAN</span>
                </div>

                <div class="pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                    <div class="flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <span>056-611-131 ต่อ 105</span>
                    </div>
                    <div class="flex items-center gap-2 truncate">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        <span class="font-mono text-[11px] truncate">anuparp.m@ppho.go.th</span>
                    </div>
                </div>

                <button onclick="viewProfile('นายอนุภาพ มงคลชัย', 'วิศวกรเครือข่ายและความมั่นคงระบบ (Network Admin)', 'เครือข่ายเชื่อมต่อ 12 รพ. และวง VPN สาธารณสุข', '056-611-131 ต่อ 105', 'anuparp.m@ppho.go.th', 'ดูแลระบบเครือข่ายส่วนกลาง การตั้งค่าไฟร์วอลล์ สวิตช์ และการตรวจวัดทราฟฟิกผิดปกติเข้าออกหน่วยบริการสาธารณสุขพิจิตร')" class="w-full py-1.5 bg-slate-50 hover:bg-sky-50 text-[#006BB4] font-semibold text-xs rounded border border-slate-200 hover:border-sky-300 transition">
                    ดูประวัติและโหนดที่รับผิดชอบ
                </button>
            </div>

            <!-- Member 4: HIS & Database Security Specialist -->
            <div class="member-card p-5 space-y-4" data-category="his">
                <div class="flex items-start justify-between">
                    <div class="relative">
                        <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-600 to-orange-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            วร
                        </div>
                        <span class="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"></span>
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                        Database Sec
                    </span>
                </div>

                <div>
                    <h3 class="font-bold text-slate-900 text-base">น.ส.วรัญญา ธนสิทธิ์</h3>
                    <p class="text-xs text-[#006BB4] font-semibold">นักวิชาการคอมพิวเตอร์ (HIS & Database Sec)</p>
                    <p class="text-[11px] text-slate-500">กลุ่มงานพัฒนายุทธศาสตร์ สสจ.พิจิตร</p>
                </div>

                <div class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1">
                    <div class="font-medium text-slate-700">ภารกิจที่รับผิดชอบ:</div>
                    <p class="text-[11px] leading-relaxed text-slate-500">
                        ดูแลความมั่นคงปลอดภัยฐานข้อมูล MySQL/PostgreSQL สำหรับ HOSxP และ JHCIS, เฝ้าระวัง SQL Injection, สำรองข้อมูลแบบ Immutable
                    </p>
                </div>

                <div class="flex flex-wrap gap-1">
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">HOSxP Cert</span>
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">MySQL DBA</span>
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Backup Sec</span>
                </div>

                <div class="pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                    <div class="flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <span>056-611-131 ต่อ 106</span>
                    </div>
                    <div class="flex items-center gap-2 truncate">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        <span class="font-mono text-[11px] truncate">waranya.t@ppho.go.th</span>
                    </div>
                </div>

                <button onclick="viewProfile('น.ส.วรัญญา ธนสิทธิ์', 'นักวิชาการคอมพิวเตอร์ (HIS & Database Sec)', 'รพ.สมเด็จพระยุพราชตะพานหิน, รพ.ทับคล้อ, รพ.วังทรายพูน', '056-611-131 ต่อ 106', 'waranya.t@ppho.go.th', 'ดูแลระบบความปลอดภัยฐานข้อมูลผู้ป่วย HOSxP การเข้ารหัสข้อมูลเวชระเบียน (Encryption at rest) และการตรวจสอบความสมบูรณ์ของไฟล์สำรองข้อมูล')" class="w-full py-1.5 bg-slate-50 hover:bg-sky-50 text-[#006BB4] font-semibold text-xs rounded border border-slate-200 hover:border-sky-300 transition">
                    ดูประวัติและโหนดที่รับผิดชอบ
                </button>
            </div>

            <!-- Member 5: PDPA & Compliance Officer -->
            <div class="member-card p-5 space-y-4" data-category="pdpa">
                <div class="flex items-start justify-between">
                    <div class="relative">
                        <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-rose-600 to-pink-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            ภค
                        </div>
                        <span class="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"></span>
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-wider bg-rose-100 text-rose-800 px-2 py-0.5 rounded">
                        DPO Officer
                    </span>
                </div>

                <div>
                    <h3 class="font-bold text-slate-900 text-base">นางภัทราพร ศิริวัฒน์</h3>
                    <p class="text-xs text-[#006BB4] font-semibold">เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO / PDPA)</p>
                    <p class="text-[11px] text-slate-500">กลุ่มงานนิติการและพัฒนายุทธศาสตร์ สสจ.พิจิตร</p>
                </div>

                <div class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1">
                    <div class="font-medium text-slate-700">ภารกิจที่รับผิดชอบ:</div>
                    <p class="text-[11px] leading-relaxed text-slate-500">
                        กำกับดูแลการปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA), นโยบายการเข้าถึงเวชระเบียน, ตรวจสอบสิทธิผู้ใช้งาน (Access Control Audit)
                    </p>
                </div>

                <div class="flex flex-wrap gap-1">
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">DPO Certified</span>
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">PDPA Audit</span>
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Data Privacy</span>
                </div>

                <div class="pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                    <div class="flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <span>056-611-131 ต่อ 108</span>
                    </div>
                    <div class="flex items-center gap-2 truncate">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        <span class="font-mono text-[11px] truncate">pattaraporn.s@ppho.go.th</span>
                    </div>
                </div>

                <button onclick="viewProfile('นางภัทราพร ศิริวัฒน์', 'เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO / PDPA)', 'โรงพยาบาลและ รพ.สต. ทุกแห่งในพิจิตร', '056-611-131 ต่อ 108', 'pattaraporn.s@ppho.go.th', 'ดูแลด้านกฎหมายคุ้มครองข้อมูลสุขภาพและข้อมูลส่วนบุคคล ตรวจสอบบันทึกการประมวลผลข้อมูล (ROPA) และให้คำปรึกษาการส่งต่อข้อมูลเวชระเบียนอิเล็กทรอนิกส์')" class="w-full py-1.5 bg-slate-50 hover:bg-sky-50 text-[#006BB4] font-semibold text-xs rounded border border-slate-200 hover:border-sky-300 transition">
                    ดูประวัติและโหนดที่รับผิดชอบ
                </button>
            </div>

            <!-- Member 6: Endpoint & Vulnerability Analyst -->
            <div class="member-card p-5 space-y-4" data-category="soc">
                <div class="flex items-start justify-between">
                    <div class="relative">
                        <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            ธน
                        </div>
                        <span class="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"></span>
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-wider bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded">
                        Endpoint Sec
                    </span>
                </div>

                <div>
                    <h3 class="font-bold text-slate-900 text-base">นายธนดล วาณิชย์กุล</h3>
                    <p class="text-xs text-[#006BB4] font-semibold">นักวิชาการคอมพิวเตอร์ (Endpoint & Vulnerability)</p>
                    <p class="text-[11px] text-slate-500">ศูนย์เทคโนโลยีสารสนเทศ สสจ.พิจิตร</p>
                </div>

                <div class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1">
                    <div class="font-medium text-slate-700">ภารกิจที่รับผิดชอบ:</div>
                    <p class="text-[11px] leading-relaxed text-slate-500">
                        ติดตั้งและดูแล Wazuh Agent ใน 613 โหนด, สแกนช่องโหว่ซอฟต์แวร์ (CVE Scanning), ตรวจสอบความปลอดภัยเครื่องลูกข่ายห้องฉุกเฉินและ OPD
                    </p>
                </div>

                <div class="flex flex-wrap gap-1">
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">EDR Expert</span>
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">CVE Analyst</span>
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Patch Mgmt</span>
                </div>

                <div class="pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                    <div class="flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <span>056-611-131 ต่อ 107</span>
                    </div>
                    <div class="flex items-center gap-2 truncate">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        <span class="font-mono text-[11px] truncate">thanadol.w@ppho.go.th</span>
                    </div>
                </div>

                <button onclick="viewProfile('นายธนดล วาณิชย์กุล', 'นักวิชาการคอมพิวเตอร์ (Endpoint & Vulnerability)', 'รพ.สามง่าม, รพ.โพธิ์ประทับช้าง, รพ.วชิรบารมี', '056-611-131 ต่อ 107', 'thanadol.w@ppho.go.th', 'รับผิดชอบการติดตั้งและบำรุงรักษา Agent ตรวจสอบช่องโหว่ความปลอดภัยระดับโฮสต์ การอัปเดตระบบปฏิบัติการ และทดสอบการบุกรุกเครื่องลูกข่าย')" class="w-full py-1.5 bg-slate-50 hover:bg-sky-50 text-[#006BB4] font-semibold text-xs rounded border border-slate-200 hover:border-sky-300 transition">
                    ดูประวัติและโหนดที่รับผิดชอบ
                </button>
            </div>

            <!-- Member 7: Cloud & HDC Administrator -->
            <div class="member-card p-5 space-y-4" data-category="network">
                <div class="flex items-start justify-between">
                    <div class="relative">
                        <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-700 to-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            สร
                        </div>
                        <span class="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"></span>
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                        Cloud / HDC
                    </span>
                </div>

                <div>
                    <h3 class="font-bold text-slate-900 text-base">นายสรวิชญ์ เกียรติไพบูลย์</h3>
                    <p class="text-xs text-[#006BB4] font-semibold">ผู้ดูแลระบบคลาวด์และศูนย์ข้อมูล (HDC & Cloud Admin)</p>
                    <p class="text-[11px] text-slate-500">ศูนย์ข้อมูล HDC สำนักงานสาธารณสุขจังหวัดพิจิตร</p>
                </div>

                <div class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1">
                    <div class="font-medium text-slate-700">ภารกิจที่รับผิดชอบ:</div>
                    <p class="text-[11px] leading-relaxed text-slate-500">
                        บริหารจัดการระบบคลาวด์ HDC พิจิตร, Docker Container Microservices, API Gateway ข้อมูลสุขภาพ, การทำ Hardening บน Rocky Linux
                    </p>
                </div>

                <div class="flex flex-wrap gap-1">
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Docker Certified</span>
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Linux Hardening</span>
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">API Sec</span>
                </div>

                <div class="pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                    <div class="flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <span>056-611-131 ต่อ 109</span>
                    </div>
                    <div class="flex items-center gap-2 truncate">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        <span class="font-mono text-[11px] truncate">sorawit.k@ppho.go.th</span>
                    </div>
                </div>

                <button onclick="viewProfile('นายสรวิชญ์ เกียรติไพบูลย์', 'ผู้ดูแลระบบคลาวด์และศูนย์ข้อมูล (HDC & Cloud Admin)', 'ศูนย์ข้อมูล HDC พิจิตร และคลาวด์สาธารณสุข', '056-611-131 ต่อ 109', 'sorawit.k@ppho.go.th', 'บริหารจัดการศูนย์ข้อมูลสาธารณสุขจังหวัดพิจิตร (HDC) ความมั่นคงปลอดภัยของ Docker Container, Web API และการแลกเปลี่ยนข้อมูลตามเกณฑ์มาตรฐานความปลอดภัย')" class="w-full py-1.5 bg-slate-50 hover:bg-sky-50 text-[#006BB4] font-semibold text-xs rounded border border-slate-200 hover:border-sky-300 transition">
                    ดูประวัติและโหนดที่รับผิดชอบ
                </button>
            </div>

            <!-- Member 8: District Hospital Liaison Officer -->
            <div class="member-card p-5 space-y-4" data-category="his soc">
                <div class="flex items-start justify-between">
                    <div class="relative">
                        <div class="w-14 h-14 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-400 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                            ปน
                        </div>
                        <span class="w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white absolute bottom-0 right-0"></span>
                    </div>
                    <span class="text-[10px] font-bold uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded">
                        Hospital Liaison
                    </span>
                </div>

                <div>
                    <h3 class="font-bold text-slate-900 text-base">น.ส.ปนัดดา พรหมมา</h3>
                    <p class="text-xs text-[#006BB4] font-semibold">นักวิชาการสาธารณสุข (ผู้ประสานงาน MIS เครือข่าย รพช.)</p>
                    <p class="text-[11px] text-slate-500">กลุ่มงานพัฒนายุทธศาสตร์ สสจ.พิจิตร</p>
                </div>

                <div class="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1">
                    <div class="font-medium text-slate-700">ภารกิจที่รับผิดชอบ:</div>
                    <p class="text-[11px] leading-relaxed text-slate-500">
                        ประสานงานทีม MIS Admin โรงพยาบาลชุมชนและ รพ.สต. ทั้งจังหวัด, จัดทำแบบประเมิน Cyber Hygiene, จัดอบรมความตระหนักรู้ (Awareness)
                    </p>
                </div>

                <div class="flex flex-wrap gap-1">
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Cyber Hygiene</span>
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Hospital MIS</span>
                    <span class="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">Awareness</span>
                </div>

                <div class="pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                    <div class="flex items-center gap-2">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        <span>056-611-131 ต่อ 110</span>
                    </div>
                    <div class="flex items-center gap-2 truncate">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        <span class="font-mono text-[11px] truncate">panadda.p@ppho.go.th</span>
                    </div>
                </div>

                <button onclick="viewProfile('น.ส.ปนัดดา พรหมมา', 'นักวิชาการสาธารณสุข (ผู้ประสานงาน MIS เครือข่าย รพช.)', 'รพ.สากเหล็ก, รพ.บึงนาราง, รพ.ดงเจริญ', '056-611-131 ต่อ 110', 'panadda.p@ppho.go.th', 'ประสานงานการขับเคลื่อนความปลอดภัยไซเบอร์กับโรงพยาบาลชุมชนและ รพ.สต. การจัดอบรมสร้างความตระหนักรู้ด้าน Phishing และการป้องกันข้อมูลรั่วไหล')" class="w-full py-1.5 bg-slate-50 hover:bg-sky-50 text-[#006BB4] font-semibold text-xs rounded border border-slate-200 hover:border-sky-300 transition">
                    ดูประวัติและโหนดที่รับผิดชอบ
                </button>
            </div>

        </div>

        <!-- FOOTER BAR -->
        <footer class="text-center py-6 text-xs text-slate-400 border-t border-slate-200 mt-8 space-y-1">
            <p>CTMR R3 Phichit MIS Admin Portal • ศูนย์เทคโนโลยีสารสนเทศ สำนักงานสาธารณสุขจังหวัดพิจิตร</p>
            <p class="text-[11px] text-slate-400">ระบบบริหารจัดการทีมงานและการเฝ้าระวังความมั่นคงปลอดภัยสารสนเทศ สสจ.พิจิตร</p>
        </footer>

    </main>

    <!-- PROFILE DETAIL MODAL -->
    <div id="profileModal" class="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 hidden">
        <div class="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full flex flex-col overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-[#006BB4]"></span>
                    <h3 id="modalName" class="text-base font-bold text-slate-800">ข้อมูลเจ้าหน้าที่</h3>
                </div>
                <button onclick="closeProfileModal()" class="text-slate-400 hover:text-slate-600 p-1 rounded">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div class="p-6 space-y-4 text-xs">
                <div>
                    <div class="text-slate-400 text-[11px] font-semibold uppercase">ตำแหน่งหน้าที่</div>
                    <div id="modalPosition" class="text-sm font-bold text-[#006BB4] mt-0.5"></div>
                </div>

                <div class="bg-slate-50 border border-slate-200 rounded p-3 space-y-2">
                    <div class="flex justify-between">
                        <span class="text-slate-500">โหนดโรงพยาบาลที่กำกับดูแล:</span>
                        <span id="modalNodes" class="font-semibold text-slate-800 text-right"></span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-500">เบอร์โทรศัพท์โต๊ะทำงาน:</span>
                        <span id="modalPhone" class="font-mono text-slate-700 font-semibold"></span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-500">อีเมลทางราชการ:</span>
                        <span id="modalEmail" class="font-mono text-slate-700"></span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-500">สถานะความพร้อม:</span>
                        <span class="font-semibold text-emerald-600 flex items-center gap-1">
                            <span class="w-2 h-2 rounded-full bg-emerald-500"></span> พร้อมปฏิบัติงาน (Active On Duty)
                        </span>
                    </div>
                </div>

                <div>
                    <div class="text-slate-400 text-[11px] font-semibold uppercase mb-1">ขอบข่ายความรับผิดชอบเชิงลึก</div>
                    <p id="modalDetail" class="text-slate-600 leading-relaxed bg-white border border-slate-200 p-3 rounded"></p>
                </div>
            </div>

            <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button onclick="closeProfileModal()" class="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded">
                    ปิดหน้าต่าง
                </button>
            </div>
        </div>
    </div>

    <!-- SCRIPTS -->
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

        // Filter Category
        function filterCategory(category, btn) {
            document.querySelectorAll('.filter-pill').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');

            const cards = document.querySelectorAll('.member-card');
            cards.forEach(card => {
                if (category === 'all' || card.getAttribute('data-category').includes(category)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        // Search Members
        function searchMembers() {
            const query = document.getElementById('memberSearch').value.toLowerCase();
            const cards = document.querySelectorAll('.member-card');
            cards.forEach(card => {
                const text = card.innerText.toLowerCase();
                if (text.includes(query)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        // View Profile Modal
        function viewProfile(name, position, nodes, phone, email, detail) {
            document.getElementById('modalName').innerText = name;
            document.getElementById('modalPosition').innerText = position;
            document.getElementById('modalNodes').innerText = nodes;
            document.getElementById('modalPhone').innerText = phone;
            document.getElementById('modalEmail').innerText = email;
            document.getElementById('modalDetail').innerText = detail;
            document.getElementById('profileModal').classList.remove('hidden');
        }

        function closeProfileModal() {
            document.getElementById('profileModal').classList.add('hidden');
        }
    </script>
</body>
</html>
