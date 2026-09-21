import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import CtmrLayout from '@/Layouts/CtmrLayout';

export default function Dashboard({
    agentsSummary = { total: 613, active: 418, disconnected: 195, coverage_percent: 68.2 },
    hospitalsAgents = [],
    alertsSummary = {
        critical: 0,
        high: 291,
        medium: '1,098,468',
        low: '896,603',
        severity_levels: [],
        categories: [],
    },
    connectionStatus = {
        is_live: false,
        mode: 'simulated',
        api_url: 'https://ctmr.ppho.go.th:55000',
        node_name: 'ctmr-phichit (Wazuh Manager)',
        last_sync: '',
        message: '',
    },
    socWebboardSummary = {
        today_reports_count: 0,
        open_issues_count: 0,
        critical_alerts_count: 0,
        resolved_today_count: 0,
        latest_shift_report: null,
        active_incidents: [],
        recent_topics: [],
    },
    agencyDocsSummary = {
        total_tasks: 0,
        completed_tasks: 0,
        in_progress_tasks: 0,
        pending_tasks: 0,
        total_docs: 0,
        docs_by_type: { pdf: 0, word: 0, excel: 0, powerpoint: 0 },
        recent_tasks: [],
        latest_docs: [],
    },
    lastUpdated = '',
}) {
    const [hospitalFilter, setHospitalFilter] = useState('all');
    const [hospitalSearch, setHospitalSearch] = useState('');
    const [selectedHospitalDetail, setSelectedHospitalDetail] = useState(null);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncTime, setSyncTime] = useState(lastUpdated);

    // Live Sync handler
    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/dashboard/sync');
            if (res.ok) {
                const data = await res.json();
                if (data.lastUpdated) {
                    setSyncTime(data.lastUpdated);
                }
                router.reload({ preserveScroll: true, preserveState: true });
            }
        } catch (e) {
            console.error('Error syncing data:', e);
        } finally {
            setTimeout(() => setIsSyncing(false), 500);
        }
    };

    // Filter hospitals
    const filteredHospitals = hospitalsAgents.filter((h) => {
        const matchesSearch =
            h.name.toLowerCase().includes(hospitalSearch.toLowerCase()) ||
            h.code.includes(hospitalSearch) ||
            (h.type && h.type.toLowerCase().includes(hospitalSearch.toLowerCase()));

        if (!matchesSearch) return false;

        if (hospitalFilter === 'warning') {
            return h.health_score < 80 || h.disconnected > 15;
        }
        if (hospitalFilter === 'healthy') {
            return h.health_score >= 80;
        }
        return true;
    });

    // Helper for shift Thai labels
    const getShiftLabel = (shift) => {
        switch (shift) {
            case 'morning':
                return 'เวรเช้า (08:00 - 16:00 น.)';
            case 'afternoon':
                return 'เวรบ่าย (16:00 - 24:00 น.)';
            case 'night':
                return 'เวรดึก (00:00 - 08:00 น.)';
            default:
                return 'เวรประจำวัน (24 ชม.)';
        }
    };

    return (
        <CtmrLayout title="Overview" activeNav="overview">
            {({ openModule }) => (
                <div className="space-y-6 max-w-[1720px] mx-auto pb-10">
                    <Head title="SOC Executive Dashboard - CTMR R3 Phichit" />

                    {/* LIVE API CONNECTION STATUS & COMMAND BAR */}
                    <div className="bg-white border border-[#D3DAE6] rounded-xl px-5 py-3 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-3 text-xs">
                            {/* Live Badge */}
                            {connectionStatus.is_live ? (
                                <span className="bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold px-3 py-1 rounded-full flex items-center gap-2 shadow-2xs">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 -ml-4.5"></span>
                                    <span>Live Wazuh API Connected</span>
                                </span>
                            ) : (
                                <span className="bg-amber-50 text-amber-800 border border-amber-300 font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-2xs">
                                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                    <span>Simulated / Fallback Standby</span>
                                </span>
                            )}

                            <span className="text-slate-300 hidden sm:inline">•</span>

                            <div className="flex items-center gap-1 text-slate-600">
                                <span className="font-semibold text-slate-700">Wazuh Server:</span>
                                <code className="bg-slate-100 text-[#006BB4] px-2 py-0.5 rounded font-mono text-[11px] font-semibold">
                                    {connectionStatus.api_url}
                                </code>
                            </div>

                            <span className="text-slate-300 hidden md:inline">•</span>

                            <div className="text-slate-500 text-[11px] hidden lg:block">
                                {connectionStatus.message}
                            </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0 text-xs">
                            <span className="text-slate-500">
                                ซิงค์ล่าสุด: <strong>{syncTime || lastUpdated} น.</strong>
                            </span>

                            <button
                                onClick={handleSync}
                                disabled={isSyncing}
                                className="bg-[#006BB4] hover:bg-[#005590] text-white font-bold px-3.5 py-1.5 rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                title="ดึงข้อมูลสดล่าสุดจาก Wazuh API"
                            >
                                <svg
                                    className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                </svg>
                                <span>{isSyncing ? 'กำลังซิงค์...' : 'Refresh Sync'}</span>
                            </button>
                        </div>
                    </div>

                    {/* TOP STATS ROW (AGENTS SUMMARY + LAST 24 HOURS ALERTS) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* 1. AGENTS SUMMARY CARD (Donut Chart) */}
                        <div className="lg:col-span-4 bg-white border border-[#D3DAE6] rounded-xl p-6 pt-7 relative shadow-xs">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-[#D3DAE6] rounded-full px-4 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap shadow-2xs flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-[#006BB4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                AGENTS SUMMARY
                            </div>

                            <div className="flex items-center justify-between h-full pt-1">
                                {/* Donut Chart SVG */}
                                <div className="relative w-36 h-36 flex-shrink-0">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="38" fill="none" stroke="#F0F4F8" strokeWidth="14" />
                                        {/* Active */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="38"
                                            fill="none"
                                            stroke="#0F8174"
                                            strokeWidth="14"
                                            strokeDasharray={`${(agentsSummary.active / (agentsSummary.total || 1)) * 238.76} 238.76`}
                                            strokeDashoffset="0"
                                            className="transition-all duration-700 ease-out cursor-pointer hover:opacity-90"
                                            onClick={() =>
                                                openModule(
                                                    'Active Agents Summary',
                                                    `ขณะนี้มีเครื่องลูกข่ายและแม่ข่ายเปิดทำงานปกติ ${agentsSummary.active} โหนด จากทั้งหมด ${agentsSummary.total} โหนดใน 13 โรงพยาบาล`
                                                )
                                            }
                                        />
                                        {/* Disconnected */}
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="38"
                                            fill="none"
                                            stroke="#BD271E"
                                            strokeWidth="14"
                                            strokeDasharray={`${(agentsSummary.disconnected / (agentsSummary.total || 1)) * 238.76} 238.76`}
                                            strokeDashoffset={`-${(agentsSummary.active / (agentsSummary.total || 1)) * 238.76}`}
                                            className="transition-all duration-700 ease-out cursor-pointer hover:opacity-90"
                                            onClick={() =>
                                                openModule(
                                                    'Disconnected Agents Summary',
                                                    `ขณะนี้มีเครื่องลูกข่ายหรือเซิร์ฟเวอร์ขาดการติดต่อ ${agentsSummary.disconnected} โหนด ต้องการการตรวจสอบการเชื่อมต่อ`
                                                )
                                            }
                                        />
                                    </svg>

                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-2xl font-bold text-slate-800">{agentsSummary.total}</span>
                                        <span className="text-[10px] uppercase font-bold text-slate-400">Total Nodes</span>
                                    </div>
                                </div>

                                {/* Legend */}
                                <div className="flex flex-col justify-center gap-2.5 pl-4">
                                    <div
                                        className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition"
                                        onClick={() => openModule('Active Agents Filter', 'แสดงรายการโหนดที่ทำงานปกติในเครือข่าย สสจ.พิจิตร')}
                                    >
                                        <span className="w-3 h-3 rounded-full bg-[#0F8174]"></span>
                                        <span className="text-xs font-semibold text-slate-700">Active (ออนไลน์):</span>
                                        <span className="text-xs font-bold text-[#0F8174]">{agentsSummary.active}</span>
                                    </div>

                                    <div
                                        className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1.5 rounded-lg transition"
                                        onClick={() => openModule('Disconnected Agents Filter', 'แสดงรายการโหนดที่ขาดการติดต่อในเครือข่าย สสจ.พิจิตร')}
                                    >
                                        <span className="w-3 h-3 rounded-full bg-[#BD271E]"></span>
                                        <span className="text-xs font-semibold text-slate-700">Disconnected:</span>
                                        <span className="text-xs font-bold text-[#BD271E]">{agentsSummary.disconnected}</span>
                                    </div>

                                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                                        <span>ความพร้อมระบบ: </span>
                                        <strong className="text-emerald-700 font-bold">{agentsSummary.coverage_percent}%</strong>
                                    </div>

                                    <div className="text-[10px] text-slate-400">
                                        ครอบคลุม 13 รพ. ในสังกัด สสจ.พิจิตร
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. LAST 24 HOURS ALERTS (THREAT SEVERITY CARDS) */}
                        <div className="lg:col-span-8 bg-white border border-[#D3DAE6] rounded-xl p-6 pt-7 relative shadow-xs">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-[#D3DAE6] rounded-full px-4 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap shadow-2xs flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                LAST 24 HOURS SECURITY ALERTS (THREAT SEVERITY)
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 h-full items-center text-center pt-1">
                                {/* Critical Severity */}
                                <div
                                    onClick={() => openModule('Critical Severity Alerts', 'การแจ้งเตือนระดับวิกฤต (Rule level 15+) ตรวจจับภัยคุกคามรุนแรงสูงสุด')}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-rose-100 hover:border-rose-300 hover:bg-rose-50/50 transition cursor-pointer group"
                                >
                                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                        <span>🚨</span>
                                        <span>Critical severity</span>
                                    </div>
                                    <div className="text-3xl font-extrabold text-[#BD271E] my-1 group-hover:scale-105 transition">
                                        {alertsSummary.critical}
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-medium">Rule level 15+</div>
                                    <span className="mt-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                                        {alertsSummary.critical === 0 ? 'ปลอดภัย 0 เหตุการณ์' : `${alertsSummary.critical} เหตุการณ์วิกฤต`}
                                    </span>
                                </div>

                                {/* High Severity */}
                                <div
                                    onClick={() => openModule('High Severity Alerts', `การแจ้งเตือนระดับสูง (Rule level 12-14) จำนวน ${alertsSummary.high} เหตุการณ์ ได้รับการตรวจสอบและจำกัดวงแล้ว`)}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-amber-100 hover:border-amber-300 hover:bg-amber-50/50 transition cursor-pointer group"
                                >
                                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                        <span>⚠️</span>
                                        <span>High severity</span>
                                    </div>
                                    <div className="text-3xl font-extrabold text-[#FEC514] my-1 group-hover:scale-105 transition">
                                        {alertsSummary.high}
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-medium">Rule level 12 to 14</div>
                                    <span className="mt-1.5 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                                        มอนิเตอร์และบล็อกแล้ว
                                    </span>
                                </div>

                                {/* Medium Severity */}
                                <div
                                    onClick={() => openModule('Medium Severity Alerts', `การแจ้งเตือนระดับปานกลาง (Rule level 7-11) จำนวน ${alertsSummary.medium} เหตุการณ์ มีการวิเคราะห์และเก็บ Log อัตโนมัติ`)}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-sky-100 hover:border-sky-300 hover:bg-sky-50/50 transition cursor-pointer group"
                                >
                                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                        <span>🔵</span>
                                        <span>Medium severity</span>
                                    </div>
                                    <div className="text-3xl font-extrabold text-[#6092C0] my-1 tracking-tight group-hover:scale-105 transition">
                                        {alertsSummary.medium}
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-medium">Rule level 7 to 11</div>
                                    <span className="mt-1.5 text-[10px] font-semibold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-full">
                                        วิเคราะห์อัตโนมัติ
                                    </span>
                                </div>

                                {/* Low Severity */}
                                <div
                                    onClick={() => openModule('Low Severity Alerts', `การแจ้งเตือนระดับทั่วไป (Rule level 0-6) จำนวน ${alertsSummary.low} เหตุการณ์ บันทึกกิจกรรมระบบทั่วไป`)}
                                    className="flex flex-col items-center justify-center p-3 rounded-xl border border-teal-100 hover:border-teal-300 hover:bg-teal-50/50 transition cursor-pointer group"
                                >
                                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                                        <span>🟢</span>
                                        <span>Low severity</span>
                                    </div>
                                    <div className="text-3xl font-extrabold text-[#007871] my-1 tracking-tight group-hover:scale-105 transition">
                                        {alertsSummary.low}
                                    </div>
                                    <div className="text-[11px] text-slate-500 font-medium">Rule level 0 to 6</div>
                                    <span className="mt-1.5 text-[10px] font-semibold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-full">
                                        บันทึกระบบทั่วไป
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: 13 HOSPITALS AGENT MONITORING MATRIX */}
                    <div className="bg-white border border-[#D3DAE6] rounded-xl p-6 relative shadow-xs">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-5">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                    <span className="text-lg">🏥</span>
                                    สถานะจำนวน Agent แยกตาม 13 โรงพยาบาลของจังหวัดพิจิตร
                                </h2>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    แสดงผลการเชื่อมต่อโหนดลูกข่ายและเซิร์ฟเวอร์แม่ข่ายของสถานพยาบาลในสังกัด สสจ.พิจิตร ทั้ง 13 แห่ง
                                </p>
                            </div>

                            {/* Search & Filter Buttons */}
                            <div className="flex flex-wrap items-center gap-2.5">
                                {/* Search box */}
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={hospitalSearch}
                                        onChange={(e) => setHospitalSearch(e.target.value)}
                                        placeholder="ค้นหาชื่อ รพ. หรือรหัส..."
                                        className="text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006BB4] w-48"
                                    />
                                    <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                </div>

                                {/* Filter Buttons */}
                                <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                                    <button
                                        onClick={() => setHospitalFilter('all')}
                                        className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                                            hospitalFilter === 'all'
                                                ? 'bg-white text-[#006BB4] shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        ทั้งหมด (13 รพ.)
                                    </button>
                                    <button
                                        onClick={() => setHospitalFilter('warning')}
                                        className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                                            hospitalFilter === 'warning'
                                                ? 'bg-white text-rose-600 shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        ต้องตรวจสอบ ({hospitalsAgents.filter((h) => h.health_score < 80).length})
                                    </button>
                                    <button
                                        onClick={() => setHospitalFilter('healthy')}
                                        className={`px-3 py-1 rounded-md font-semibold transition cursor-pointer ${
                                            hospitalFilter === 'healthy'
                                                ? 'bg-white text-emerald-700 shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        สมบูรณ์ ({hospitalsAgents.filter((h) => h.health_score >= 80).length})
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 13 Hospitals Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filteredHospitals.map((hosp) => {
                                const isWarning = hosp.health_score < 80;
                                const isCritical = hosp.health_score < 65;

                                return (
                                    <div
                                        key={hosp.code}
                                        onClick={() => setSelectedHospitalDetail(hosp)}
                                        className={`rounded-xl border p-4 transition duration-150 hover:shadow-md cursor-pointer flex flex-col justify-between ${
                                            isCritical
                                                ? 'bg-rose-50/25 border-rose-200 hover:border-rose-400'
                                                : isWarning
                                                ? 'bg-amber-50/20 border-amber-200 hover:border-amber-400'
                                                : 'bg-white border-slate-200 hover:border-[#006BB4]/50'
                                        }`}
                                    >
                                        <div>
                                            <div className="flex items-center justify-between gap-2 mb-1.5">
                                                <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                                                    NODE {hosp.code}
                                                </span>
                                                <span
                                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                                        hosp.health_score >= 80
                                                            ? 'bg-emerald-100 text-emerald-800'
                                                            : hosp.health_score >= 65
                                                            ? 'bg-amber-100 text-amber-800'
                                                            : 'bg-rose-100 text-rose-800'
                                                    }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${
                                                            hosp.health_score >= 80
                                                                ? 'bg-emerald-500'
                                                                : hosp.health_score >= 65
                                                                ? 'bg-amber-500'
                                                                : 'bg-rose-500 animate-ping'
                                                        }`}
                                                    ></span>
                                                    {hosp.health_score}%
                                                </span>
                                            </div>

                                            <h3 className="text-xs font-bold text-slate-800 line-clamp-1" title={hosp.name}>
                                                {hosp.name}
                                            </h3>
                                            <p className="text-[10px] text-slate-500 mb-3">{hosp.type}</p>

                                            {/* Health bar */}
                                            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                                                <div
                                                    className={`h-full transition-all duration-500 rounded-full ${
                                                        hosp.health_score >= 80
                                                            ? 'bg-emerald-500'
                                                            : hosp.health_score >= 65
                                                            ? 'bg-amber-500'
                                                            : 'bg-rose-500'
                                                    }`}
                                                    style={{ width: `${hosp.health_score}%` }}
                                                ></div>
                                            </div>
                                        </div>

                                        {/* Metrics footer */}
                                        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px]">
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-500 font-medium">โหนดรวม:</span>
                                                <strong className="text-slate-800">{hosp.total}</strong>
                                            </div>
                                            <div className="flex items-center gap-2 text-[11px]">
                                                <span className="text-emerald-700 font-bold flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                                    {hosp.active}
                                                </span>
                                                <span className="text-slate-300">/</span>
                                                <span className="text-rose-600 font-bold flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                                                    {hosp.disconnected}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* SECTION 3: SOC WEBBOARD DAILY OPERATIONAL BRIEFING & SHIFT LOG */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* 1. LATEST SOC SHIFT REPORT BRIEFING */}
                        <div className="lg:col-span-6 bg-white border border-[#D3DAE6] rounded-xl p-6 relative shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">📋</span>
                                        <h2 className="text-sm font-bold text-slate-800">
                                            สรุปรายงานผลการปฏิบัติงานเวร SOC ประจำวัน
                                        </h2>
                                    </div>
                                    <Link
                                        href="/webboard"
                                        className="text-xs font-semibold text-[#006BB4] hover:underline flex items-center gap-1"
                                    >
                                        <span>ไปยังกระดานข่าว</span>
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </Link>
                                </div>

                                {socWebboardSummary.latest_shift_report ? (
                                    <div className="bg-slate-50/60 rounded-xl p-4 border border-slate-200 text-xs space-y-2.5">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-bold text-[10px]">
                                                    {getShiftLabel(socWebboardSummary.latest_shift_report.shift)}
                                                </span>
                                                <span className="text-slate-500 text-[11px]">
                                                    {new Date(socWebboardSummary.latest_shift_report.created_at).toLocaleDateString('th-TH', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                    })}
                                                </span>
                                            </div>
                                            <span className="text-slate-500 text-[11px]">
                                                ผู้รายงาน: <strong>{socWebboardSummary.latest_shift_report.user?.name}</strong>
                                            </span>
                                        </div>

                                        <Link
                                            href={`/webboard/${socWebboardSummary.latest_shift_report.id}`}
                                            className="font-bold text-slate-900 hover:text-[#006BB4] text-sm block transition"
                                        >
                                            {socWebboardSummary.latest_shift_report.title}
                                        </Link>

                                        <p className="text-slate-600 line-clamp-3 leading-relaxed font-sans">
                                            {socWebboardSummary.latest_shift_report.content.replace(/[#*`]/g, '')}
                                        </p>

                                        {socWebboardSummary.latest_shift_report.resolution_notes && (
                                            <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg text-[11px] text-emerald-900">
                                                <strong>สรุปการส่งมอบ/แก้ไข:</strong> {socWebboardSummary.latest_shift_report.resolution_notes}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-slate-400 text-xs">
                                        ยังไม่มีรายงานเวร SOC วันนี้
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="text-slate-500 text-[11px]">
                                    รายงานเวรวันนี้: <strong>{socWebboardSummary.today_reports_count} กะ</strong>
                                </span>
                                <Link
                                    href="/webboard"
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] px-3.5 py-1.5 rounded-lg shadow-2xs transition flex items-center gap-1.5"
                                >
                                    <span>+ บันทึกรายงานเวรใหม่</span>
                                </Link>
                            </div>
                        </div>

                        {/* 2. ACTIVE INCIDENT ALERTS & RUNNING TOPICS */}
                        <div className="lg:col-span-6 bg-white border border-[#D3DAE6] rounded-xl p-6 relative shadow-xs flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-base">🚨</span>
                                        <h2 className="text-sm font-bold text-slate-800">
                                            ประเด็นเหตุการณ์สำคัญที่กำลังติดตาม (Active Incidents)
                                        </h2>
                                    </div>
                                    <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        {socWebboardSummary.critical_alerts_count} เรื่องเปิดอยู่
                                    </span>
                                </div>

                                {socWebboardSummary.active_incidents.length === 0 ? (
                                    <div className="text-center py-8 text-emerald-700 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs">
                                        ✓ ไม่พบเหตุการณ์วิกฤตหรือประเด็นเร่งด่วนที่ค้างคาในขณะนี้
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {socWebboardSummary.active_incidents.map((inc) => (
                                            <Link
                                                key={inc.id}
                                                href={`/webboard/${inc.id}`}
                                                className="block bg-slate-50 hover:bg-rose-50/40 p-3 rounded-xl border border-slate-200 hover:border-rose-300 transition"
                                            >
                                                <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                                                    <span className="bg-rose-600 text-white font-bold px-1.5 py-0.2 rounded">
                                                        {inc.severity.toUpperCase()}
                                                    </span>
                                                    <span>{inc.agency_name}</span>
                                                </div>
                                                <div className="font-bold text-xs text-slate-900 line-clamp-1">
                                                    {inc.title}
                                                </div>
                                                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                                                    <span>ระบบ: {inc.system_affected || 'General'}</span>
                                                    <span>💬 {inc.comments_count} ข้อความ</span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                                <span className="text-slate-500 text-[11px]">
                                    ประเด็นกำลังติดตามทั้งหมด: <strong>{socWebboardSummary.open_issues_count} เรื่อง</strong>
                                </span>
                                <Link
                                    href="/webboard"
                                    className="text-[#006BB4] hover:underline font-semibold text-[11px]"
                                >
                                    ดูประเด็นทั้งหมดในกระดานข่าว →
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: AGENCY DOCUMENTS & TASK TIMELINE SUMMARY */}
                    <div className="bg-white border border-[#D3DAE6] rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200 text-[#00A88F] flex items-center justify-center shrink-0 shadow-2xs">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-base font-bold text-slate-800 tracking-tight">
                                            สรุปเอกสารรายงานผล & ติดตามงาน 13 หน่วยงาน (Agency Docs & Step Timeline)
                                        </h2>
                                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                                            Active
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                        ศูนย์กลางรายงานความคืบหน้าภารกิจงานจำแนกรายโรงพยาบาล พร้อมคลังเอกสารรายงานผล PDF, Word, Excel, PowerPoint
                                    </p>
                                </div>
                            </div>

                            <Link
                                href="/agency-docs"
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-semibold rounded-lg shadow-2xs transition"
                            >
                                <span>เปิดระบบจัดการเอกสารฉบับเต็ม</span>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </Link>
                        </div>

                        {/* Summary KPI Mini Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                            <div className="bg-slate-50/80 border border-slate-200 rounded-lg p-3">
                                <div className="text-[11px] font-semibold text-slate-500">ภารกิจงานทั้งหมด</div>
                                <div className="text-xl font-bold text-slate-800 mt-0.5">{agencyDocsSummary.total_tasks} โครงการ</div>
                                <div className="text-[10px] text-slate-400 mt-0.5">13 รพ. / สสจ.</div>
                            </div>

                            <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3">
                                <div className="text-[11px] font-semibold text-emerald-700">เสร็จสมบูรณ์</div>
                                <div className="text-xl font-bold text-emerald-700 mt-0.5">{agencyDocsSummary.completed_tasks} โครงการ</div>
                                <div className="text-[10px] text-emerald-600 mt-0.5">ครบทุกขั้นตอน</div>
                            </div>

                            <div className="bg-sky-50/60 border border-sky-200 rounded-lg p-3">
                                <div className="text-[11px] font-semibold text-[#006BB4]">กำลังดำเนินการ</div>
                                <div className="text-xl font-bold text-[#006BB4] mt-0.5">{agencyDocsSummary.in_progress_tasks} โครงการ</div>
                                <div className="text-[10px] text-[#006BB4] mt-0.5">Step Active</div>
                            </div>

                            <div className="bg-teal-50/60 border border-teal-200 rounded-lg p-3">
                                <div className="text-[11px] font-semibold text-[#00A88F]">เอกสารรายงานในคลัง</div>
                                <div className="text-xl font-bold text-[#00A88F] mt-0.5">{agencyDocsSummary.total_docs} ไฟล์</div>
                                <div className="text-[10px] text-slate-500 mt-0.5">แนบในแต่ละ Step</div>
                            </div>

                            {/* File Types Breakdown Pill */}
                            <div className="col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col justify-between">
                                <div className="text-[11px] font-semibold text-slate-600">จำแนกตามประเภทไฟล์เอกสาร:</div>
                                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700">
                                        PDF: {agencyDocsSummary.docs_by_type?.pdf || 0}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-700">
                                        Word: {agencyDocsSummary.docs_by_type?.word || 0}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-700">
                                        Excel: {agencyDocsSummary.docs_by_type?.excel || 0}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-orange-100 text-orange-700">
                                        PPT: {agencyDocsSummary.docs_by_type?.powerpoint || 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Two Columns: Recent Tasks with Timeline vs Latest Report Documents */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 pt-1">
                            {/* Column 1: Active Tasks & Step Timeline Progress */}
                            <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-[#006BB4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                        <span>ความคืบหน้าภารกิจงานล่าสุด (Active Projects & Timeline)</span>
                                    </div>
                                    <Link
                                        href="/agency-docs"
                                        className="text-[11px] font-semibold text-[#006BB4] hover:underline"
                                    >
                                        ดูงานทั้งหมด →
                                    </Link>
                                </div>

                                {agencyDocsSummary.recent_tasks?.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-slate-400">
                                        ยังไม่มีรายการภารกิจงานในระบบ
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        {agencyDocsSummary.recent_tasks.map((t) => (
                                            <div
                                                key={t.id}
                                                className="p-3 bg-white border border-slate-200 rounded-lg hover:border-[#006BB4] transition shadow-2xs space-y-2 group"
                                            >
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                                                        รหัส {t.agency_code}: {t.agency_name}
                                                    </span>
                                                    <span className="text-[11px] font-bold text-[#006BB4]">
                                                        {t.progress_percent}%
                                                    </span>
                                                </div>

                                                <Link
                                                    href={`/agency-docs/${t.id}`}
                                                    className="font-bold text-xs text-slate-800 group-hover:text-[#006BB4] transition line-clamp-1 block"
                                                >
                                                    {t.title}
                                                </Link>

                                                {/* Progress Bar */}
                                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                            t.progress_percent === 100
                                                                ? 'bg-emerald-500'
                                                                : t.progress_percent >= 50
                                                                ? 'bg-[#006BB4]'
                                                                : 'bg-amber-500'
                                                        }`}
                                                        style={{ width: `${t.progress_percent}%` }}
                                                    ></div>
                                                </div>

                                                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                                                    <span>{t.steps_count} ขั้นตอน • {t.attachments_count} เอกสาร</span>
                                                    <Link
                                                        href={`/agency-docs/${t.id}`}
                                                        className="text-[#006BB4] hover:underline font-semibold"
                                                    >
                                                        เข้าดู Timeline →
                                                    </Link>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Column 2: Latest Uploaded Report Documents */}
                            <div className="bg-slate-50/50 border border-slate-200 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                                        <svg className="w-4 h-4 text-[#00A88F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                        </svg>
                                        <span>เอกสารรายงานผลที่อัปโหลดล่าสุด (Recent Report Files)</span>
                                    </div>
                                    <Link
                                        href="/agency-docs"
                                        className="text-[11px] font-semibold text-[#006BB4] hover:underline"
                                    >
                                        คลังเอกสารรวม →
                                    </Link>
                                </div>

                                {agencyDocsSummary.latest_docs?.length === 0 ? (
                                    <div className="py-8 text-center text-xs text-slate-400">
                                        ยังไม่มีเอกสารรายงานผลแนบในระบบ
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {agencyDocsSummary.latest_docs.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="p-2.5 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition flex items-center justify-between gap-3"
                                            >
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    {doc.file_type === 'pdf' ? (
                                                        <span className="w-7 h-7 rounded bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                            PDF
                                                        </span>
                                                    ) : doc.file_type === 'word' ? (
                                                        <span className="w-7 h-7 rounded bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                            DOC
                                                        </span>
                                                    ) : doc.file_type === 'excel' ? (
                                                        <span className="w-7 h-7 rounded bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                            XLS
                                                        </span>
                                                    ) : (
                                                        <span className="w-7 h-7 rounded bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center text-[10px] font-bold shrink-0">
                                                            PPT
                                                        </span>
                                                    )}

                                                    <div className="min-w-0">
                                                        <div className="font-semibold text-xs text-slate-800 truncate" title={doc.file_name}>
                                                            {doc.file_name}
                                                        </div>
                                                        <div className="text-[10px] text-slate-400 truncate">
                                                            {doc.agency_name} • {doc.file_size} • {doc.created_at}
                                                        </div>
                                                    </div>
                                                </div>

                                                <a
                                                    href={`/agency-docs/attachments/${doc.id}/download`}
                                                    className="p-1.5 bg-slate-100 hover:bg-[#006BB4] hover:text-white text-slate-600 rounded transition cursor-pointer shrink-0"
                                                    title="ดาวน์โหลดเอกสาร"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: 2x2 SECTION GROUPS (SECURITY MODULES) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* ENDPOINT SECURITY */}
                        <div className="bg-white border border-[#D3DAE6] rounded-xl p-5 pt-7 relative shadow-xs">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-[#D3DAE6] rounded-full px-4 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap shadow-2xs">
                                ENDPOINT SECURITY MODULES
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    onClick={() =>
                                        openModule(
                                            'Configuration Assessment',
                                            'สแกนตรวจสอบการกำหนดค่าความปลอดภัยเซิร์ฟเวอร์โรงพยาบาลตามมาตรฐาน CIS Benchmark'
                                        )
                                    }
                                    className="bg-white border border-[#D3DAE6] hover:border-[#006BB4] rounded-lg p-4 flex items-start gap-3 cursor-pointer transition hover:shadow-md group"
                                >
                                    <div className="text-slate-700 group-hover:text-[#006BB4] transition">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            <circle cx="12" cy="12" r="3"></circle>
                                            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 group-hover:text-[#006BB4] text-xs">Configuration Assessment</div>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">ตรวจประเมินความมั่นคงปลอดภัยตามมาตรฐาน CIS</p>
                                    </div>
                                </div>

                                <div
                                    onClick={() =>
                                        openModule(
                                            'Malware Detection',
                                            'ตรวจจับสัญญาณพฤติกรรมมัลแวร์ แรนซัมแวร์ และการโจมตีทางไซเบอร์ต่อฐานข้อมูลสุขภาพ'
                                        )
                                    }
                                    className="bg-white border border-[#D3DAE6] hover:border-[#006BB4] rounded-lg p-4 flex items-start gap-3 cursor-pointer transition hover:shadow-md group"
                                >
                                    <div className="text-slate-700 group-hover:text-[#006BB4] transition">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="16" y1="13" x2="8" y2="13"></line>
                                            <line x1="16" y1="17" x2="8" y2="17"></line>
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 group-hover:text-[#006BB4] text-xs">Malware Detection</div>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">ตรวจจับมัลแวร์และพฤติกรรมเสี่ยงบน Endpoints</p>
                                    </div>
                                </div>

                                <div
                                    onClick={() =>
                                        openModule(
                                            'File Integrity Monitoring (FIM)',
                                            'เฝ้าระวังการเปลี่ยนแปลง แก้ไข ลบไฟล์สำคัญในระบบเซิร์ฟเวอร์ HOSxP/Web Portal'
                                        )
                                    }
                                    className="bg-white border border-[#D3DAE6] hover:border-[#006BB4] rounded-lg p-4 flex items-start gap-3 cursor-pointer transition hover:shadow-md group"
                                >
                                    <div className="text-slate-700 group-hover:text-[#006BB4] transition">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="3" y1="9" x2="21" y2="9"></line>
                                            <line x1="9" y1="21" x2="9" y2="9"></line>
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 group-hover:text-[#006BB4] text-xs">File Integrity Monitoring</div>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">เฝ้าระวังการแก้ไขไฟล์สำคัญของระบบ</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* THREAT INTELLIGENCE */}
                        <div className="bg-white border border-[#D3DAE6] rounded-xl p-5 pt-7 relative shadow-xs">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-[#D3DAE6] rounded-full px-4 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap shadow-2xs">
                                THREAT INTELLIGENCE & HUNTING
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div
                                    onClick={() =>
                                        openModule(
                                            'Threat Hunting',
                                            'ค้นหาและวิเคราะห์ภัยคุกคามขั้นสูง ความพยายาม Brute Force รหัสผ่าน และการเข้าสู่ระบบผิดปกติ'
                                        )
                                    }
                                    className="bg-white border border-[#D3DAE6] hover:border-[#006BB4] rounded-lg p-4 flex items-start gap-3 cursor-pointer transition hover:shadow-md group"
                                >
                                    <div className="text-slate-700 group-hover:text-[#006BB4] transition">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                            <circle cx="12" cy="11" r="3"></circle>
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 group-hover:text-[#006BB4] text-xs">Threat Hunting</div>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">สืบค้นภัยคุกคามและการเจาะระบบเครือข่าย</p>
                                    </div>
                                </div>

                                <div
                                    onClick={() =>
                                        openModule(
                                            'Vulnerability Detection',
                                            'ตรวจสอบช่องโหว่ซอฟต์แวร์ CVE ฐานข้อมูลระบบ และระบบปฏิบัติการของ รพ. ทุกแห่ง'
                                        )
                                    }
                                    className="bg-white border border-[#D3DAE6] hover:border-[#006BB4] rounded-lg p-4 flex items-start gap-3 cursor-pointer transition hover:shadow-md group"
                                >
                                    <div className="text-slate-700 group-hover:text-[#006BB4] transition">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 group-hover:text-[#006BB4] text-xs">Vulnerability Detection</div>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">ตรวจสอบช่องโหว่ความปลอดภัย CVE ฐานข้อมูล</p>
                                    </div>
                                </div>

                                <div
                                    onClick={() =>
                                        openModule(
                                            'MITRE ATT&CK',
                                            'การจำแนกรูปแบบการโจมตีตามเทคนิค Tactics & Techniques ของกรอบสากล MITRE ATT&CK'
                                        )
                                    }
                                    className="bg-white border border-[#D3DAE6] hover:border-[#006BB4] rounded-lg p-4 flex items-start gap-3 cursor-pointer transition hover:shadow-md group"
                                >
                                    <div className="text-slate-700 group-hover:text-[#006BB4] transition">
                                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="22" y1="12" x2="18" y2="12"></line>
                                            <line x1="6" y1="12" x2="2" y2="12"></line>
                                            <line x1="12" y1="6" x2="12" y2="2"></line>
                                            <line x1="12" y1="22" x2="12" y2="18"></line>
                                        </svg>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-slate-900 group-hover:text-[#006BB4] text-xs">MITRE ATT&CK</div>
                                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">จำแนกตามมาตรฐานเทคนิคการโจมตีสากล</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HOSPITAL NODE DETAIL MODAL */}
                    {selectedHospitalDetail && (
                        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
                                <div className="bg-gradient-to-r from-[#003B64] to-[#006BB4] text-white px-6 py-4 flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] bg-sky-300/20 text-sky-200 font-bold px-2 py-0.5 rounded">
                                            NODE {selectedHospitalDetail.code}
                                        </span>
                                        <h3 className="text-base font-bold mt-1">{selectedHospitalDetail.name}</h3>
                                        <p className="text-xs text-sky-100">{selectedHospitalDetail.type}</p>
                                    </div>
                                    <button
                                        onClick={() => setSelectedHospitalDetail(null)}
                                        className="text-white/70 hover:text-white cursor-pointer font-bold"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="p-6 space-y-4 text-xs">
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                                            <div className="text-slate-500 text-[10px]">จำนวนโหนดรวม</div>
                                            <div className="text-xl font-bold text-slate-800">{selectedHospitalDetail.total}</div>
                                        </div>
                                        <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                                            <div className="text-emerald-700 text-[10px]">Active (ออนไลน์)</div>
                                            <div className="text-xl font-bold text-emerald-700">{selectedHospitalDetail.active}</div>
                                        </div>
                                        <div className="bg-rose-50 p-3 rounded-xl border border-rose-200">
                                            <div className="text-rose-700 text-[10px]">Disconnected</div>
                                            <div className="text-xl font-bold text-rose-700">{selectedHospitalDetail.disconnected}</div>
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-2 border-t border-slate-200">
                                        <div className="flex justify-between py-1 border-b border-slate-100">
                                            <span className="text-slate-500">อัตราความพร้อมระบบ (Health):</span>
                                            <strong className="text-slate-800">{selectedHospitalDetail.health_score}%</strong>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-slate-100">
                                            <span className="text-slate-500">Subnet เครือข่าย:</span>
                                            <code className="font-mono text-slate-800">{selectedHospitalDetail.subnet}</code>
                                        </div>
                                        <div className="flex justify-between py-1 border-b border-slate-100">
                                            <span className="text-slate-500">ระบบปฏิบัติการหลัก:</span>
                                            <span className="text-slate-800 font-medium">{selectedHospitalDetail.os_primary}</span>
                                        </div>
                                    </div>

                                    <div className="pt-3 flex justify-end gap-2">
                                        <button
                                            onClick={() => setSelectedHospitalDetail(null)}
                                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                                        >
                                            ปิดหน้าต่าง
                                        </button>
                                        <Link
                                            href={`/webboard?agency_code=${selectedHospitalDetail.code}`}
                                            className="bg-[#006BB4] hover:bg-[#005590] text-white font-bold px-4 py-2 rounded-lg transition flex items-center gap-1.5"
                                        >
                                            <span>ดูกระทู้ของหน่วยงานนี้</span>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </CtmrLayout>
    );
}
