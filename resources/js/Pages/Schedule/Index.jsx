import React, { useState, useMemo } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import CtmrLayout from '../../Layouts/CtmrLayout';

const THAI_DAYS = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const THAI_DAYS_SHORT = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];

export default function Index({
    schedules = [],
    todayShifts = [],
    members = [],
    hospcodes = [],
    currentMonth,
    monthLabel,
    todayDate,
    filters = {},
    stats = {},
    shiftTypeLabels = {},
    statusLabels = {},
    roleLabels = {},
}) {
    const { auth } = usePage().props;
    const currentUser = auth?.user;

    // View mode: 'calendar' | 'list' | 'workload'
    const [viewMode, setViewMode] = useState('calendar');

    // Filters state
    const [selectedUserId, setSelectedUserId] = useState(filters.user_id || 'all');
    const [selectedShiftType, setSelectedShiftType] = useState(filters.shift_type || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedAgencyCode, setSelectedAgencyCode] = useState(filters.agency_code || 'all');

    // Modals state
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState(null);
    const [isAutoModalOpen, setIsAutoModalOpen] = useState(false);
    const [reportingSchedule, setReportingSchedule] = useState(null);
    const [selectedDayDetail, setSelectedDayDetail] = useState(null);

    // Form for Create / Edit Shift
    const {
        data: shiftData,
        setData: setShiftData,
        post: postShift,
        put: putShift,
        processing: shiftProcessing,
        errors: shiftErrors,
        reset: resetShift,
        clearErrors: clearShiftErrors,
    } = useForm({
        shift_date: todayDate,
        shift_type: 'morning',
        user_id: members[0]?.id || '',
        backup_user_id: '',
        role_in_shift: 'operator',
        status: 'scheduled',
        handover_notes: '',
    });

    // Form for Auto-Rotation Generator
    const {
        data: autoData,
        setData: setAutoData,
        post: postAuto,
        processing: autoProcessing,
        errors: autoErrors,
    } = useForm({
        month: currentMonth,
        pattern: 'weekday_only',
        member_ids: members.map((m) => m.id),
        assign_backup: true,
        clear_existing: false,
    });

    // Form for 1-Click Surveillance Report Submission
    const {
        data: reportData,
        setData: setReportData,
        post: postReport,
        processing: reportProcessing,
        errors: reportErrors,
        clearErrors: clearReportErrors,
    } = useForm({
        title: '',
        severity: 'normal',
        system_affected: 'Wazuh SIEM Cluster, Core Firewall, HIS Server Nodes (13 รพ.)',
        content: '',
        handover_notes: '',
    });

    // Group schedules by date string (YYYY-MM-DD)
    const schedulesByDate = useMemo(() => {
        const grouped = {};
        schedules.forEach((s) => {
            if (!grouped[s.shift_date]) {
                grouped[s.shift_date] = [];
            }
            grouped[s.shift_date].push(s);
        });
        return grouped;
    }, [schedules]);

    // Build 42-day calendar grid for currentMonth
    const calendarDays = useMemo(() => {
        const [yearStr, monthStr] = (currentMonth || '2026-10').split('-');
        const year = parseInt(yearStr, 10);
        const month = parseInt(monthStr, 10) - 1; // 0-indexed

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);

        const startDayOfWeek = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
        const daysInMonth = lastDayOfMonth.getDate();

        const cells = [];

        // Previous month padding days
        const prevMonthLastDate = new Date(year, month, 0).getDate();
        for (let i = startDayOfWeek - 1; i >= 0; i--) {
            const d = new Date(year, month - 1, prevMonthLastDate - i);
            const dateStr = formatDateYMD(d);
            cells.push({
                dateStr,
                dayNumber: d.getDate(),
                isCurrentMonth: false,
                isToday: dateStr === todayDate,
                isWeekend: d.getDay() === 0 || d.getDay() === 6,
                dayOfWeek: d.getDay(),
                shifts: schedulesByDate[dateStr] || [],
            });
        }

        // Current month days
        for (let day = 1; day <= daysInMonth; day++) {
            const d = new Date(year, month, day);
            const dateStr = formatDateYMD(d);
            cells.push({
                dateStr,
                dayNumber: day,
                isCurrentMonth: true,
                isToday: dateStr === todayDate,
                isWeekend: d.getDay() === 0 || d.getDay() === 6,
                dayOfWeek: d.getDay(),
                shifts: schedulesByDate[dateStr] || [],
            });
        }

        // Next month padding days to complete weeks (35 or 42 cells)
        const totalCells = cells.length <= 35 ? 35 : 42;
        const remaining = totalCells - cells.length;
        for (let i = 1; i <= remaining; i++) {
            const d = new Date(year, month + 1, i);
            const dateStr = formatDateYMD(d);
            cells.push({
                dateStr,
                dayNumber: i,
                isCurrentMonth: false,
                isToday: dateStr === todayDate,
                isWeekend: d.getDay() === 0 || d.getDay() === 6,
                dayOfWeek: d.getDay(),
                shifts: schedulesByDate[dateStr] || [],
            });
        }

        return cells;
    }, [currentMonth, todayDate, schedulesByDate]);

    function formatDateYMD(dateObj) {
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    // Filter navigation helper
    const applyFilters = (overrides = {}) => {
        const query = {
            month: overrides.month !== undefined ? overrides.month : currentMonth,
            user_id: overrides.user_id !== undefined ? overrides.user_id : selectedUserId,
            shift_type: overrides.shift_type !== undefined ? overrides.shift_type : selectedShiftType,
            status: overrides.status !== undefined ? overrides.status : selectedStatus,
            agency_code: overrides.agency_code !== undefined ? overrides.agency_code : selectedAgencyCode,
        };

        Object.keys(query).forEach((key) => {
            if (query[key] === 'all' || !query[key]) {
                delete query[key];
            }
        });

        router.get('/soc-schedule', query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleMonthChange = (offset) => {
        const [y, m] = currentMonth.split('-').map(Number);
        const target = new Date(y, m - 1 + offset, 1);
        const nextMonthStr = `${target.getFullYear()}-${String(target.getMonth() + 1).padStart(2, '0')}`;
        setAutoData('month', nextMonthStr);
        applyFilters({ month: nextMonthStr });
    };

    const handleGoToCurrentMonth = () => {
        const todayMonth = todayDate.slice(0, 7);
        setAutoData('month', todayMonth);
        applyFilters({ month: todayMonth });
    };

    const handleToggleMyShifts = () => {
        if (!currentUser) return;
        const nextUser = String(selectedUserId) === String(currentUser.id) ? 'all' : String(currentUser.id);
        setSelectedUserId(nextUser);
        applyFilters({ user_id: nextUser });
    };

    const handleResetFilters = () => {
        setSelectedUserId('all');
        setSelectedShiftType('all');
        setSelectedStatus('all');
        setSelectedAgencyCode('all');
        router.get('/soc-schedule', { month: currentMonth });
    };

    // Open Add Shift Modal
    const openAddShiftModal = (dateStr = todayDate, defaultShiftType = 'morning') => {
        clearShiftErrors();
        setEditingSchedule(null);
        setShiftData({
            shift_date: dateStr || todayDate,
            shift_type: defaultShiftType,
            user_id: members[0]?.id || '',
            backup_user_id: '',
            role_in_shift: 'operator',
            status: 'scheduled',
            handover_notes: getDefaultNoteByShift(defaultShiftType),
        });
        setIsAssignModalOpen(true);
    };

    // Open Edit Shift Modal
    const openEditShiftModal = (sched) => {
        clearShiftErrors();
        setEditingSchedule(sched);
        setShiftData({
            shift_date: sched.shift_date,
            shift_type: sched.shift_type,
            user_id: sched.user_id,
            backup_user_id: sched.backup_user_id || '',
            role_in_shift: sched.role_in_shift || 'operator',
            status: sched.raw_status || sched.status || 'scheduled',
            handover_notes: sched.handover_notes || '',
        });
        setIsAssignModalOpen(true);
    };

    const getDefaultNoteByShift = (type) => {
        switch (type) {
            case 'morning':
                return 'ตรวจสอบสถานะ Wazuh Agent 13 โรงพยาบาล, ทรัพยากรแม่ข่ายหลัก และสรุปเหตุการณ์ช่วงเช้า';
            case 'afternoon':
                return 'เฝ้าระวังทราฟฟิกเครือข่าย VPN, ตรวจสอบสถานะการสำรองข้อมูล (HIS Backup) และแจ้งเตือนภัยคุกคาม';
            case 'night':
                return 'เฝ้าระวังการโจมตีช่วงดึก (Brute Force / Ransomware / Port Scan) และเตรียมส่งมอบเวรเช้า';
            default:
                return 'เฝ้าระวังภาพรวมความมั่นคงปลอดภัยศูนย์ SOC ตลอด 24 ชม. และประสานงานผู้ดูแลระบบโรงพยาบาลเมื่อพบเหตุผิดปกติ';
        }
    };

    const handleSaveShift = (e) => {
        e.preventDefault();
        if (editingSchedule) {
            putShift(`/soc-schedule/${editingSchedule.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsAssignModalOpen(false);
                    setEditingSchedule(null);
                    resetShift();
                },
            });
        } else {
            postShift('/soc-schedule', {
                preserveScroll: true,
                onSuccess: () => {
                    setIsAssignModalOpen(false);
                    resetShift();
                },
            });
        }
    };

    const handleDeleteShift = (sched) => {
        if (!confirm(`ยืนยันการลบตารางเวรของ ${sched.user_name} ในวันที่ ${sched.shift_date_display} ?`)) return;
        router.delete(`/soc-schedule/${sched.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                if (editingSchedule?.id === sched.id) {
                    setIsAssignModalOpen(false);
                    setEditingSchedule(null);
                }
            },
        });
    };

    const handleCheckIn = (sched) => {
        router.patch(`/soc-schedule/${sched.id}/check-in`, {}, {
            preserveScroll: true,
        });
    };

    // Open Surveillance Report Submission Modal
    const openReportModal = (sched) => {
        clearReportErrors();
        setReportingSchedule(sched);
        const shiftTitle = shiftTypeLabels[sched.shift_type] || sched.shift_type;
        setReportData({
            title: `รายงานผลการเฝ้าระวังศูนย์ SOC ประจำ${shiftTitle} วันที่ ${sched.shift_date_display}`,
            severity: 'normal',
            system_affected: 'Wazuh SIEM Cluster, Core Firewall, ระบบแม่ข่าย HIS 13 โรงพยาบาล',
            content: `**สรุปผลการปฏิบัติงานเฝ้าระวังศูนย์ SOC (${shiftTitle}):**\n- **ผู้ปฏิบัติหน้าที่เวรหลัก:** ${sched.user_name} (${sched.agency_name || 'สสจ.พิจิตร'})${sched.backup_user_name ? `\n- **ผู้ปฏิบัติหน้าที่เวรสำรอง:** ${sched.backup_user_name}` : ''}\n\n**1. สถานะแม่ข่ายหลักและเครือข่ายจังหวัด:**\n- แม่ข่าย Wazuh SIEM & OpenSearch: ทำงานปกติ (CPU / RAM / Storage อยู่ในเกณฑ์ปกติ)\n- เครือข่าย VPN เชื่อมต่อ 13 หน่วยบริการ: ออนไลน์ปกติ\n\n**2. สถานะการเชื่อมต่อ Wazuh Agents (613 Nodes):**\n- ตรวจสอบสถานะ Agent ในโรงพยาบาลสังกัดจังหวัดพิจิตร เชื่อมต่อส่ง Log เข้าศูนย์ SOC ตามปกติ\n\n**3. เหตุการณ์ความมั่นคงปลอดภัยที่ตรวจพบ (Security Alerts & Incidents):**\n- ไม่พบเหตุการณ์บุกรุกระดับวิกฤต (Critical)\n- คัดกรองและตรวจสอบรายการแจ้งเตือนทั่วไป (Brute Force / Authentication Failure) เรียบร้อยแล้ว`,
            handover_notes: sched.handover_notes || 'ส่งมอบเวรให้กะถัดไปเฝ้าระวังต่อเนื่องตามปกติ',
        });
    };

    const handleSubmitReport = (e) => {
        e.preventDefault();
        if (!reportingSchedule) return;

        postReport(`/soc-schedule/${reportingSchedule.id}/submit-report`, {
            preserveScroll: true,
            onSuccess: () => {
                setReportingSchedule(null);
            },
        });
    };

    const handleAutoGenerate = (e) => {
        e.preventDefault();
        postAuto('/soc-schedule/auto-generate', {
            preserveScroll: true,
            onSuccess: () => {
                setIsAutoModalOpen(false);
            },
        });
    };

    const toggleMemberInAuto = (memberId) => {
        const exists = autoData.member_ids.includes(memberId);
        if (exists) {
            setAutoData(
                'member_ids',
                autoData.member_ids.filter((id) => id !== memberId)
            );
        } else {
            setAutoData('member_ids', [...autoData.member_ids, memberId]);
        }
    };

    // Styling helpers for shift badges
    const getShiftTheme = (shiftType) => {
        switch (shiftType) {
            case 'morning':
                return {
                    badgeBg: 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100',
                    headerBg: 'bg-sky-600 text-white',
                    icon: '🌤️',
                    shortLabel: 'เช้า',
                    timeRange: '08:00-16:00',
                };
            case 'afternoon':
                return {
                    badgeBg: 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100',
                    headerBg: 'bg-amber-500 text-white',
                    icon: '🌅',
                    shortLabel: 'บ่าย',
                    timeRange: '16:00-24:00',
                };
            case 'night':
                return {
                    badgeBg: 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100',
                    headerBg: 'bg-indigo-600 text-white',
                    icon: '🌙',
                    shortLabel: 'ดึก',
                    timeRange: '00:00-08:00',
                };
            default:
                return {
                    badgeBg: 'bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100',
                    headerBg: 'bg-teal-600 text-white',
                    icon: '🛡️',
                    shortLabel: '24ชม.',
                    timeRange: '24 ชั่วโมง',
                };
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return {
                    dot: 'bg-emerald-500',
                    bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                    label: 'ส่งรายงานแล้ว',
                    icon: '✓',
                };
            case 'checked_in':
                return {
                    dot: 'bg-blue-500 animate-ping',
                    bg: 'bg-blue-100 text-blue-800 border-blue-300',
                    label: 'กำลังเข้าเวร',
                    icon: '●',
                };
            case 'missed':
                return {
                    dot: 'bg-rose-500',
                    bg: 'bg-rose-100 text-rose-800 border-rose-300',
                    label: 'ยังไม่ส่งรายงาน',
                    icon: '!',
                };
            default:
                return {
                    dot: 'bg-slate-400',
                    bg: 'bg-slate-100 text-slate-700 border-slate-300',
                    label: 'รอเข้าเวร',
                    icon: '○',
                };
        }
    };

    return (
        <CtmrLayout title="SOC Duty Calendar" activeNav="soc-schedule">
            <Head title="ตารางเวรเฝ้าระวังศูนย์ SOC - CTMR R3 Phichit" />

            <div className="max-w-[1720px] mx-auto px-4 py-5 w-full flex-1 space-y-5">
                {/* 1. HERO HEADER & KPI OVERVIEW */}
                <div className="bg-gradient-to-r from-[#0F172A] via-[#003B64] to-[#006BB4] rounded-xl shadow-md p-6 text-white">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/15 pb-5">
                        <div>
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    24/7 SOC Surveillance Roster
                                </span>
                                <span className="text-sky-200/70 text-xs">
                                    | ศูนย์ปฏิบัติการความมั่นคงปลอดภัยไซเบอร์ สสจ.พิจิตร
                                </span>
                            </div>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center gap-2.5">
                                <svg className="w-7 h-7 text-sky-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6" strokeWidth="2"></line>
                                    <line x1="8" y1="2" x2="8" y2="6" strokeWidth="2"></line>
                                    <line x1="3" y1="10" x2="21" y2="10" strokeWidth="2"></line>
                                </svg>
                                ปฏิทินตารางเวรเฝ้าระวังและรายงานผลศูนย์ SOC
                            </h1>
                            <p className="text-sky-100/80 text-xs sm:text-sm mt-1 max-w-3xl">
                                บริหารจัดการตารางเวรหมุนเวียนรายเดือนสำหรับสมาชิกศูนย์ SOC ติดตามสถานะการเข้าเวร เช็คอินปฏิบัติงาน และส่งรายงานผลการเฝ้าระวังเชื่อมโยงกับกระดานข่าว SOC Webboard
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                                onClick={() => setIsAutoModalOpen(true)}
                                className="bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-xs px-3.5 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                จัดตารางเวรอัตโนมัติ (Auto-Roster)
                            </button>

                            <button
                                onClick={() => openAddShiftModal(todayDate, 'morning')}
                                className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                + มอบหมายเวรรายวัน
                            </button>

                            <Link
                                href="/webboard?category=soc_report"
                                className="bg-white/15 hover:bg-white/25 text-white border border-white/20 font-semibold text-xs px-3.5 py-2.5 rounded-lg flex items-center gap-1.5 transition"
                            >
                                <svg className="w-4 h-4 text-sky-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                ดูประวัติรายงานเวรทั้งหมด
                            </Link>
                        </div>
                    </div>

                    {/* KPI STATS ROW */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-5">
                        <div className="bg-white/10 backdrop-blur-xs rounded-lg p-3 border border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-sky-400/20 flex items-center justify-center text-sky-200 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-[11px] text-sky-200/80 font-medium">จำนวนกะเวรเดือนนี้</div>
                                <div className="text-xl font-bold">{stats.total_shifts || 0} กะ</div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xs rounded-lg p-3 border border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-300 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-[11px] text-emerald-200/80 font-medium">ส่งรายงานผลแล้ว</div>
                                <div className="text-xl font-bold text-emerald-300">{stats.completed_shifts || 0} กะ</div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xs rounded-lg p-3 border border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-400/20 flex items-center justify-center text-blue-200 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-[11px] text-blue-200/80 font-medium">กำลังปฏิบัติหน้าที่</div>
                                <div className="text-xl font-bold text-blue-200">{stats.checked_in_shifts || 0} กะ</div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xs rounded-lg p-3 border border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-rose-400/20 flex items-center justify-center text-rose-300 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-[11px] text-rose-200/80 font-medium">ค้างส่งรายงานเวร</div>
                                <div className="text-xl font-bold text-rose-300">{stats.overdue_shifts || 0} กะ</div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xs rounded-lg p-3 border border-white/10 flex items-center gap-3 col-span-2 sm:col-span-1">
                            <div className="w-10 h-10 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-300 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-[11px] text-amber-200/80 font-medium">ความครบถ้วนการรายงาน</div>
                                <div className="text-xl font-bold text-amber-300">{stats.compliance_rate ?? 100}%</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. TODAY'S ACTIVE WATCH PANEL */}
                <div className="bg-white border border-[#D3DAE6] rounded-xl shadow-2xs overflow-hidden">
                    <div className="px-5 py-3.5 bg-gradient-to-r from-slate-800 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                            <h2 className="text-sm font-bold tracking-wide">
                                ศูนย์เฝ้าระวังประจำวันนี้ (Today's SOC Active Watch — {todayDate})
                            </h2>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-300">
                                เจ้าหน้าที่เวรสามารถกด <strong className="text-amber-300">"เช็คอินรับเวร"</strong> และ <strong className="text-emerald-300">"ส่งรายงานผลเฝ้าระวัง"</strong> ได้จากแผงนี้ทันที
                            </span>
                        </div>
                    </div>

                    <div className="p-4">
                        {todayShifts.length === 0 ? (
                            <div className="text-center py-6 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                                <p className="text-xs text-slate-500 mb-2">ยังไม่มีการกำหนดผู้เข้าเวรสำหรับวันนี้ ({todayDate})</p>
                                <button
                                    onClick={() => openAddShiftModal(todayDate, 'morning')}
                                    className="px-3.5 py-1.5 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-semibold rounded-md transition cursor-pointer"
                                >
                                    + กำหนดผู้เข้าเวรวันนี้ทันที
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {todayShifts.map((shift) => {
                                    const theme = getShiftTheme(shift.shift_type);
                                    const stBadge = getStatusBadge(shift.status);
                                    const isMyShift =
                                        currentUser &&
                                        (currentUser.id === shift.user_id || currentUser.id === shift.backup_user_id);

                                    return (
                                        <div
                                            key={shift.id}
                                            className={`rounded-lg border p-4 flex flex-col justify-between transition shadow-2xs ${
                                                isMyShift
                                                    ? 'border-[#006BB4] bg-sky-50/40 ring-1 ring-[#006BB4]/30'
                                                    : 'border-slate-200 bg-white'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between gap-2 mb-3">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${theme.headerBg}`}>
                                                        <span>{theme.icon}</span>
                                                        <span>{shift.shift_label}</span>
                                                    </span>

                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${stBadge.bg}`}>
                                                        <span className={`w-1.5 h-1.5 rounded-full ${stBadge.dot}`}></span>
                                                        <span>{stBadge.label}</span>
                                                    </span>
                                                </div>

                                                <div className="flex items-start justify-between gap-3 mb-2">
                                                    <div>
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-sm font-bold text-slate-800">{shift.user_name}</span>
                                                            {isMyShift && (
                                                                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#006BB4] text-white rounded">
                                                                    เวรของคุณ
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-slate-500 mt-0.5">
                                                            {shift.user_position} • <span className="font-mono text-[#006BB4]">{shift.user_provider_id}</span>
                                                        </div>
                                                        <div className="text-[11px] text-slate-500 mt-0.5">
                                                            🏥 {shift.agency_code} - {shift.agency_name}
                                                        </div>
                                                    </div>
                                                </div>

                                                {shift.backup_user_name && (
                                                    <div className="text-[11px] bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded border border-slate-200 mb-2">
                                                        <span className="font-semibold text-slate-600">ผู้ช่วย/เวรสำรอง:</span> {shift.backup_user_name} ({shift.backup_user_provider_id})
                                                    </div>
                                                )}

                                                {shift.handover_notes && (
                                                    <p className="text-[11px] text-slate-600 bg-slate-50 p-2 rounded border border-slate-200/80 mb-3 line-clamp-2">
                                                        📌 <span className="font-semibold">ภารกิจเฝ้าระวัง:</span> {shift.handover_notes}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
                                                <div className="text-[11px] text-slate-400">
                                                    {shift.checked_in_at ? `เช็คอิน: ${shift.checked_in_at}` : 'ยังไม่เช็คอิน'}
                                                </div>

                                                <div className="flex items-center gap-1.5">
                                                    {shift.status === 'scheduled' && (
                                                        <button
                                                            onClick={() => handleCheckIn(shift)}
                                                            className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded transition cursor-pointer"
                                                        >
                                                            ⏱️ เช็คอินรับเวร
                                                        </button>
                                                    )}

                                                    {shift.status !== 'completed' ? (
                                                        <button
                                                            onClick={() => openReportModal(shift)}
                                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded shadow-2xs transition cursor-pointer flex items-center gap-1"
                                                        >
                                                            <span>📝 ส่งรายงานเฝ้าระวัง</span>
                                                        </button>
                                                    ) : shift.soc_topic_id ? (
                                                        <Link
                                                            href={`/webboard/${shift.soc_topic_id}`}
                                                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 text-[11px] font-semibold rounded transition"
                                                        >
                                                            📄 เปิดดูรายงานเวร (#{shift.soc_topic_id})
                                                        </Link>
                                                    ) : null}

                                                    <button
                                                        onClick={() => openEditShiftModal(shift)}
                                                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition cursor-pointer"
                                                        title="แก้ไขเวร"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. CALENDAR CONTROLS & FILTER TOOLBAR */}
                <div className="bg-white border border-[#D3DAE6] rounded-xl p-4 shadow-2xs space-y-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                        {/* Month Navigation */}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => handleMonthChange(-1)}
                                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                                title="เดือนก่อนหน้า"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>

                            <div className="px-4 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-center min-w-[180px]">
                                <div className="text-sm font-bold text-slate-800">{monthLabel}</div>
                                <div className="text-[10px] text-slate-500 font-mono">{currentMonth}</div>
                            </div>

                            <button
                                onClick={() => handleMonthChange(1)}
                                className="p-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-slate-700 transition cursor-pointer"
                                title="เดือนถัดไป"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                </svg>
                            </button>

                            <button
                                onClick={handleGoToCurrentMonth}
                                className="px-3 py-1.5 text-xs font-semibold bg-sky-50 hover:bg-sky-100 text-[#006BB4] border border-sky-200 rounded-lg transition cursor-pointer"
                            >
                                เดือนปัจจุบัน
                            </button>
                        </div>

                        {/* View Switcher & Quick My Shifts */}
                        <div className="flex flex-wrap items-center gap-2">
                            {currentUser && (
                                <button
                                    onClick={handleToggleMyShifts}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                                        String(selectedUserId) === String(currentUser.id)
                                            ? 'bg-[#006BB4] text-white border-[#006BB4]'
                                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                    }`}
                                >
                                    <span>👤 เฉพาะเวรของฉัน ({currentUser.name})</span>
                                </button>
                            )}

                            <div className="inline-flex rounded-lg border border-slate-300 bg-slate-100 p-0.5">
                                <button
                                    onClick={() => setViewMode('calendar')}
                                    className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                                        viewMode === 'calendar'
                                            ? 'bg-white text-[#006BB4] shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    📅 มุมมองปฏิทิน
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                                        viewMode === 'list'
                                            ? 'bg-white text-[#006BB4] shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    📋 มุมมองตารางรายวัน
                                </button>
                                <button
                                    onClick={() => setViewMode('workload')}
                                    className={`px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer ${
                                        viewMode === 'workload'
                                            ? 'bg-white text-[#006BB4] shadow-2xs'
                                            : 'text-slate-600 hover:text-slate-900'
                                    }`}
                                >
                                    📊 สรุปภาระงานรายบุคคล
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filter Dropdowns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">กรองตามสมาชิก</label>
                            <select
                                value={selectedUserId}
                                onChange={(e) => {
                                    setSelectedUserId(e.target.value);
                                    applyFilters({ user_id: e.target.value });
                                }}
                                className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                            >
                                <option value="all">-- สมาชิกทุกคน ({members.length} คน) --</option>
                                {members.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name} ({m.provider_id})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">กะเวลาเข้าเวร (Shift)</label>
                            <select
                                value={selectedShiftType}
                                onChange={(e) => {
                                    setSelectedShiftType(e.target.value);
                                    applyFilters({ shift_type: e.target.value });
                                }}
                                className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                            >
                                <option value="all">-- ทุกกะเวลา --</option>
                                {Object.entries(shiftTypeLabels).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">สถานะการรายงานผล</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    applyFilters({ status: e.target.value });
                                }}
                                className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                            >
                                <option value="all">-- ทุกสถานะ --</option>
                                {Object.entries(statusLabels).map(([key, label]) => (
                                    <option key={key} value={key}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">หน่วยงานสังกัด (Hospcode)</label>
                            <select
                                value={selectedAgencyCode}
                                onChange={(e) => {
                                    setSelectedAgencyCode(e.target.value);
                                    applyFilters({ agency_code: e.target.value });
                                }}
                                className="w-full py-1.5 px-3 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                            >
                                <option value="all">-- ทุกโรงพยาบาล/หน่วยงาน --</option>
                                {hospcodes.map((h) => {
                                    const code = h.hospcode || h.code;
                                    return (
                                        <option key={code} value={code}>
                                            {code} - {h.name}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="flex items-end gap-2">
                            <button
                                onClick={handleResetFilters}
                                className="w-full py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-md transition cursor-pointer"
                            >
                                ล้างตัวกรองทั้งหมด
                            </button>
                        </div>
                    </div>

                    {/* Legend Bar */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 border-t border-slate-100">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="font-semibold text-slate-700">สัญลักษณ์กะเวร:</span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200">
                                🌤️ เช้า (08:00-16:00)
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                                🌅 บ่าย (16:00-24:00)
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-50 text-indigo-900 border border-indigo-200">
                                🌙 ดึก (00:00-08:00)
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-teal-50 text-teal-900 border border-teal-200">
                                🛡️ เวรประจำวัน (24 ชม.)
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="font-semibold text-slate-700">สถานะรายงาน:</span>
                            <span className="inline-flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> ส่งรายงานแล้ว
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span> กำลังเข้าเวร
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-slate-400"></span> รอเข้าเวร
                            </span>
                            <span className="inline-flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-rose-500"></span> ค้างส่งรายงาน
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4A. VIEW MODE: INTERACTIVE MONTHLY CALENDAR GRID */}
                {viewMode === 'calendar' && (
                    <div className="bg-white border border-[#D3DAE6] rounded-xl shadow-2xs overflow-hidden">
                        {/* Days of Week Header */}
                        <div className="grid grid-cols-7 bg-[#F5F7FA] border-b border-[#D3DAE6]">
                            {THAI_DAYS.map((dayName, idx) => (
                                <div
                                    key={dayName}
                                    className={`py-2.5 px-2 text-center text-xs font-bold uppercase tracking-wider border-r last:border-r-0 border-slate-200 ${
                                        idx === 0 ? 'text-rose-600 bg-rose-50/40' : idx === 6 ? 'text-indigo-600 bg-indigo-50/40' : 'text-slate-700'
                                    }`}
                                >
                                    <span className="hidden sm:inline">{dayName}</span>
                                    <span className="sm:hidden">{THAI_DAYS_SHORT[idx]}</span>
                                </div>
                            ))}
                        </div>

                        {/* Calendar Cells Grid */}
                        <div className="grid grid-cols-7 divide-x divide-y divide-slate-200">
                            {calendarDays.map((cell) => {
                                const hasShifts = cell.shifts.length > 0;
                                return (
                                    <div
                                        key={cell.dateStr}
                                        className={`min-h-[135px] sm:min-h-[155px] p-1.5 sm:p-2 flex flex-col justify-between transition group ${
                                            !cell.isCurrentMonth
                                                ? 'bg-slate-50/70 text-slate-400'
                                                : cell.isToday
                                                ? 'bg-sky-50/60 ring-2 ring-inset ring-[#006BB4]'
                                                : cell.isWeekend
                                                ? 'bg-slate-50/30 hover:bg-slate-50'
                                                : 'bg-white hover:bg-slate-50/60'
                                        }`}
                                    >
                                        {/* Cell Header: Date Number & Quick Add Button */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <div className="flex items-center gap-1.5">
                                                    <span
                                                        onClick={() => setSelectedDayDetail(cell)}
                                                        className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center cursor-pointer ${
                                                            cell.isToday
                                                                ? 'bg-[#006BB4] text-white shadow-xs'
                                                                : !cell.isCurrentMonth
                                                                ? 'text-slate-400'
                                                                : cell.dayOfWeek === 0
                                                                ? 'text-rose-600'
                                                                : cell.dayOfWeek === 6
                                                                ? 'text-indigo-600'
                                                                : 'text-slate-700 hover:bg-slate-200'
                                                        }`}
                                                    >
                                                        {cell.dayNumber}
                                                    </span>
                                                    {cell.isToday && (
                                                        <span className="text-[10px] font-bold text-[#006BB4] bg-sky-100 px-1.5 py-0.2 rounded">
                                                            วันนี้
                                                        </span>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => openAddShiftModal(cell.dateStr, cell.isWeekend ? 'daily' : 'morning')}
                                                    className="opacity-0 group-hover:opacity-100 focus:opacity-100 w-5 h-5 rounded bg-slate-100 hover:bg-[#006BB4] text-slate-600 hover:text-white flex items-center justify-center text-xs font-bold transition cursor-pointer"
                                                    title={`เพิ่มเวรวันที่ ${cell.dateStr}`}
                                                >
                                                    +
                                                </button>
                                            </div>

                                            {/* Shifts List inside Cell */}
                                            <div className="space-y-1">
                                                {cell.shifts.map((shift) => {
                                                    const theme = getShiftTheme(shift.shift_type);
                                                    const stBadge = getStatusBadge(shift.status);
                                                    const isMine =
                                                        currentUser &&
                                                        (currentUser.id === shift.user_id || currentUser.id === shift.backup_user_id);

                                                    return (
                                                        <div
                                                            key={shift.id}
                                                            onClick={() => setSelectedDayDetail(cell)}
                                                            className={`px-1.5 py-1 rounded border text-[11px] leading-tight cursor-pointer transition flex flex-col gap-0.5 ${theme.badgeBg} ${
                                                                isMine ? 'ring-1 ring-[#006BB4] font-semibold' : ''
                                                            }`}
                                                        >
                                                            <div className="flex items-center justify-between gap-1">
                                                                <span className="font-bold truncate flex items-center gap-1">
                                                                    <span>{theme.icon}</span>
                                                                    <span className="truncate">{shift.user_name}</span>
                                                                </span>
                                                                <span
                                                                    className={`w-2 h-2 rounded-full shrink-0 ${stBadge.dot}`}
                                                                    title={stBadge.label}
                                                                ></span>
                                                            </div>
                                                            <div className="flex items-center justify-between text-[10px] opacity-80">
                                                                <span>{theme.shortLabel}</span>
                                                                <span className="font-mono">{shift.agency_code}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Cell Footer */}
                                        {hasShifts && (
                                            <div className="pt-1 mt-1 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                                                <span>{cell.shifts.length} กะ</span>
                                                <button
                                                    onClick={() => setSelectedDayDetail(cell)}
                                                    className="text-[#006BB4] hover:underline font-medium cursor-pointer"
                                                >
                                                    รายละเอียด
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 4B. VIEW MODE: DAILY SCHEDULE TABLE LIST */}
                {viewMode === 'list' && (
                    <div className="bg-white border border-[#D3DAE6] rounded-xl shadow-2xs overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-[#D3DAE6] bg-slate-50 flex items-center justify-between">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                รายการตารางเวรประจำเดือน {monthLabel} ({schedules.length} รายการ)
                            </h3>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-[#F5F7FA] text-slate-600 font-semibold border-b border-[#D3DAE6] uppercase">
                                    <tr>
                                        <th className="p-3.5">วันที่เข้าเวร</th>
                                        <th className="p-3.5">กะเวลาเฝ้าระวัง</th>
                                        <th className="p-3.5">ผู้เข้าเวรหลัก</th>
                                        <th className="p-3.5">ผู้เข้าเวรสำรอง</th>
                                        <th className="p-3.5">หน่วยงานสังกัด (Hospcode)</th>
                                        <th className="p-3.5">สถานะการรายงานผล</th>
                                        <th className="p-3.5 text-right">การจัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {schedules.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="p-8 text-center text-slate-400">
                                                ไม่พบข้อมูลตารางเวรในเดือนนี้
                                            </td>
                                        </tr>
                                    ) : (
                                        schedules.map((sched) => {
                                            const theme = getShiftTheme(sched.shift_type);
                                            const stBadge = getStatusBadge(sched.status);
                                            return (
                                                <tr key={sched.id} className="hover:bg-slate-50 transition">
                                                    <td className="p-3.5 font-mono font-semibold text-slate-800 whitespace-nowrap">
                                                        {sched.shift_date_display}
                                                        {sched.shift_date === todayDate && (
                                                            <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-sky-100 text-[#006BB4] rounded font-sans font-bold">
                                                                วันนี้
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3.5 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded border text-xs font-semibold ${theme.badgeBg}`}>
                                                            <span>{theme.icon}</span>
                                                            <span>{sched.shift_label}</span>
                                                        </span>
                                                    </td>
                                                    <td className="p-3.5">
                                                        <div className="font-bold text-slate-800">{sched.user_name}</div>
                                                        <div className="text-[11px] text-slate-500">
                                                            {sched.user_position} ({sched.user_provider_id})
                                                        </div>
                                                    </td>
                                                    <td className="p-3.5">
                                                        {sched.backup_user_name ? (
                                                            <div>
                                                                <div className="font-medium text-slate-700">{sched.backup_user_name}</div>
                                                                <div className="text-[11px] font-mono text-slate-400">{sched.backup_user_provider_id}</div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-slate-400">-</span>
                                                        )}
                                                    </td>
                                                    <td className="p-3.5">
                                                        <div className="font-medium text-slate-700">{sched.agency_name}</div>
                                                        <div className="text-[11px] font-mono text-slate-400">Hospcode: {sched.agency_code}</div>
                                                    </td>
                                                    <td className="p-3.5 whitespace-nowrap">
                                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${stBadge.bg}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${stBadge.dot}`}></span>
                                                            <span>{stBadge.label}</span>
                                                        </span>
                                                        {sched.completed_at && (
                                                            <div className="text-[10px] text-slate-400 mt-0.5">เมื่อ {sched.completed_at}</div>
                                                        )}
                                                    </td>
                                                    <td className="p-3.5 text-right whitespace-nowrap">
                                                        <div className="flex items-center justify-end gap-1.5">
                                                            {sched.status !== 'completed' ? (
                                                                <button
                                                                    onClick={() => openReportModal(sched)}
                                                                    className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded transition cursor-pointer"
                                                                >
                                                                    📝 ส่งรายงานผล
                                                                </button>
                                                            ) : sched.soc_topic_id ? (
                                                                <Link
                                                                    href={`/webboard/${sched.soc_topic_id}`}
                                                                    className="px-2.5 py-1 bg-sky-50 hover:bg-sky-100 text-[#006BB4] border border-sky-200 text-[11px] font-semibold rounded transition"
                                                                >
                                                                    ดูรายงาน #{sched.soc_topic_id}
                                                                </Link>
                                                            ) : null}

                                                            <button
                                                                onClick={() => openEditShiftModal(sched)}
                                                                className="p-1.5 text-slate-500 hover:text-[#006BB4] hover:bg-slate-100 rounded transition cursor-pointer"
                                                                title="แก้ไข"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                </svg>
                                                            </button>

                                                            <button
                                                                onClick={() => handleDeleteShift(sched)}
                                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition cursor-pointer"
                                                                title="ลบเวร"
                                                            >
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* 4C. VIEW MODE: MEMBER WORKLOAD & COMPLIANCE SUMMARY */}
                {viewMode === 'workload' && (
                    <div className="bg-white border border-[#D3DAE6] rounded-xl shadow-2xs overflow-hidden">
                        <div className="px-5 py-3.5 border-b border-[#D3DAE6] bg-slate-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                                    สรุปภาระงานการจัดเวรและการส่งรายงานผลรายบุคคล ({monthLabel})
                                </h3>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                    ใช้ตรวจสอบความสมดุลของการกระจายเวร (Fair Workload Balancing) และวินัยการส่งรายงานเฝ้าระวังของสมาชิกแต่ละคน
                                </p>
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-[#F5F7FA] text-slate-600 font-semibold border-b border-[#D3DAE6] uppercase">
                                    <tr>
                                        <th className="p-3.5">สมาชิกศูนย์ SOC</th>
                                        <th className="p-3.5">หน่วยงานสังกัด</th>
                                        <th className="p-3.5 text-center">เวรเช้า</th>
                                        <th className="p-3.5 text-center">เวรบ่าย</th>
                                        <th className="p-3.5 text-center">เวรดึก</th>
                                        <th className="p-3.5 text-center">เวร 24 ชม.</th>
                                        <th className="p-3.5 text-center">รวมเวรหลัก</th>
                                        <th className="p-3.5 text-center">เวรสำรอง</th>
                                        <th className="p-3.5 text-center">ส่งรายงานแล้ว</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {members.map((m) => (
                                        <tr key={m.id} className="hover:bg-slate-50 transition">
                                            <td className="p-3.5">
                                                <div className="font-bold text-slate-800">{m.name}</div>
                                                <div className="text-[11px] text-slate-500">
                                                    <span className="font-mono text-[#006BB4]">{m.provider_id}</span> • {m.position}
                                                </div>
                                            </td>
                                            <td className="p-3.5">
                                                <div className="font-medium text-slate-700">{m.agency_name}</div>
                                                <div className="text-[11px] font-mono text-slate-400">Hospcode: {m.agency_code}</div>
                                            </td>
                                            <td className="p-3.5 text-center font-semibold text-sky-700">{m.morning_count}</td>
                                            <td className="p-3.5 text-center font-semibold text-amber-700">{m.afternoon_count}</td>
                                            <td className="p-3.5 text-center font-semibold text-indigo-700">{m.night_count}</td>
                                            <td className="p-3.5 text-center font-semibold text-teal-700">{m.daily_count}</td>
                                            <td className="p-3.5 text-center">
                                                <span className="px-2.5 py-1 rounded-full font-bold bg-sky-100 text-[#006BB4]">
                                                    {m.total_shifts} กะ
                                                </span>
                                            </td>
                                            <td className="p-3.5 text-center font-medium text-slate-600">{m.backup_shifts} กะ</td>
                                            <td className="p-3.5 text-center">
                                                <span className="px-2.5 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800">
                                                    {m.completed_shifts} / {m.total_shifts}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* MODAL 1: DAY DETAIL & SHIFT ACTIONS DRAWER/MODAL */}
            {selectedDayDetail && (
                <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    ตารางเวรประจำวันที่ {selectedDayDetail.dateStr}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    มีทั้งหมด {selectedDayDetail.shifts.length} กะเฝ้าระวัง
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => {
                                        const dateStr = selectedDayDetail.dateStr;
                                        setSelectedDayDetail(null);
                                        openAddShiftModal(dateStr, 'morning');
                                    }}
                                    className="px-3 py-1.5 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-semibold rounded-md transition cursor-pointer"
                                >
                                    + เพิ่มเวรในวันนี้
                                </button>
                                <button
                                    onClick={() => setSelectedDayDetail(null)}
                                    className="text-slate-400 hover:text-slate-600 p-1.5 rounded cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-3">
                            {selectedDayDetail.shifts.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-xs">
                                    ยังไม่มีการมอบหมายเวรในวันนี้
                                </div>
                            ) : (
                                selectedDayDetail.shifts.map((shift) => {
                                    const theme = getShiftTheme(shift.shift_type);
                                    const stBadge = getStatusBadge(shift.status);
                                    return (
                                        <div key={shift.id} className="border border-slate-200 rounded-lg p-4 space-y-2.5 bg-slate-50/50">
                                            <div className="flex items-center justify-between">
                                                <span className={`px-2.5 py-1 rounded text-xs font-bold ${theme.headerBg}`}>
                                                    {theme.icon} {shift.shift_label}
                                                </span>
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${stBadge.bg}`}>
                                                    {stBadge.label}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                                <div>
                                                    <span className="text-slate-500">ผู้เข้าเวรหลัก:</span>{' '}
                                                    <strong className="text-slate-800">{shift.user_name}</strong> ({shift.user_provider_id})
                                                </div>
                                                <div>
                                                    <span className="text-slate-500">หน่วยงาน:</span>{' '}
                                                    <span className="text-slate-700">
                                                        {shift.agency_code} - {shift.agency_name}
                                                    </span>
                                                </div>
                                                {shift.backup_user_name && (
                                                    <div>
                                                        <span className="text-slate-500">ผู้เข้าเวรสำรอง:</span>{' '}
                                                        <span className="text-slate-700">{shift.backup_user_name}</span>
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="text-slate-500">บทบาทในเวร:</span>{' '}
                                                    <span className="text-slate-700">{shift.role_label}</span>
                                                </div>
                                            </div>

                                            {shift.handover_notes && (
                                                <div className="text-xs bg-white p-2.5 rounded border border-slate-200 text-slate-600">
                                                    <strong>ภารกิจ/หมายเหตุส่งมอบเวร:</strong> {shift.handover_notes}
                                                </div>
                                            )}

                                            <div className="pt-2 border-t border-slate-200 flex items-center justify-end gap-2">
                                                {shift.status === 'scheduled' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDayDetail(null);
                                                            handleCheckIn(shift);
                                                        }}
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded cursor-pointer"
                                                    >
                                                        ⏱️ เช็คอินรับเวร
                                                    </button>
                                                )}

                                                {shift.status !== 'completed' ? (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedDayDetail(null);
                                                            openReportModal(shift);
                                                        }}
                                                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded cursor-pointer"
                                                    >
                                                        📝 บันทึกรายงานผลเฝ้าระวัง
                                                    </button>
                                                ) : shift.soc_topic_id ? (
                                                    <Link
                                                        href={`/webboard/${shift.soc_topic_id}`}
                                                        className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-semibold rounded"
                                                    >
                                                        📄 ดูรายงานเวร (#{shift.soc_topic_id})
                                                    </Link>
                                                ) : null}

                                                <button
                                                    onClick={() => {
                                                        setSelectedDayDetail(null);
                                                        openEditShiftModal(shift);
                                                    }}
                                                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded cursor-pointer"
                                                >
                                                    แก้ไข
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedDayDetail(null);
                                                        handleDeleteShift(shift);
                                                    }}
                                                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded cursor-pointer"
                                                >
                                                    ลบ
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL 2: ASSIGN / EDIT SHIFT MODAL */}
            {isAssignModalOpen && (
                <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-xl w-full flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    {editingSchedule ? 'แก้ไขตารางเวรเฝ้าระวัง SOC' : 'มอบหมายเวรเฝ้าระวังศูนย์ SOC'}
                                </h3>
                                <p className="text-xs text-slate-500">
                                    เลือกวันที่ กะเวลา และสมาชิกที่รับผิดชอบการเฝ้าระวัง
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAssignModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveShift} className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        วันที่เข้าเวร <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={shiftData.shift_date}
                                        onChange={(e) => setShiftData('shift_date', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                        required
                                    />
                                    {shiftErrors.shift_date && <p className="mt-1 text-xs text-rose-600">{shiftErrors.shift_date}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        กะเวลาเฝ้าระวัง <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={shiftData.shift_type}
                                        onChange={(e) => {
                                            const nextType = e.target.value;
                                            setShiftData((prev) => ({
                                                ...prev,
                                                shift_type: nextType,
                                                handover_notes: prev.handover_notes || getDefaultNoteByShift(nextType),
                                            }));
                                        }}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    >
                                        {Object.entries(shiftTypeLabels).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    {shiftErrors.shift_type && <p className="mt-1 text-xs text-rose-600">{shiftErrors.shift_type}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        สมาชิกผู้เข้าเวรหลัก <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={shiftData.user_id}
                                        onChange={(e) => setShiftData('user_id', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                        required
                                    >
                                        {members.map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name} ({m.agency_code} - {m.agency_name})
                                            </option>
                                        ))}
                                    </select>
                                    {shiftErrors.user_id && <p className="mt-1 text-xs text-rose-600">{shiftErrors.user_id}</p>}
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        ผู้ช่วย / เวรสำรอง (ถ้ามี)
                                    </label>
                                    <select
                                        value={shiftData.backup_user_id}
                                        onChange={(e) => setShiftData('backup_user_id', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    >
                                        <option value="">-- ไม่ระบุเวรสำรอง --</option>
                                        {members
                                            .filter((m) => String(m.id) !== String(shiftData.user_id))
                                            .map((m) => (
                                                <option key={m.id} value={m.id}>
                                                    {m.name} ({m.agency_code} - {m.agency_name})
                                                </option>
                                            ))}
                                    </select>
                                    {shiftErrors.backup_user_id && (
                                        <p className="mt-1 text-xs text-rose-600">{shiftErrors.backup_user_id}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">บทบาทในเวร</label>
                                    <select
                                        value={shiftData.role_in_shift}
                                        onChange={(e) => setShiftData('role_in_shift', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    >
                                        {Object.entries(roleLabels).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {editingSchedule && (
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700 mb-1">สถานะเวร</label>
                                        <select
                                            value={shiftData.status}
                                            onChange={(e) => setShiftData('status', e.target.value)}
                                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                        >
                                            {Object.entries(statusLabels).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    ภารกิจเฝ้าระวัง / หมายเหตุส่งมอบเวร
                                </label>
                                <textarea
                                    rows="3"
                                    value={shiftData.handover_notes}
                                    onChange={(e) => setShiftData('handover_notes', e.target.value)}
                                    placeholder="ระบุรายการระบบที่ต้องมอนิเตอร์เป็นพิเศษ หรือหมายเหตุส่งต่อ..."
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                />
                            </div>

                            <div className="px-6 py-4 -mx-6 -mb-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAssignModalOpen(false)}
                                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded cursor-pointer"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={shiftProcessing}
                                    className="px-4 py-2 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
                                >
                                    {shiftProcessing ? 'กำลังบันทึก...' : 'บันทึกตารางเวร'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 3: AUTO-ROTATION ROSTER GENERATOR */}
            {isAutoModalOpen && (
                <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div>
                                <h3 className="text-base font-bold text-slate-800">
                                    ระบบจัดตารางเวรหมุนเวียนอัตโนมัติ (Auto-Rotation Generator)
                                </h3>
                                <p className="text-xs text-slate-500">
                                    กระจายเวรเฝ้าระวังรายเดือนให้สมาชิกแต่ละคนอย่างเท่าเทียมกัน (Round-Robin Workload Balancing)
                                </p>
                            </div>
                            <button
                                onClick={() => setIsAutoModalOpen(false)}
                                className="text-slate-400 hover:text-slate-600 p-1.5 rounded cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleAutoGenerate} className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        เดือนที่ต้องการจัดตารางเวร <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="month"
                                        value={autoData.month}
                                        onChange={(e) => setAutoData('month', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        รูปแบบการจัดกะเวร <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={autoData.pattern}
                                        onChange={(e) => setAutoData('pattern', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    >
                                        <option value="weekday_only">วันธรรมดา 2 กะ (เช้า-บ่าย) + วันหยุดเวร 24 ชม. (แนะนำ)</option>
                                        <option value="two_shifts">ทุกวัน วันละ 2 กะ (เวรเช้า + เวรบ่าย)</option>
                                        <option value="three_shifts">เต็มรูปแบบ 24/7 วันละ 3 กะ (เช้า + บ่าย + ดึก)</option>
                                        <option value="daily_watch">เวรประจำวัน (On-Call 24 ชม.) วันละ 1 กะ</option>
                                    </select>
                                </div>
                            </div>

                            {/* Member Selection */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-semibold text-slate-700">
                                        เลือกสมาชิกที่นำมาหมุนเวียนเข้าเวร ({autoData.member_ids.length} / {members.length} คน)
                                    </label>
                                    <div className="flex items-center gap-2 text-[11px]">
                                        <button
                                            type="button"
                                            onClick={() => setAutoData('member_ids', members.map((m) => m.id))}
                                            className="text-[#006BB4] hover:underline cursor-pointer"
                                        >
                                            เลือกทั้งหมด
                                        </button>
                                        <span>•</span>
                                        <button
                                            type="button"
                                            onClick={() => setAutoData('member_ids', [])}
                                            className="text-slate-500 hover:underline cursor-pointer"
                                        >
                                            ล้างการเลือก
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 border border-slate-200 rounded-lg">
                                    {members.map((m) => {
                                        const checked = autoData.member_ids.includes(m.id);
                                        return (
                                            <label
                                                key={m.id}
                                                className={`flex items-center gap-2.5 p-2 rounded border text-xs cursor-pointer transition ${
                                                    checked
                                                        ? 'bg-sky-50 border-sky-300 text-slate-800'
                                                        : 'bg-white border-slate-200 text-slate-500'
                                                }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    onChange={() => toggleMemberInAuto(m.id)}
                                                    className="w-4 h-4 text-[#006BB4] rounded border-slate-300"
                                                />
                                                <div className="truncate">
                                                    <div className="font-semibold truncate">{m.name}</div>
                                                    <div className="text-[10px] text-slate-400 truncate">
                                                        {m.agency_code} - {m.agency_name}
                                                    </div>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                                {autoErrors.member_ids && <p className="mt-1 text-xs text-rose-600">{autoErrors.member_ids}</p>}
                            </div>

                            <div className="space-y-2 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={autoData.assign_backup}
                                        onChange={(e) => setAutoData('assign_backup', e.target.checked)}
                                        className="w-4 h-4 text-[#006BB4] rounded border-slate-300"
                                    />
                                    <span className="text-xs text-slate-700 font-medium">
                                        จัดเจ้าหน้าที่สำรอง (Backup Operator) คู่กับเวรหลักโดยอัตโนมัติ
                                    </span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={autoData.clear_existing}
                                        onChange={(e) => setAutoData('clear_existing', e.target.checked)}
                                        className="w-4 h-4 text-rose-600 rounded border-slate-300"
                                    />
                                    <span className="text-xs text-slate-700 font-medium">
                                        ล้างตารางเวรเดิมที่ยังไม่ได้ส่งรายงานในเดือนนั้นก่อนจัดใหม่
                                    </span>
                                </label>
                            </div>

                            <div className="px-6 py-4 -mx-6 -mb-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAutoModalOpen(false)}
                                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded cursor-pointer"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={autoProcessing}
                                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded cursor-pointer disabled:opacity-50"
                                >
                                    {autoProcessing ? 'กำลังสร้างตารางเวร...' : '⚡ สร้างตารางเวรอัตโนมัติ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL 4: 1-CLICK SURVEILLANCE REPORT SUBMISSION */}
            {reportingSchedule && (
                <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden max-h-[92vh]">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-emerald-900 text-white">
                            <div>
                                <h3 className="text-base font-bold flex items-center gap-2">
                                    <span>📝 บันทึกรายงานผลการเฝ้าระวังศูนย์ SOC</span>
                                </h3>
                                <p className="text-xs text-emerald-200 mt-0.5">
                                    ผู้เข้าเวร: {reportingSchedule.user_name} • {reportingSchedule.shift_label} • วันที่ {reportingSchedule.shift_date_display}
                                </p>
                            </div>
                            <button
                                onClick={() => setReportingSchedule(null)}
                                className="text-emerald-200 hover:text-white p-1.5 rounded cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmitReport} className="p-6 overflow-y-auto space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    หัวข้อรายงานผลการเฝ้าระวัง <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={reportData.title}
                                    onChange={(e) => setReportData('title', e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-semibold"
                                    required
                                />
                                {reportErrors.title && <p className="mt-1 text-xs text-rose-600">{reportErrors.title}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        ระดับความรุนแรงของเหตุการณ์ที่พบในเวร <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={reportData.severity}
                                        onChange={(e) => setReportData('severity', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                    >
                                        <option value="normal">🟢 ปกติ (Normal - ไม่พบภัยคุกคามรุนแรง)</option>
                                        <option value="low">🔵 ต่ำ (Low - พบแจ้งเตือนทั่วไป)</option>
                                        <option value="medium">🟡 ปานกลาง (Medium - ต้องติดตามเฝ้าระวัง)</option>
                                        <option value="high">🟠 สูง (High - พบความผิดปกติต้องแก้ไข)</option>
                                        <option value="critical">🔴 วิกฤต (Critical - พบการโจมตี/ระบบล่ม)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        ระบบที่ทำการเฝ้าระวัง <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={reportData.system_affected}
                                        onChange={(e) => setReportData('system_affected', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    รายละเอียดผลการเฝ้าระวังประจำเวร (ส่งไปยัง SOC Webboard อัตโนมัติ) <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    rows="9"
                                    value={reportData.content}
                                    onChange={(e) => setReportData('content', e.target.value)}
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600 font-mono leading-relaxed"
                                    required
                                />
                                {reportErrors.content && <p className="mt-1 text-xs text-rose-600">{reportErrors.content}</p>}
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">
                                    บันทึกการส่งมอบงานให้เวรกะถัดไป (Handover Notes)
                                </label>
                                <input
                                    type="text"
                                    value={reportData.handover_notes}
                                    onChange={(e) => setReportData('handover_notes', e.target.value)}
                                    placeholder="ระบุสิ่งที่เวรถัดไปต้องติดตามต่อ..."
                                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-600"
                                />
                            </div>

                            <div className="px-6 py-4 -mx-6 -mb-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setReportingSchedule(null)}
                                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded cursor-pointer"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={reportProcessing}
                                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-sm cursor-pointer disabled:opacity-50"
                                >
                                    {reportProcessing ? 'กำลังส่งรายงาน...' : '✓ ยืนยันส่งรายงานผลการเฝ้าระวัง'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </CtmrLayout>
    );
}

