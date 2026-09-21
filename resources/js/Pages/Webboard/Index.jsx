import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import CtmrLayout from '../../Layouts/CtmrLayout';

export default function Index({
    topics,
    filters,
    stats,
    agencies,
    categoryLabels,
    severityLabels,
    statusLabels,
    shiftLabels,
}) {
    const { auth, flash, errors: pageErrors } = usePage().props;

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedSeverity, setSelectedSeverity] = useState(filters.severity || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedAgency, setSelectedAgency] = useState(filters.agency_code || 'all');
    const [selectedShift, setSelectedShift] = useState(filters.shift || 'all');

    // Create Topic Modal
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        title: '',
        category: 'discussion',
        severity: 'normal',
        agency_code: auth?.user?.agency_code || '001',
        agency_name: auth?.user?.agency_name || '',
        shift: 'daily',
        shift_date: new Date().toISOString().split('T')[0],
        system_affected: '',
        content: '',
        images: [],
    });

    const handleFilterChange = (updates = {}) => {
        const query = {
            search: updates.search !== undefined ? updates.search : searchTerm,
            category: updates.category !== undefined ? updates.category : selectedCategory,
            severity: updates.severity !== undefined ? updates.severity : selectedSeverity,
            status: updates.status !== undefined ? updates.status : selectedStatus,
            agency_code: updates.agency_code !== undefined ? updates.agency_code : selectedAgency,
            shift: updates.shift !== undefined ? updates.shift : selectedShift,
        };

        // Clean out default 'all' or empty
        Object.keys(query).forEach((k) => {
            if (query[k] === 'all' || query[k] === '' || query[k] === null) {
                delete query[k];
            }
        });

        router.get('/webboard', query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilterChange({ search: searchTerm });
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedCategory('all');
        setSelectedSeverity('all');
        setSelectedStatus('all');
        setSelectedAgency('all');
        setSelectedShift('all');
        router.get('/webboard');
    };

    // Category presets for quick content template filling
    const applyTemplate = (category) => {
        let templateContent = '';
        let defaultSeverity = 'normal';
        let defaultSystem = '';

        if (category === 'soc_report') {
            defaultSeverity = 'normal';
            defaultSystem = 'Wazuh Cluster, Core Switch, Firewall';
            templateContent = `**สรุปผลการเฝ้าระวังประจำกะ:**\n1. สถานะแม่ข่ายหลัก: CPU ปกติ, Memory ปกติ, Storage ปกติ\n2. สถานะ Agent Nodes: เชื่อมต่อครบทุกหน่วยงาน\n3. เหตุการณ์ผิดปกติที่ตรวจพบ (Alerts & Incidents):\n   - ไม่พบเหตุการณ์บุกรุกร้ายแรง / หรือพบเหตุการณ์ดังนี้...\n4. การดำเนินการและการเฝ้าระวัง:\n   - ตรวจสอบ Log และระงับเหตุเบื้องต้น\n5. งานส่งมอบสำหรับกะถัดไป:\n   - สิ่งที่ต้องมอนิเตอร์เพิ่มเติม...`;
        } else if (category === 'incident_alert') {
            defaultSeverity = 'high';
            defaultSystem = 'HIS Server / Web Portal';
            templateContent = `**ลักษณะเหตุการณ์ที่ตรวจพบ:**\n- เวลาที่เกิดเหตุ: ${new Date().toLocaleTimeString('th-TH')}\n- ประเภทภัยคุกคาม: (เช่น Brute Force / Port Scan / Malware / DDoS)\n- เป้าหมายที่ได้รับผลกระทบ: IP / Hostname\n\n**ผลการวิเคราะห์เบื้องต้น:**\n- มีความเสียหายต่อระบบหรือไม่: ยังไม่พบความเสียหาย\n\n**มาตรการรับมือที่ได้ดำเนินการแล้ว:**\n- บล็อก IP ต้นทาง และแจ้งผู้ดูแลระบบหน่วยงาน`;
        } else if (category === 'discussion') {
            defaultSeverity = 'normal';
            templateContent = `**ประเด็นหรือข้อสงสัยที่ต้องการปรึกษา:**\n- ระบบ/โปรแกรมที่เกี่ยวข้อง:\n- อาการผิดปกติหรือปัญหาที่พบ:\n- ขั้นตอนหรือวิธีที่ได้ทดลองทำไปแล้ว:\n\nขอคำแนะนำจากทีมงานหรือผู้มีประสบการณ์ด้วยครับ`;
        } else if (category === 'troubleshoot') {
            defaultSeverity = 'low';
            templateContent = `**ปัญหาที่พบ (Issue):**\n- รายละเอียดอาการผิดปกติ\n\n**สาเหตุของปัญหา (Root Cause):**\n- เกิดจากการตั้งค่า หรืออัปเดตระบบ\n\n**ขั้นตอนการแก้ไข (Resolution Steps):**\n1. ขั้นตอนที่ 1...\n2. ขั้นตอนที่ 2...\n3. ตรวจสอบผลการทำงาน`;
        } else if (category === 'announcement') {
            defaultSeverity = 'info';
            templateContent = `เรียน ทีมงานศูนย์ SOC และผู้ดูแลระบบสารสนเทศทุกท่าน\n\nขอแจ้งรายละเอียดและแนวทางปฏิบัติดังนี้...`;
        }

        setData((prev) => ({
            ...prev,
            category,
            severity: defaultSeverity,
            system_affected: defaultSystem || prev.system_affected,
            content: templateContent,
        }));
    };

    const openCreateModal = (presetCategory = 'discussion') => {
        clearErrors();
        setData({
            title: '',
            category: presetCategory,
            severity: 'normal',
            agency_code: auth?.user?.agency_code || '001',
            agency_name: auth?.user?.agency_name || '',
            shift: 'daily',
            shift_date: new Date().toISOString().split('T')[0],
            system_affected: '',
            content: '',
            images: [],
        });
        setImagePreviews([]);
        applyTemplate(presetCategory);
        setIsCreateModalOpen(true);
    };

    const handleImageFiles = (files) => {
        const fileList = Array.from(files).filter((f) => f.type.startsWith('image/'));
        if (fileList.length === 0) return;

        const updatedImages = [...(data.images || []), ...fileList];
        setData('images', updatedImages);

        fileList.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews((prev) => [
                    ...prev,
                    {
                        name: file.name,
                        size: (file.size / 1024).toFixed(1) + ' KB',
                        url: e.target.result,
                        file: file,
                    },
                ]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleRemoveImage = (index) => {
        const newPreviews = [...imagePreviews];
        newPreviews.splice(index, 1);
        setImagePreviews(newPreviews);

        const newImages = [...data.images];
        newImages.splice(index, 1);
        setData('images', newImages);
    };

    // Support Ctrl+V / Cmd+V paste image from clipboard
    const handlePaste = (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        const pastedFiles = [];
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf('image') !== -1) {
                const blob = items[i].getAsFile();
                if (blob) {
                    const renamed = new File([blob], `screenshot_${Date.now()}.png`, { type: blob.type });
                    pastedFiles.push(renamed);
                }
            }
        }

        if (pastedFiles.length > 0) {
            handleImageFiles(pastedFiles);
        }
    };

    const handleCreateSubmit = (e) => {
        e.preventDefault();
        post('/webboard', {
            forceFormData: true,
            onSuccess: () => {
                setIsCreateModalOpen(false);
                setImagePreviews([]);
                reset();
            },
        });
    };

    // Category badge helper
    const getCategoryBadge = (cat) => {
        switch (cat) {
            case 'soc_report':
                return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: '📋', label: 'รายงานเวร SOC' };
            case 'incident_alert':
                return { bg: 'bg-rose-50 text-rose-700 border-rose-200', icon: '🚨', label: 'แจ้งเตือนภัยคุกคาม' };
            case 'troubleshoot':
                return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: '💡', label: 'บันทึกแก้ปัญหา (KB)' };
            case 'announcement':
                return { bg: 'bg-amber-50 text-amber-800 border-amber-200', icon: '📢', label: 'ประกาศ & ข่าวสาร' };
            default:
                return { bg: 'bg-sky-50 text-sky-700 border-sky-200', icon: '💬', label: 'แลกเปลี่ยนประเด็น' };
        }
    };

    // Severity badge helper
    const getSeverityBadge = (sev) => {
        switch (sev) {
            case 'critical':
                return { bg: 'bg-rose-600 text-white', label: 'วิกฤต (Critical)' };
            case 'high':
                return { bg: 'bg-orange-500 text-white', label: 'สูง (High)' };
            case 'medium':
                return { bg: 'bg-amber-500 text-white', label: 'ปานกลาง (Medium)' };
            case 'low':
                return { bg: 'bg-blue-500 text-white', label: 'ต่ำ (Low)' };
            default:
                return { bg: 'bg-slate-200 text-slate-700', label: 'ทั่วไป (Info)' };
        }
    };

    // Status badge helper
    const getStatusBadge = (st) => {
        switch (st) {
            case 'resolved':
                return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'แก้ไขแล้ว', dot: 'bg-emerald-500' };
            case 'in_progress':
                return { bg: 'bg-amber-100 text-amber-800 border-amber-300', label: 'กำลังดำเนินการ', dot: 'bg-amber-500' };
            case 'closed':
                return { bg: 'bg-slate-100 text-slate-700 border-slate-300', label: 'ปิดประเด็น', dot: 'bg-slate-400' };
            default:
                return { bg: 'bg-sky-100 text-sky-800 border-sky-300', label: 'เปิดประเด็น', dot: 'bg-sky-500' };
        }
    };

    return (
        <CtmrLayout title="SOC Webboard" activeNav="webboard">
            <Head title="กระดานข่าวสารและรายงานเวร SOC - CTMR R3 Phichit" />

            <div className="max-w-[1720px] mx-auto px-4 py-5 w-full flex-1">
                {/* HERO & KPI STATS HEADER */}
                <div className="bg-gradient-to-r from-[#003B64] via-[#00528A] to-[#006BB4] rounded-xl shadow-md p-6 text-white mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/15 pb-5">
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                    SOC Operations & Discussion Portal
                                </span>
                                <span className="text-white/60 text-xs">| เขตสุขภาพที่ 3 สสจ.พิจิตร</span>
                            </div>
                            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
                                <svg className="w-7 h-7 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                                </svg>
                                กระดานข่าวสาร & บันทึกรายงานเวรศูนย์ SOC
                            </h1>
                            <p className="text-sky-100/80 text-xs sm:text-sm mt-1 max-w-3xl">
                                ศูนย์กลางแลกเปลี่ยนประเด็นการดูแลระบบไอทีโรงพยาบาล บันทึกส่งมอบเวรปฏิบัติการเฝ้าระวังความมั่นคงปลอดภัยไซเบอร์ และคลังความรู้การแก้ปัญหาเครือข่าย
                            </p>
                        </div>

                        {/* Fast Action Buttons */}
                        <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                                onClick={() => openCreateModal('soc_report')}
                                className="bg-emerald-500 hover:bg-emerald-400 text-white font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                + บันทึกรายงานเวร SOC
                            </button>
                            <button
                                onClick={() => openCreateModal('discussion')}
                                className="bg-white text-[#006BB4] hover:bg-sky-50 font-bold text-xs px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <svg className="w-4 h-4 text-[#006BB4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                + ตั้งกระทู้พูดคุย / แจ้งปัญหา
                            </button>
                        </div>
                    </div>

                    {/* KPI CARDS */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-5">
                        <div className="bg-white/10 backdrop-blur-xs rounded-lg p-3 border border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-sky-400/20 flex items-center justify-center text-sky-200 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-[11px] text-sky-200/80 font-medium">กระทู้ทั้งหมด</div>
                                <div className="text-xl font-bold">{stats.total_topics} รายการ</div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xs rounded-lg p-3 border border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-400/20 flex items-center justify-center text-amber-300 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-[11px] text-amber-200/80 font-medium">กำลังดำเนินการ</div>
                                <div className="text-xl font-bold">{stats.open_issues} ประเด็น</div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xs rounded-lg p-3 border border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-emerald-400/20 flex items-center justify-center text-emerald-300 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-[11px] text-emerald-200/80 font-medium">รายงานเวรวันนี้</div>
                                <div className="text-xl font-bold">{stats.today_soc_reports} ผลัด</div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xs rounded-lg p-3 border border-white/10 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-rose-400/20 flex items-center justify-center text-rose-300 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-[11px] text-rose-200/80 font-medium">เหตุการณ์วิกฤต/สูง</div>
                                <div className="text-xl font-bold">{stats.critical_alerts} เรื่อง</div>
                            </div>
                        </div>

                        <div className="bg-white/10 backdrop-blur-xs rounded-lg p-3 border border-white/10 flex items-center gap-3 col-span-2 sm:col-span-1">
                            <div className="w-10 h-10 rounded-lg bg-teal-400/20 flex items-center justify-center text-teal-300 shrink-0">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div>
                                <div className="text-[11px] text-teal-200/80 font-medium">แก้ไขสำเร็จแล้ว</div>
                                <div className="text-xl font-bold">{stats.resolved_issues} เรื่อง</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CATEGORY NAV TABS */}
                <div className="bg-white rounded-t-xl border border-slate-200 border-b-0 px-4 pt-3 flex flex-wrap gap-2">
                    {[
                        { id: 'all', label: 'ทั้งหมด (All Topics)', icon: '📁' },
                        { id: 'soc_report', label: 'รายงานเวร SOC (Shift Logs)', icon: '📋' },
                        { id: 'discussion', label: 'แลกเปลี่ยนประเด็นดูแลระบบ', icon: '💬' },
                        { id: 'incident_alert', label: 'แจ้งเตือนภัยคุกคาม (Alerts)', icon: '🚨' },
                        { id: 'troubleshoot', label: 'บันทึกวิธีแก้ปัญหา (KB)', icon: '💡' },
                        { id: 'announcement', label: 'ประกาศ & ข่าวสาร', icon: '📢' },
                    ].map((tab) => {
                        const isActive = selectedCategory === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setSelectedCategory(tab.id);
                                    handleFilterChange({ category: tab.id });
                                }}
                                className={`px-4 py-2.5 text-xs font-semibold rounded-t-lg transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
                                    isActive
                                        ? 'border-[#006BB4] text-[#006BB4] bg-sky-50/70'
                                        : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* FILTER & SEARCH TOOLBAR */}
                <div className="bg-white border border-slate-200 p-4 mb-5 shadow-xs">
                    <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {/* Search Input */}
                        <div className="col-span-1 sm:col-span-2 relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ค้นหาตามหัวข้อ, ข้อความ, ผู้โพสต์, ระบบ..."
                                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006BB4] focus:border-[#006BB4]"
                            />
                            <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                        </div>

                        {/* Severity Filter */}
                        <div>
                            <select
                                value={selectedSeverity}
                                onChange={(e) => {
                                    setSelectedSeverity(e.target.value);
                                    handleFilterChange({ severity: e.target.value });
                                }}
                                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                            >
                                <option value="all">ระดับความสำคัญ: ทั้งหมด</option>
                                <option value="critical">🚨 วิกฤต (Critical)</option>
                                <option value="high">⚠️ สูง (High)</option>
                                <option value="medium">🟡 ปานกลาง (Medium)</option>
                                <option value="low">🔵 ต่ำ (Low)</option>
                                <option value="normal">⚪ ปกติ (Normal)</option>
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    handleFilterChange({ status: e.target.value });
                                }}
                                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                            >
                                <option value="all">สถานะ: ทั้งหมด</option>
                                <option value="open">เปิดประเด็น (Open)</option>
                                <option value="in_progress">กำลังดำเนินการ (In Progress)</option>
                                <option value="resolved">แก้ไขเรียบร้อย (Resolved)</option>
                                <option value="closed">ปิดประเด็น (Closed)</option>
                            </select>
                        </div>

                        {/* Agency Filter */}
                        <div>
                            <select
                                value={selectedAgency}
                                onChange={(e) => {
                                    setSelectedAgency(e.target.value);
                                    handleFilterChange({ agency_code: e.target.value });
                                }}
                                className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                            >
                                <option value="all">หน่วยงาน: ทั้งหมด (13 รพ.)</option>
                                {agencies.map((ag) => (
                                    <option key={ag.code} value={ag.code}>
                                        {ag.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="bg-[#006BB4] hover:bg-[#005590] text-white text-xs font-semibold px-3 py-2 rounded-lg transition flex-1 cursor-pointer"
                            >
                                ค้นหา
                            </button>
                            {(searchTerm || selectedCategory !== 'all' || selectedSeverity !== 'all' || selectedStatus !== 'all' || selectedAgency !== 'all') && (
                                <button
                                    type="button"
                                    onClick={handleResetFilters}
                                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs px-2.5 py-2 rounded-lg transition cursor-pointer"
                                    title="ล้างตัวกรอง"
                                >
                                    รีเซ็ต
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* TOPICS FEED / LIST */}
                {topics.data.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
                        <div className="w-16 h-16 mx-auto mb-3 text-slate-300">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-base font-bold text-slate-700">ไม่พบกระทู้หรือรายงานที่ค้นหา</h3>
                        <p className="text-slate-500 text-xs mt-1">ลองเปลี่ยนเงื่อนไขการค้นหา หรือสร้างกระทู้ใหม่สำหรับประเด็นนี้</p>
                        <button
                            onClick={() => openCreateModal('discussion')}
                            className="mt-4 inline-flex items-center gap-1.5 bg-[#006BB4] hover:bg-[#005590] text-white text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                        >
                            + เริ่มต้นตั้งกระทู้ใหม่
                        </button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {topics.data.map((topic) => {
                            const catBadge = getCategoryBadge(topic.category);
                            const sevBadge = getSeverityBadge(topic.severity);
                            const stBadge = getStatusBadge(topic.status);

                            return (
                                <div
                                    key={topic.id}
                                    className={`bg-white rounded-xl border transition duration-150 hover:shadow-md hover:border-[#006BB4]/40 p-4 sm:p-5 flex flex-col justify-between gap-3 ${
                                        topic.is_pinned
                                            ? 'border-amber-300 bg-amber-50/20'
                                            : topic.severity === 'critical'
                                            ? 'border-rose-300 bg-rose-50/15'
                                            : 'border-slate-200'
                                    }`}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            {/* Badges row */}
                                            <div className="flex flex-wrap items-center gap-2 mb-2 text-xs">
                                                {topic.is_pinned && (
                                                    <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                                                        📌 ปักหมุดสำคัญ
                                                    </span>
                                                )}

                                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1 ${catBadge.bg}`}>
                                                    <span>{catBadge.icon}</span>
                                                    <span>{catBadge.label}</span>
                                                </span>

                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${sevBadge.bg}`}>
                                                    {sevBadge.label}
                                                </span>

                                                <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border flex items-center gap-1.5 ${stBadge.bg}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${stBadge.dot}`}></span>
                                                    <span>{stBadge.label}</span>
                                                </span>

                                                {topic.shift && (
                                                    <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-medium">
                                                        กะ: {shiftLabels[topic.shift] || topic.shift}
                                                    </span>
                                                )}

                                                {(topic.image_path || (topic.images && topic.images.length > 0)) && (
                                                    <span className="bg-purple-50 text-purple-700 border border-purple-200 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                                        📷 มีรูปภาพแนบ {topic.images?.length > 1 ? `(${topic.images.length})` : ''}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Title Link */}
                                            <Link
                                                href={`/webboard/${topic.id}`}
                                                className="group inline-flex items-center gap-1.5 text-slate-900 hover:text-[#006BB4] font-bold text-base transition"
                                            >
                                                <span>{topic.title}</span>
                                                <svg className="w-4 h-4 text-slate-400 group-hover:text-[#006BB4] group-hover:translate-x-0.5 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </Link>

                                            {/* Content excerpt */}
                                            <p className="text-slate-600 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                                                {topic.content.replace(/[#*`]/g, '')}
                                            </p>

                                            {/* System affected / details tag */}
                                            {topic.system_affected && (
                                                <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
                                                    <span className="font-semibold text-slate-600">ระบบที่กระทบ:</span>
                                                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 font-mono text-[10px]">
                                                        {topic.system_affected}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Meta Info (Comments, Views) */}
                                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 text-xs text-slate-500">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 bg-sky-50 text-sky-800 px-2.5 py-1 rounded-lg font-semibold" title="จำนวนความคิดเห็น">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                    </svg>
                                                    <span>{topic.comments_count}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-400" title="จำนวนคนเปิดอ่าน">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                    </svg>
                                                    <span>{topic.views_count}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Author footer */}
                                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between text-[11px] text-slate-500 gap-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-[#006BB4]/10 text-[#006BB4] font-bold flex items-center justify-center text-[10px]">
                                                {topic.user?.name ? topic.user.name.charAt(0) : 'U'}
                                            </div>
                                            <span className="font-semibold text-slate-700">{topic.user?.name || 'นิรนาม'}</span>
                                            {topic.user?.role === 'admin' && (
                                                <span className="bg-sky-100 text-sky-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                                    SOC Admin
                                                </span>
                                            )}
                                            <span>•</span>
                                            <span className="text-slate-600">{topic.agency_name || topic.user?.agency_name}</span>
                                        </div>

                                        <div className="flex items-center gap-2 text-slate-400">
                                            <span>{new Date(topic.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                            {topic.status === 'resolved' && (
                                                <span className="text-emerald-600 font-medium">✓ แก้ปัญหาแล้ว</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* PAGINATION */}
                {topics.links && topics.links.length > 3 && (
                    <div className="mt-6 flex items-center justify-between bg-white px-4 py-3 border border-slate-200 rounded-xl shadow-xs text-xs">
                        <div className="text-slate-500">
                            แสดงรายการที่ {topics.from || 0} - {topics.to || 0} จากทั้งหมด {topics.total} รายการ
                        </div>
                        <div className="flex items-center gap-1">
                            {topics.links.map((link, idx) => (
                                <Link
                                    key={idx}
                                    href={link.url || '#'}
                                    preserveScroll
                                    className={`px-3 py-1.5 rounded-md font-medium transition ${
                                        link.active
                                            ? 'bg-[#006BB4] text-white'
                                            : link.url
                                            ? 'text-slate-700 hover:bg-slate-100'
                                            : 'text-slate-300 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* CREATE TOPIC / SOC REPORT MODAL */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden my-8">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-[#003B64] to-[#006BB4] text-white px-6 py-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold flex items-center gap-2">
                                    <svg className="w-5 h-5 text-sky-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    สร้างกระทู้ใหม่ / รายงานการปฏิบัติงานศูนย์ SOC
                                </h2>
                                <p className="text-xs text-sky-100 mt-0.5">กรอกข้อมูลประเด็นดูแลระบบ หรือสรุปผลการเฝ้าระวังความปลอดภัย</p>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
                            {/* Category Selector */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    เลือกหมวดหมู่กระทู้ / ประเภทการรายงาน <span className="text-rose-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {[
                                        { id: 'soc_report', label: 'รายงานเวร SOC', icon: '📋', desc: 'สรุปผลเฝ้าระวัง/ส่งมอบเวร' },
                                        { id: 'discussion', label: 'แลกเปลี่ยนประเด็น', icon: '💬', desc: 'ปรึกษาการตั้งค่า/ดูแลระบบ' },
                                        { id: 'incident_alert', label: 'แจ้งเตือนภัยคุกคาม', icon: '🚨', desc: 'เหตุการณ์ผิดปกติ/บุกรุก' },
                                        { id: 'troubleshoot', label: 'บันทึกแก้ปัญหา (KB)', icon: '💡', desc: 'แนวทางแก้ไข/Runbook' },
                                        { id: 'announcement', label: 'ประกาศ & ข่าวสาร', icon: '📢', desc: 'ระเบียบ/ข่าวทั่วไป' },
                                    ].map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => applyTemplate(cat.id)}
                                            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
                                                data.category === cat.id
                                                    ? 'border-[#006BB4] bg-sky-50/80 ring-1 ring-[#006BB4]'
                                                    : 'border-slate-200 hover:border-slate-300 bg-white'
                                            }`}
                                        >
                                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                                <span>{cat.icon}</span>
                                                <span>{cat.label}</span>
                                            </div>
                                            <div className="text-[10px] text-slate-500 mt-0.5">{cat.desc}</div>
                                        </button>
                                    ))}
                                </div>
                                {errors.category && <p className="text-rose-600 mt-1 font-medium">{errors.category}</p>}
                            </div>

                            {/* Title */}
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">
                                    หัวข้อกระทู้ / ชื่อรายงานสรุป <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={data.title}
                                    onChange={(e) => setData('title', e.target.value)}
                                    placeholder="เช่น รายงานผลการปฏิบัติงานเวร SOC ผลัดดึก 19 ก.ย. 2026 หรือ ขอคำปรึกษาการตั้งค่าไฟร์วอลล์..."
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    required
                                />
                                {errors.title && <p className="text-rose-600 mt-1 font-medium">{errors.title}</p>}
                            </div>

                            {/* Conditional SOC Shift Fields */}
                            {data.category === 'soc_report' && (
                                <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-bold text-emerald-900 mb-1">
                                            กะการทำงาน (Shift)
                                        </label>
                                        <select
                                            value={data.shift}
                                            onChange={(e) => setData('shift', e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        >
                                            <option value="morning">เวรเช้า (08:00 - 16:00 น.)</option>
                                            <option value="afternoon">เวรบ่าย (16:00 - 24:00 น.)</option>
                                            <option value="night">เวรดึก (00:00 - 08:00 น.)</option>
                                            <option value="daily">เวรประจำวัน (24 ชม.)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block font-bold text-emerald-900 mb-1">
                                            วันที่ปฏิบัติหน้าที่
                                        </label>
                                        <input
                                            type="date"
                                            value={data.shift_date}
                                            onChange={(e) => setData('shift_date', e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Row: Severity, Affected System, Agency */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        ระดับความสำคัญ / ความเร่งด่วน <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.severity}
                                        onChange={(e) => setData('severity', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    >
                                        <option value="critical">🚨 วิกฤต (Critical)</option>
                                        <option value="high">⚠️ สูง (High)</option>
                                        <option value="medium">🟡 ปานกลาง (Medium)</option>
                                        <option value="low">🔵 ต่ำ (Low)</option>
                                        <option value="normal">⚪ ปกติ (Normal)</option>
                                        <option value="info">ℹ️ ข้อมูลทั่วไป (Info)</option>
                                    </select>
                                    {errors.severity && <p className="text-rose-600 mt-1 font-medium">{errors.severity}</p>}
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        ระบบหรืออุปกรณ์ที่เกี่ยวข้อง
                                    </label>
                                    <input
                                        type="text"
                                        value={data.system_affected}
                                        onChange={(e) => setData('system_affected', e.target.value)}
                                        placeholder="เช่น Wazuh Server, HOSxP, Core Switch..."
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    />
                                </div>

                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">
                                        หน่วยงาน / โรงพยาบาล
                                    </label>
                                    <select
                                        value={data.agency_code}
                                        onChange={(e) => {
                                            const ag = agencies.find((a) => a.code === e.target.value);
                                            setData((prev) => ({
                                                ...prev,
                                                agency_code: e.target.value,
                                                agency_name: ag ? ag.name : prev.agency_name,
                                            }));
                                        }}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    >
                                        {agencies.map((ag) => (
                                            <option key={ag.code} value={ag.code}>
                                                {ag.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Content Textarea */}
                            <div>
                                <div className="flex items-center justify-between mb-1">
                                    <label className="block font-bold text-slate-700">
                                        รายละเอียดเนื้อหากระทู้ / ข้อมูลการปฏิบัติงาน <span className="text-rose-500">*</span>
                                    </label>
                                    <span className="text-[10px] text-slate-400">
                                        รองรับการพิมพ์หัวข้อย่อยและขั้นตอน (Markdown style)
                                    </span>
                                </div>
                                <textarea
                                    rows="9"
                                    value={data.content}
                                    onChange={(e) => setData('content', e.target.value)}
                                    onPaste={handlePaste}
                                    placeholder="พิมพ์รายละเอียดเนื้อหาที่นี่... (สามารถกด Ctrl+V / Cmd+V วางรูปภาพสกรีนช็อตที่นี่ได้ทันที)"
                                    className="w-full px-3 py-2.5 font-mono text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006BB4] leading-relaxed"
                                    required
                                />
                                {errors.content && <p className="text-rose-600 mt-1 font-medium">{errors.content}</p>}
                            </div>

                            {/* Image Upload & Screenshot Paste Zone */}
                            <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="block font-bold text-slate-700">
                                        📷 แนบรูปภาพ / สกรีนช็อตหน้าจอรายงานเหตุการณ์
                                    </label>
                                    <span className="text-[10px] text-slate-400">
                                        PNG, JPG, WebP ไม่เกิน 5MB (รองรับลากวาง หรือกด Ctrl+V วางภาพ)
                                    </span>
                                </div>

                                <div className="border-2 border-dashed border-slate-300 hover:border-[#006BB4] rounded-xl p-4 bg-slate-50/60 hover:bg-sky-50/20 transition text-center cursor-pointer relative">
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => handleImageFiles(e.target.files)}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <div className="flex flex-col items-center justify-center pointer-events-none">
                                        <svg className="w-8 h-8 text-slate-400 mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <div className="text-xs text-slate-700 font-semibold">
                                            คลิกเพื่อเลือกไฟล์ หรือลากรูปภาพมาวางที่นี่
                                        </div>
                                        <div className="text-[10px] text-slate-400 mt-0.5">
                                            หรือกดแคปเจอร์หน้าจอแล้วกด <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded font-mono text-slate-600">Ctrl+V</kbd> ได้เลย
                                        </div>
                                    </div>
                                </div>

                                {/* Image Previews Grid */}
                                {imagePreviews.length > 0 && (
                                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                        {imagePreviews.map((img, idx) => (
                                            <div
                                                key={idx}
                                                className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-100 shadow-2xs"
                                            >
                                                <img
                                                    src={img.url}
                                                    alt={img.name}
                                                    className="w-full h-24 object-cover"
                                                />
                                                <div className="p-1.5 bg-white text-[10px] flex items-center justify-between border-t border-slate-100">
                                                    <span className="truncate max-w-[100px] text-slate-700 font-medium" title={img.name}>
                                                        {img.name}
                                                    </span>
                                                    <span className="text-slate-400 text-[9px]">{img.size}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveImage(idx)}
                                                    className="absolute top-1.5 right-1.5 bg-rose-600/80 hover:bg-rose-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow-sm transition cursor-pointer"
                                                    title="ลบรูปภาพนี้"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {errors.images && <p className="text-rose-600 mt-1 font-medium">{errors.images}</p>}
                                {errors.image && <p className="text-rose-600 mt-1 font-medium">{errors.image}</p>}
                            </div>

                            {/* Modal Actions */}
                            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium cursor-pointer"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="bg-[#006BB4] hover:bg-[#005590] text-white px-5 py-2 rounded-lg font-bold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                                >
                                    {processing ? 'กำลังบันทึก...' : 'บันทึกและโพสต์'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </CtmrLayout>
    );
}
