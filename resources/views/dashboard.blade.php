<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CTMR R3 Phichit - MIS Admin Dashboard (สสจ.พิจิตร)</title>
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
        }

        .ctmr-breadcrumb-pill:hover {
            background-color: #C2DCF2;
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

        .ctmr-module-item {
            background-color: #FFFFFF;
            border: 1px solid #D3DAE6;
            border-radius: 6px;
            padding: 16px 18px;
            display: flex;
            align-items: flex-start;
            gap: 16px;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
            text-decoration: none;
            color: inherit;
        }

        .ctmr-module-item:hover {
            border-color: #006BB4;
            box-shadow: 0 4px 12px rgba(0, 107, 180, 0.08);
            transform: translateY(-1px);
        }

        .ctmr-module-item:hover .ctmr-module-title {
            color: #006BB4;
        }

        .ctmr-module-icon {
            flex-shrink: 0;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #343741;
        }

        .ctmr-module-item:hover .ctmr-module-icon {
            color: #006BB4;
        }

        .ctmr-module-title {
            font-size: 14.5px;
            font-weight: 600;
            color: #1A1C21;
            margin-bottom: 4px;
            transition: color 0.15s;
        }

        .ctmr-module-desc {
            font-size: 12px;
            color: #535966;
            line-height: 1.45;
            margin: 0;
        }

        /* Sidebar Navigation Drawer */
        .ctmr-drawer {
            position: fixed;
            top: 48px;
            left: 0;
            bottom: 0;
            width: 250px;
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

        /* Tooltip style */
        .tooltip-badge {
            position: relative;
        }
        .tooltip-badge:hover::after {
            content: attr(data-tooltip);
            position: absolute;
            bottom: -32px;
            left: 50%;
            transform: translateX(-50%);
            background: #1F232B;
            color: #FFFFFF;
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            white-space: nowrap;
            z-index: 100;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
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
        <div class="flex items-center gap-3">
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

            <!-- Breadcrumb Overview Pill -->
            <div class="ctmr-breadcrumb-pill tooltip-badge" data-tooltip="Overview Dashboard">
                <span>Overview</span>
            </div>

            <!-- Regional Banner Text for Phichit MIS Admin -->
            <div class="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 text-xs text-slate-500">
                <span class="font-semibold text-[#006BB4]">CTMR R3 Phichit</span>
                <span>•</span>
                <span>ระบบบริหารจัดการความปลอดภัยสารสนเทศ สสจ.พิจิตร</span>
                <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 pulse-live"></span> Live Node
                </span>
            </div>
        </div>

        <!-- Right Tools & User Profile -->
        <div class="flex items-center gap-3">
            <!-- Node Selector Filter -->
            <div class="hidden lg:flex items-center text-xs">
                <span class="text-slate-400 mr-1.5 font-medium">มุมมองโหนด:</span>
                <select id="nodeFilter" onchange="filterHospital(this.value)" class="bg-slate-50 border border-slate-300 text-slate-700 text-xs rounded px-2.5 py-1 focus:ring-1 focus:ring-sky-500 focus:outline-none font-medium">
                    <option value="all">ทุกโหนดในจังหวัดพิจิตร (613 Nodes)</option>
                    <option value="001">Agent 001 - แม่ข่ายศูนย์เทคโนโลยี สสจ.พิจิตร</option>
                    <option value="002" selected>Agent 002 - โรงพยาบาลพิจิตร (HIS/HOSxP)</option>
                    <option value="003">Agent 003 - รพ.สมเด็จพระยุพราชตะพานหิน</option>
                    <option value="004">Agent 004 - รพ.บางมูลนาก</option>
                    <option value="005">Agent 005 - รพ.โพทะเล</option>
                    <option value="006">Agent 006 - รพ.สามง่าม</option>
                    <option value="007">Agent 007 - รพ.ทับคล้อ</option>
                    <option value="008">Agent 008 - รพ.วังทรายพูน</option>
                    <option value="009">Agent 009 - รพ.โพธิ์ประทับช้าง</option>
                    <option value="010">Agent 010 - รพ.วชิรบารมี</option>
                    <option value="011">Agent 011 - รพ.สากเหล็ก</option>
                    <option value="012">Agent 012 - รพ.บึงนาราง</option>
                    <option value="013">Agent 013 - รพ.ดงเจริญ</option>
                </select>
            </div>

            <!-- Quick Nav Links: About & Team -->
            <div class="hidden xl:flex items-center gap-1.5 border-l border-slate-200 pl-2">
                <a href="/about" class="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded transition flex items-center gap-1">
                    <svg class="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                    เกี่ยวกับทีมงาน
                </a>
                <a href="/team" class="px-2.5 py-1 bg-[#E8F2FA] hover:bg-[#D3E5F5] text-[#006BB4] text-xs font-semibold rounded transition flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                    รายชื่อทีมงาน (12 คน)
                </a>
            </div>

            <!-- Time Filter -->
            <div class="hidden sm:flex items-center bg-slate-100 px-2.5 py-1 rounded text-xs text-slate-600 font-medium">
                <svg class="w-3.5 h-3.5 mr-1 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke-width="2"></circle>
                    <polyline points="12 6 12 12 16 14" stroke-width="2"></polyline>
                </svg>
                <span>24 ชั่วโมงล่าสุด</span>
            </div>

            <!-- Refresh Button -->
            <button onclick="refreshData()" class="ctmr-nav-btn text-slate-600" title="รีเฟรชข้อมูล">
                <svg id="refreshIcon" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                </svg>
            </button>

            <!-- User Avatar (Matches CTMR Peach 'd') -->
            <div class="w-7 h-7 rounded-full bg-[#F5A35C] text-white flex items-center justify-center font-semibold text-xs shadow-sm cursor-pointer" title="ผู้ดูแลระบบ MIS Admin พิจิตร (ctmr-admin)">
                d
            </div>

            <!-- Help Button -->
            <button class="w-6 h-6 rounded-full border border-slate-300 text-slate-500 flex items-center justify-center text-xs font-semibold hover:bg-slate-100" title="ช่วยเหลือ / เอกสารคู่มือ">
                ?
            </button>
        </div>
    </header>

    <!-- NAVIGATION DRAWER BACKDROP -->
    <div id="drawerBackdrop" class="ctmr-drawer-backdrop"></div>

    <!-- NAVIGATION DRAWER (SIDEBAR) -->
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
            <a href="#" class="nav-drawer-item text-slate-500">
                <div class="flex items-center">
                    <span class="text-xs font-bold uppercase tracking-wider">Recently viewed</span>
                </div>
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>

            <a href="/" class="nav-drawer-item active">
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
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
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
                <span class="text-[11px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-full">12 คน</span>
            </a>


            <a href="#threat-hunting" onclick="openModule('Threat Hunting', 'สืบค้นและวิเคราะห์เหตุการณ์ความมั่นคงปลอดภัยสารสนเทศ สสจ.พิจิตร')" class="nav-drawer-item">
                <div class="flex items-center">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <span>Explore (สืบค้นและตรวจจับ)</span>
                </div>
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>

            <a href="#endpoint-security" class="nav-drawer-item">
                <div class="flex items-center">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                    <span>Endpoint security (ความปลอดภัยเครื่องลูกข่าย)</span>
                </div>
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>

            <a href="#threat-intelligence" class="nav-drawer-item">
                <div class="flex items-center">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"></circle>
                        <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                        <path d="M2 12h20"></path>
                    </svg>
                    <span>Threat intelligence (ข่าวกรองภัยคุกคาม)</span>
                </div>
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>

            <a href="#security-operations" class="nav-drawer-item">
                <div class="flex items-center">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                    <span>Security operations (มาตรฐานและการปฏิบัติตามกฎหมาย)</span>
                </div>
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>

            <a href="#cloud-security" class="nav-drawer-item">
                <div class="flex items-center">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"></path>
                    </svg>
                    <span>Cloud security (ความปลอดภัยคลาวด์/HDC)</span>
                </div>
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>

            <a href="javascript:void(0)" onclick="openHospitalModal()" class="nav-drawer-item">
                <div class="flex items-center">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="18" cy="5" r="3"></circle>
                        <circle cx="6" cy="12" r="3"></circle>
                        <circle cx="18" cy="19" r="3"></circle>
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                    </svg>
                    <span>Agents management (โหนด รพ./รพ.สต. 613 แห่ง)</span>
                </div>
                <span class="text-[11px] bg-sky-100 text-sky-800 font-semibold px-2 py-0.5 rounded-full">613</span>
            </a>

            <a href="#" class="nav-drawer-item">
                <div class="flex items-center">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                        <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                        <line x1="6" y1="6" x2="6.01" y2="6"></line>
                        <line x1="6" y1="18" x2="6.01" y2="18"></line>
                    </svg>
                    <span>Server management (เซิร์ฟเวอร์แม่ข่าย)</span>
                </div>
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>

            <a href="#" class="nav-drawer-item">
                <div class="flex items-center">
                    <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                    <span>Indexer management (ดัชนีข้อมูลความปลอดภัย)</span>
                </div>
                <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
            </a>
        </div>

        <div class="mt-auto p-3 border-t border-slate-200 text-xs text-slate-400 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
                <svg class="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Dock navigation
            </span>
            <span class="text-[10px] text-slate-400">v4.7.2</span>
        </div>
    </aside>

    <!-- MAIN DASHBOARD CONTENT -->
    <main class="max-w-[1720px] mx-auto p-4 sm:p-6 space-y-6">

        <!-- HOSPITAL CONTEXT SUB-BAR (MIS Admin Phichit) -->
        <div class="bg-white border border-[#D3DAE6] rounded-md px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div class="flex items-center gap-2.5">
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 pulse-live"></span>
                <span class="font-semibold text-slate-800 text-sm" id="currentAgencyName">สำนักงานสาธารณสุขจังหวัดพิจิตร และโรงพยาบาลเครือข่าย</span>
                <span class="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono border border-slate-200">Agent: 002 (Active)</span>
                <span class="text-xs text-slate-400">|</span>
                <span class="text-xs text-slate-500">IP: 192.168.10.254 • Windows Server 2022 / Rocky Linux • HIS: HOSxP v4 / JHCIS</span>
            </div>

            <div class="flex items-center gap-2">
                <button onclick="openHospitalModal()" class="text-xs text-[#006BB4] hover:underline font-semibold flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    ดูรายชื่อ 12 โรงพยาบาลในพิจิตร
                </button>
                <span class="text-xs text-slate-300">•</span>
                <span class="text-xs text-slate-500">อัปเดตล่าสุด: <span id="lastUpdatedTime" class="font-mono font-medium text-slate-700">14:45:00</span></span>
            </div>
        </div>

        <!-- TOP STATS ROW (AGENTS SUMMARY + LAST 24 HOURS ALERTS) -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

            <!-- AGENTS SUMMARY CARD (4 cols) -->
            <div class="lg:col-span-4 ctmr-card p-6 pt-7">
                <div class="ctmr-pill-badge">AGENTS SUMMARY</div>

                <div class="flex items-center justify-between h-full pt-1">
                    <!-- Donut Chart SVG -->
                    <div class="relative w-36 h-36 flex-shrink-0">
                        <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <!-- Background track circle -->
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#F0F4F8" stroke-width="15" />
                            <!-- Active Agents Arc (418/613 = 68.2%) => circumference = 238.76 => 162.8 dash -->
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#0F8174" stroke-width="15"
                                stroke-dasharray="162.8 238.76" stroke-dashoffset="0"
                                class="transition-all duration-1000 ease-out cursor-pointer hover:opacity-90"
                                title="Active: 418 Agents" />
                            <!-- Disconnected Agents Arc (195/613 = 31.8%) => 75.9 dash -->
                            <circle cx="50" cy="50" r="38" fill="none" stroke="#BD271E" stroke-width="15"
                                stroke-dasharray="75.9 238.76" stroke-dashoffset="-162.8"
                                class="transition-all duration-1000 ease-out cursor-pointer hover:opacity-90"
                                title="Disconnected: 195 Agents" />
                        </svg>

                        <!-- Center Total -->
                        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span class="text-2xl font-bold text-slate-800" id="totalAgentsCount">613</span>
                            <span class="text-[10px] uppercase font-semibold text-slate-400">Total</span>
                        </div>
                    </div>

                    <!-- Legend -->
                    <div class="flex flex-col justify-center gap-3 pl-4">
                        <div class="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition" onclick="filterByStatus('active')">
                            <span class="w-3 h-3 rounded-full bg-[#0F8174]"></span>
                            <span class="text-sm font-medium text-slate-700">Active</span>
                            <span class="text-sm font-bold text-[#0F8174]" id="activeAgentsCount">(418)</span>
                        </div>

                        <div class="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded transition" onclick="filterByStatus('disconnected')">
                            <span class="w-3 h-3 rounded-full bg-[#BD271E]"></span>
                            <span class="text-sm font-medium text-slate-700">Disconnected</span>
                            <span class="text-sm font-bold text-[#BD271E]" id="disconnectedAgentsCount">(195)</span>
                        </div>

                        <div class="pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                            <span>ความครอบคลุมระบบ: <strong>68.2%</strong></span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- LAST 24 HOURS ALERTS CARD (8 cols) -->
            <div class="lg:col-span-8 ctmr-card p-6 pt-7">
                <div class="ctmr-pill-badge">LAST 24 HOURS ALERTS</div>

                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 h-full items-center text-center pt-2">
                    <!-- Critical Severity -->
                    <div class="flex flex-col items-center justify-center p-2 rounded hover:bg-slate-50 transition cursor-pointer" onclick="openAlertDetail('Critical')">
                        <div class="text-sm font-semibold text-slate-800 mb-1">Critical severity</div>
                        <div class="text-4xl font-normal text-[#BD271E] my-1" id="criticalCount">0</div>
                        <div class="text-xs text-slate-500">Rule level 15 or higher</div>
                    </div>

                    <!-- High Severity -->
                    <div class="flex flex-col items-center justify-center p-2 rounded hover:bg-slate-50 transition cursor-pointer" onclick="openAlertDetail('High')">
                        <div class="text-sm font-semibold text-slate-800 mb-1">High severity</div>
                        <div class="text-4xl font-normal text-[#FEC514] my-1" id="highCount">291</div>
                        <div class="text-xs text-slate-500">Rule level 12 to 14</div>
                    </div>

                    <!-- Medium Severity -->
                    <div class="flex flex-col items-center justify-center p-2 rounded hover:bg-slate-50 transition cursor-pointer" onclick="openAlertDetail('Medium')">
                        <div class="text-sm font-semibold text-slate-800 mb-1">Medium severity</div>
                        <div class="text-4xl font-normal text-[#6092C0] my-1 tracking-tight" id="mediumCount">1,098,468</div>
                        <div class="text-xs text-slate-500">Rule level 7 to 11</div>
                    </div>

                    <!-- Low Severity -->
                    <div class="flex flex-col items-center justify-center p-2 rounded hover:bg-slate-50 transition cursor-pointer" onclick="openAlertDetail('Low')">
                        <div class="text-sm font-semibold text-slate-800 mb-1">Low severity</div>
                        <div class="text-4xl font-normal text-[#007871] my-1 tracking-tight" id="lowCount">896,603</div>
                        <div class="text-xs text-slate-500">Rule level 0 to 6</div>
                    </div>
                </div>
            </div>

        </div>

        <!-- 2x2 SECTION GROUPS: ENDPOINT SECURITY & THREAT INTELLIGENCE -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <!-- 1. ENDPOINT SECURITY GROUP -->
            <div class="ctmr-card p-5 pt-7">
                <div class="ctmr-pill-badge">ENDPOINT SECURITY</div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Configuration Assessment -->
                    <a href="#sca" onclick="openModule('Configuration Assessment', 'สแกนตรวจสอบการกำหนดค่าความปลอดภัยเซิร์ฟเวอร์โรงพยาบาลตามมาตรฐาน CIS Benchmark')" class="ctmr-module-item">
                        <div class="ctmr-module-icon">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </div>
                        <div>
                            <div class="ctmr-module-title">Configuration Assessment</div>
                            <p class="ctmr-module-desc">Scan your assets as part of a configuration assessment audit.</p>
                        </div>
                    </a>

                    <!-- Malware Detection -->
                    <a href="#malware" onclick="openModule('Malware Detection', 'ตรวจจับสัญญาณพฤติกรรมมัลแวร์ แรนซัมแวร์ และการโจมตีทางไซเบอร์ต่อฐานข้อมูลสุขภาพ')" class="ctmr-module-item">
                        <div class="ctmr-module-icon">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                            </svg>
                        </div>
                        <div>
                            <div class="ctmr-module-title">Malware Detection</div>
                            <p class="ctmr-module-desc">Check indicators of compromise triggered by malware infections or cyberattacks.</p>
                        </div>
                    </a>

                    <!-- File Integrity Monitoring (FIM) -->
                    <a href="#fim" onclick="openModule('File Integrity Monitoring (FIM)', 'เฝ้าระวังการเปลี่ยนแปลง แก้ไข ลบไฟล์สำคัญในระบบเซิร์ฟเวอร์ HOSxP/Web Portal')" class="ctmr-module-item">
                        <div class="ctmr-module-icon">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                <line x1="9" y1="21" x2="9" y2="9"></line>
                            </svg>
                        </div>
                        <div>
                            <div class="ctmr-module-title">File Integrity Monitoring</div>
                            <p class="ctmr-module-desc">Alerts related to file changes, including permissions, content, ownership, and attributes.</p>
                        </div>
                    </a>
                </div>
            </div>

            <!-- 2. THREAT INTELLIGENCE GROUP -->
            <div class="ctmr-card p-5 pt-7">
                <div class="ctmr-pill-badge">THREAT INTELLIGENCE</div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Threat Hunting -->
                    <a href="#hunting" onclick="openModule('Threat Hunting', 'ค้นหาและวิเคราะห์ภัยคุกคามขั้นสูง ความพยายาม Brute Force รหัสผ่าน และการเข้าสู่ระบบผิดปกติ')" class="ctmr-module-item">
                        <div class="ctmr-module-icon">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                <circle cx="12" cy="11" r="3"></circle>
                            </svg>
                        </div>
                        <div>
                            <div class="ctmr-module-title">Threat Hunting</div>
                            <p class="ctmr-module-desc">Browse through your security alerts, identifying issues and threats in your environment.</p>
                        </div>
                    </a>

                    <!-- Vulnerability Detection -->
                    <a href="#vuln" onclick="openModule('Vulnerability Detection', 'ตรวจสอบช่องโหว่ซอฟต์แวร์ CVE ฐานข้อมูลระบบ และระบบปฏิบัติการของ รพ. ทุกแห่ง')" class="ctmr-module-item">
                        <div class="ctmr-module-icon">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                        </div>
                        <div>
                            <div class="ctmr-module-title">Vulnerability Detection</div>
                            <p class="ctmr-module-desc">Discover what applications in your environment are affected by well-known vulnerabilities.</p>
                        </div>
                    </a>

                    <!-- MITRE ATT&CK -->
                    <a href="#mitre" onclick="openModule('MITRE ATT&CK', 'การจำแนกรูปแบบการโจมตีตามเทคนิค Tactics & Techniques ของกรอบสากล MITRE ATT&CK')" class="ctmr-module-item">
                        <div class="ctmr-module-icon">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="22" y1="12" x2="18" y2="12"></line>
                                <line x1="6" y1="12" x2="2" y2="12"></line>
                                <line x1="12" y1="6" x2="12" y2="2"></line>
                                <line x1="12" y1="22" x2="12" y2="18"></line>
                            </svg>
                        </div>
                        <div>
                            <div class="ctmr-module-title">MITRE ATT&CK</div>
                            <p class="ctmr-module-desc">Explore security alerts mapped to adversary tactics and techniques for better threat understanding.</p>
                        </div>
                    </a>
                </div>
            </div>

        </div>

        <!-- 2x2 SECTION GROUPS: SECURITY OPERATIONS & CLOUD SECURITY -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

            <!-- 3. SECURITY OPERATIONS GROUP -->
            <div class="ctmr-card p-5 pt-7">
                <div class="ctmr-pill-badge">SECURITY OPERATIONS</div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- PCI DSS -->
                    <a href="#pcidss" onclick="openModule('PCI DSS', 'มาตรฐานความปลอดภัยในการรับชำระเงินและธุรกรรมการเงินของโรงพยาบาล')" class="ctmr-module-item">
                        <div class="ctmr-module-icon">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                                <line x1="1" y1="10" x2="23" y2="10"></line>
                            </svg>
                        </div>
                        <div>
                            <div class="ctmr-module-title">PCI DSS</div>
                            <p class="ctmr-module-desc">Global security standard for entities that process, store, or transmit payment cardholder data.</p>
                        </div>
                    </a>

                    <!-- GDPR / PDPA -->
                    <a href="#gdpr" onclick="openModule('GDPR / PDPA', 'การคุ้มครองข้อมูลส่วนบุคคลและข้อมูลสุขภาพของผู้ป่วยตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562')" class="ctmr-module-item">
                        <div class="ctmr-module-icon">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <line x1="18" y1="20" x2="18" y2="10"></line>
                                <line x1="12" y1="20" x2="12" y2="4"></line>
                                <line x1="6" y1="20" x2="6" y2="14"></line>
                            </svg>
                        </div>
                        <div>
                            <div class="ctmr-module-title">GDPR / PDPA</div>
                            <p class="ctmr-module-desc">General Data Protection Regulation (GDPR) & PDPA sets guidelines for processing of personal data.</p>
                        </div>
                    </a>

                    <!-- HIPAA -->
                    <a href="#hipaa" onclick="openModule('HIPAA (Health Data Privacy)', 'มาตรฐานความปลอดภัยและความเป็นส่วนตัวของเวชระเบียนข้อมูลทางการแพทย์อิเล็กทรอนิกส์')" class="ctmr-module-item">
                        <div class="ctmr-module-icon">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                            </svg>
                        </div>
                        <div>
                            <div class="ctmr-module-title">HIPAA</div>
                            <p class="ctmr-module-desc">Health Insurance Portability and Accountability Act of 1996 (HIPAA) provides data privacy and security provisions for safeguarding medical information.</p>
                        </div>
                    </a>

                    <!-- NIST 800-53 -->
                    <a href="#nist" onclick="openModule('NIST 800-53', 'กรอบความมั่นคงปลอดภัยไซเบอร์หน่วยงานโครงสร้างพื้นฐานสำคัญทางสารสนเทศ (CII)')" class="ctmr-module-item">
                        <div class="ctmr-module-icon">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                            </svg>
                        </div>
                        <div>
                            <div class="ctmr-module-title">NIST 800-53</div>
                            <p class="ctmr-module-desc">National Institute of Standards and Technology Special Publication 800-53 (NIST 800-53) sets guidelines for federal information systems.</p>
                        </div>
                    </a>

                    <!-- TSC -->
                    <a href="#tsc" onclick="openModule('TSC', 'เกณฑ์มาตรฐานความพร้อมใช้งาน ความถูกต้องครบถ้วน และการรักษาความลับของระบบสารสนเทศ')" class="ctmr-module-item">
                        <div class="ctmr-module-icon">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <circle cx="18" cy="5" r="3"></circle>
                                <circle cx="6" cy="12" r="3"></circle>
                                <circle cx="18" cy="19" r="3"></circle>
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                            </svg>
                        </div>
                        <div>
                            <div class="ctmr-module-title">TSC</div>
                            <p class="ctmr-module-desc">Trust Services Criteria for Security, Availability, Processing Integrity, Confidentiality, and Privacy.</p>
                        </div>
                    </a>
                </div>
            </div>

            <!-- 4. CLOUD SECURITY GROUP -->
            <div class="ctmr-card p-5 pt-7">
                <div class="ctmr-pill-badge">CLOUD SECURITY</div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- Docker -->
                    <a href="#docker" onclick="openModule('Docker Containers', 'เฝ้าระวังและบันทึกประวัติการทำงานของ Microservices, HDC และ API Services ในจังหวัดพิจิตร')" class="ctmr-module-item">
                        <div class="ctmr-module-icon">
                            <!-- Whale / Container icon -->
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <path d="M22 13.5c-.8-.5-1.8-.5-2.6 0-.8.5-1.8.5-2.6 0-.8-.5-1.8-.5-2.6 0-.8.5-1.8.5-2.6 0-.8-.5-1.8-.5-2.6 0-.8.5-1.8.5-2.6 0-.8-.5-1.8-.5-2.6 0-.7.4-1.5.5-2.2.3-.9-.2-1.7-.8-2.2-1.2-1.5-2.4-3-3.6-4.5 1.5 0 2.9.6 4 1.6C7.5 7.5 12 7 14 7c3 0 6 2 7 5 .5 1.5 1 1.5 1 1.5z"></path>
                                <rect x="6" y="8" width="2" height="2"></rect>
                                <rect x="9" y="8" width="2" height="2"></rect>
                                <rect x="12" y="8" width="2" height="2"></rect>
                                <rect x="9" y="5" width="2" height="2"></rect>
                            </svg>
                        </div>
                        <div>
                            <div class="ctmr-module-title">Docker</div>
                            <p class="ctmr-module-desc">Monitor and collect the activity from Docker containers such as creation, running, starting, stopping or pausing events.</p>
                        </div>
                    </a>

                    <!-- Amazon Web Services -->
                    <a href="#aws" onclick="openModule('Amazon Web Services', 'เฝ้าระวังคลาวด์ AWS S3 และ Health Cloud Server ผ่าน AWS CloudTrail/API')" class="ctmr-module-item">
                        <div class="ctmr-module-icon">
                            <span class="text-xs font-black tracking-tight text-slate-700">aws</span>
                        </div>
                        <div>
                            <div class="ctmr-module-title">Amazon Web Services</div>
                            <p class="ctmr-module-desc">Security events related to your Amazon AWS services, collected directly via AWS API.</p>
                        </div>
                    </a>

                    <!-- Google Cloud -->
                    <a href="#gcp" onclick="openModule('Google Cloud', 'เชื่อมต่อเหตุการณ์ความมั่นคงปลอดภัยบน GCP และ Google Workspace สำหรับบุคลากรสาธารณสุข')" class="ctmr-module-item">
                        <div class="ctmr-module-icon">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                                <polyline points="2 17 12 22 22 17"></polyline>
                                <polyline points="2 12 12 17 22 12"></polyline>
                            </svg>
                        </div>
                        <div>
                            <div class="ctmr-module-title">Google Cloud</div>
                            <p class="ctmr-module-desc">Security events related to your Google Cloud Platform services, collected directly via GCP API.</p>
                        </div>
                    </a>

                    <!-- GitHub -->
                    <a href="#github" onclick="openModule('GitHub Code & CI/CD', 'ตรวจสอบ Audit log และความปลอดภัยของโค้ดโปรเจกต์ MIS พอร์ทัลสุขภาพพิจิตร')" class="ctmr-module-item">
                        <div class="ctmr-module-icon">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                            </svg>
                        </div>
                        <div>
                            <div class="ctmr-module-title">GitHub</div>
                            <p class="ctmr-module-desc">Monitoring events from audit logs of your GitHub organizations.</p>
                        </div>
                    </a>

                    <!-- Office 365 -->
                    <a href="#o365" onclick="openModule('Office 365', 'เฝ้าระวังความพยายามเจาะอีเมลและแชร์ข้อมูลภายนอกของบัญชีเจ้าหน้าที่')" class="ctmr-module-item">
                        <div class="ctmr-module-icon">
                            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                                <rect x="3" y="3" width="7" height="7"></rect>
                                <rect x="14" y="3" width="7" height="7"></rect>
                                <rect x="14" y="14" width="7" height="7"></rect>
                                <rect x="3" y="14" width="7" height="7"></rect>
                            </svg>
                        </div>
                        <div>
                            <div class="ctmr-module-title">Office 365</div>
                            <p class="ctmr-module-desc">Security events related to your Office 365 services.</p>
                        </div>
                    </a>
                </div>
            </div>

        </div>

        <!-- FOOTER BAR -->
        <footer class="text-center py-6 text-xs text-slate-400 border-t border-slate-200 mt-8 space-y-1">
            <p>CTMR R3 Phichit MIS Admin Portal • ศูนย์เทคโนโลยีสารสนเทศ สำนักงานสาธารณสุขจังหวัดพิจิตร</p>
            <p class="text-[11px] text-slate-400">อิงตามมาตรฐานสถาปัตยกรรม Wazuh Security Engine & OpenSearch Dashboard 4.7.2</p>
        </footer>

    </main>

    <!-- MODAL: HOSPITAL NETWORK OVERVIEW MODAL -->
    <div id="hospitalModal" class="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 hidden">
        <div class="bg-white rounded-lg border border-slate-200 shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded bg-sky-100 text-[#006BB4] flex items-center justify-center font-bold">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>
                    </div>
                    <div>
                        <h3 class="text-base font-bold text-slate-800">สถานะโหนดเครือข่ายโรงพยาบาลในจังหวัดพิจิตร (CTMR Health Nodes)</h3>
                        <p class="text-xs text-slate-500">รายงานการเชื่อมต่อระบบเฝ้าระวังความมั่นคงปลอดภัยสารสนเทศ สสจ.พิจิตร</p>
                    </div>
                </div>
                <button onclick="closeHospitalModal()" class="text-slate-400 hover:text-slate-600 p-1.5 rounded-md hover:bg-slate-200">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>

            <div class="p-6 overflow-y-auto space-y-4">
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div class="bg-emerald-50 border border-emerald-200 rounded p-3 text-center">
                        <div class="text-xs text-emerald-700 font-medium">โหนดที่ Active ปกติ</div>
                        <div class="text-2xl font-bold text-emerald-800">418</div>
                    </div>
                    <div class="bg-rose-50 border border-rose-200 rounded p-3 text-center">
                        <div class="text-xs text-rose-700 font-medium">โหนด Disconnected / ขาดการติดต่อ</div>
                        <div class="text-2xl font-bold text-rose-800">195</div>
                    </div>
                    <div class="bg-sky-50 border border-sky-200 rounded p-3 text-center">
                        <div class="text-xs text-sky-700 font-medium">จำนวนโหนดทั้งหมดในฐานข้อมูล</div>
                        <div class="text-2xl font-bold text-sky-800">613</div>
                    </div>
                </div>

                <div class="border border-slate-200 rounded-md overflow-hidden">
                    <table class="w-full text-xs text-left">
                        <thead class="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase">
                            <tr>
                                <th class="p-3">Agent ID</th>
                                <th class="p-3">ชื่อหน่วยงาน / โรงพยาบาล</th>
                                <th class="p-3">IP Address</th>
                                <th class="p-3">ระบบ HIS / OS</th>
                                <th class="p-3">สถานะ</th>
                                <th class="p-3 text-right">การจัดการ</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-200">
                            <tr class="hover:bg-slate-50">
                                <td class="p-3 font-mono font-semibold">001</td>
                                <td class="p-3 font-medium text-slate-800">แม่ข่ายศูนย์เทคโนโลยี สสจ.พิจิตร</td>
                                <td class="p-3 font-mono text-slate-600">192.168.1.10</td>
                                <td class="p-3 text-slate-600">Rocky Linux 9 / Docker</td>
                                <td class="p-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Active</span></td>
                                <td class="p-3 text-right"><button onclick="selectAndClose('001', 'แม่ข่ายศูนย์เทคโนโลยี สสจ.พิจิตร')" class="text-[#006BB4] font-semibold hover:underline">เลือกมุมมอง</button></td>
                            </tr>
                            <tr class="hover:bg-slate-50 bg-sky-50/50">
                                <td class="p-3 font-mono font-semibold text-[#006BB4]">002</td>
                                <td class="p-3 font-semibold text-slate-800">โรงพยาบาลพิจิตร (HIS/HOSxP)</td>
                                <td class="p-3 font-mono text-slate-600">192.168.10.254</td>
                                <td class="p-3 text-slate-600">Windows Server 2022 / HOSxP v4</td>
                                <td class="p-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Active (Current)</span></td>
                                <td class="p-3 text-right"><span class="text-slate-400 font-medium">กำลังดูอยู่นี้</span></td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="p-3 font-mono font-semibold">003</td>
                                <td class="p-3 font-medium text-slate-800">รพ.สมเด็จพระยุพราชตะพานหิน</td>
                                <td class="p-3 font-mono text-slate-600">192.168.20.10</td>
                                <td class="p-3 text-slate-600">Ubuntu 22.04 LTS / HOSxP</td>
                                <td class="p-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Active</span></td>
                                <td class="p-3 text-right"><button onclick="selectAndClose('003', 'รพ.สมเด็จพระยุพราชตะพานหิน')" class="text-[#006BB4] font-semibold hover:underline">เลือกมุมมอง</button></td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="p-3 font-mono font-semibold">004</td>
                                <td class="p-3 font-medium text-slate-800">รพ.บางมูลนาก</td>
                                <td class="p-3 font-mono text-slate-600">192.168.30.15</td>
                                <td class="p-3 text-slate-600">Windows Server 2019</td>
                                <td class="p-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Active</span></td>
                                <td class="p-3 text-right"><button onclick="selectAndClose('004', 'รพ.บางมูลนาก')" class="text-[#006BB4] font-semibold hover:underline">เลือกมุมมอง</button></td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="p-3 font-mono font-semibold">005</td>
                                <td class="p-3 font-medium text-slate-800">รพ.โพทะเล</td>
                                <td class="p-3 font-mono text-slate-600">192.168.40.8</td>
                                <td class="p-3 text-slate-600">CentOS 7 / HOSxP</td>
                                <td class="p-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-100 text-rose-800">Disconnected</span></td>
                                <td class="p-3 text-right"><button onclick="selectAndClose('005', 'รพ.โพทะเล')" class="text-[#006BB4] font-semibold hover:underline">เลือกมุมมอง</button></td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="p-3 font-mono font-semibold">006</td>
                                <td class="p-3 font-medium text-slate-800">รพ.สามง่าม</td>
                                <td class="p-3 font-mono text-slate-600">192.168.50.12</td>
                                <td class="p-3 text-slate-600">Debian 12 / JHCIS</td>
                                <td class="p-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Active</span></td>
                                <td class="p-3 text-right"><button onclick="selectAndClose('006', 'รพ.สามง่าม')" class="text-[#006BB4] font-semibold hover:underline">เลือกมุมมอง</button></td>
                            </tr>
                            <tr class="hover:bg-slate-50">
                                <td class="p-3 font-mono font-semibold">007</td>
                                <td class="p-3 font-medium text-slate-800">รพ.ทับคล้อ</td>
                                <td class="p-3 font-mono text-slate-600">192.168.60.20</td>
                                <td class="p-3 text-slate-600">Windows Server 2022</td>
                                <td class="p-3"><span class="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">Active</span></td>
                                <td class="p-3 text-right"><button onclick="selectAndClose('007', 'รพ.ทับคล้อ')" class="text-[#006BB4] font-semibold hover:underline">เลือกมุมมอง</button></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
                <button onclick="closeHospitalModal()" class="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded">
                    ปิดหน้าต่าง
                </button>
            </div>
        </div>
    </div>

    <!-- MODAL: MODULE DETAIL DRILLDOWN -->
    <div id="moduleModal" class="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 hidden">
        <div class="bg-white rounded-lg border border-slate-200 shadow-xl max-w-2xl w-full flex flex-col overflow-hidden">
            <div class="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-[#006BB4]"></span>
                    <h3 id="moduleModalTitle" class="text-base font-bold text-slate-800">โมดูลความปลอดภัย</h3>
                </div>
                <button onclick="closeModuleModal()" class="text-slate-400 hover:text-slate-600 p-1 rounded">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            <div class="p-6 space-y-3">
                <p id="moduleModalDesc" class="text-sm text-slate-600 leading-relaxed"></p>
                <div class="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-2">
                    <div class="flex justify-between">
                        <span class="text-slate-500">สถานะการทำงานในปัจจุบัน:</span>
                        <span class="font-semibold text-emerald-600">เปิดใช้งานและกำลังเฝ้าระวังแบบ Real-time</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-500">หน่วยงานเป้าหมาย:</span>
                        <span class="font-semibold text-slate-700" id="moduleModalTarget">รพ.พิจิตร (Agent 002)</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-slate-500">กฎความปลอดภัย (Ruleset):</span>
                        <span class="font-mono text-slate-700">Wazuh Ruleset v4.7.2-r3</span>
                    </div>
                </div>
            </div>
            <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                <button onclick="closeModuleModal()" class="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded">
                    ตกลง
                </button>
            </div>
        </div>
    </div>

    <!-- JAVASCRIPT LOGIC -->
    <script>
        // Drawer toggle
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

        // Hospital Modal
        function openHospitalModal() {
            document.getElementById('hospitalModal').classList.remove('hidden');
            toggleDrawer(false);
        }
        function closeHospitalModal() {
            document.getElementById('hospitalModal').classList.add('hidden');
        }

        // Module Modal
        function openModule(title, desc) {
            document.getElementById('moduleModalTitle').innerText = title;
            document.getElementById('moduleModalDesc').innerText = desc;
            document.getElementById('moduleModalTarget').innerText = document.getElementById('currentAgencyName').innerText;
            document.getElementById('moduleModal').classList.remove('hidden');
        }
        function closeModuleModal() {
            document.getElementById('moduleModal').classList.add('hidden');
        }

        function openAlertDetail(severity) {
            openModule('Alert Level: ' + severity, 'ตรวจสอบรายการแจ้งเตือนระดับความรุนแรง ' + severity + ' ของระบบเครือข่ายสาธารณสุขจังหวัดพิจิตรในรอบ 24 ชั่วโมง');
        }

        function filterByStatus(status) {
            openModule('Agents Filter: ' + status.toUpperCase(), 'แสดงรายการโหนดเครื่องลูกข่ายและเซิร์ฟเวอร์สถานะ ' + status + ' ในเครือข่าย สสจ.พิจิตร');
        }

        // Switch agency from dropdown
        function filterHospital(val) {
            const select = document.getElementById('nodeFilter');
            const text = select.options[select.selectedIndex].text;
            document.getElementById('currentAgencyName').innerText = text;
            updateTimestamp();
        }

        function selectAndClose(id, name) {
            const select = document.getElementById('nodeFilter');
            select.value = id;
            document.getElementById('currentAgencyName').innerText = 'Agent ' + id + ' - ' + name;
            closeHospitalModal();
            updateTimestamp();
        }

        function updateTimestamp() {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('th-TH');
            document.getElementById('lastUpdatedTime').innerText = timeStr;
        }

        function refreshData() {
            const icon = document.getElementById('refreshIcon');
            icon.classList.add('animate-spin');
            setTimeout(() => {
                icon.classList.remove('animate-spin');
                updateTimestamp();
            }, 600);
        }

        // Initial time
        updateTimestamp();
    </script>
</body>
</html>
