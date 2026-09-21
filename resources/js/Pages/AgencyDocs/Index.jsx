import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import CtmrLayout from '@/Layouts/CtmrLayout';

export default function Index({ tasks, stats, recentAttachments, agencies, categories, filters }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';

    const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' or 'repository'
    const [search, setSearch] = useState(filters.search || '');
    const [selectedAgency, setSelectedAgency] = useState(filters.agency_code || 'all');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');
    const [selectedPriority, setSelectedPriority] = useState(filters.priority || 'all');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || 'all');
    const [selectedFileType, setSelectedFileType] = useState(filters.file_type || 'all');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Form for creating a new task
    const { data, setData, post, processing, reset, errors } = useForm({
        title: '',
        agency_code: auth?.user?.agency_code || '001',
        description: '',
        category: 'cybersecurity',
        priority: 'normal',
        start_date: new Date().toISOString().split('T')[0],
        due_date: '',
        steps: [
            { title: 'ขั้นตอนที่ 1: วางแผนและรวบรวมข้อมูลความต้องการ', due_date: '' },
            { title: 'ขั้นตอนที่ 2: ดำเนินการและปฏิบัติตามแผนงาน', due_date: '' },
            { title: 'ขั้นตอนที่ 3: ตรวจสอบและประเมินผลการดำเนินงาน', due_date: '' },
            { title: 'ขั้นตอนที่ 4: สรุปผลและส่งมอบรายงานสมบูรณ์', due_date: '' },
        ],
    });

    const handleFilterChange = (updates = {}) => {
        const query = {
            search,
            agency_code: selectedAgency,
            category: selectedCategory,
            priority: selectedPriority,
            status: selectedStatus,
            file_type: selectedFileType,
            ...updates,
        };

        router.get('/agency-docs', query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilterChange();
    };

    const handleAddStepField = () => {
        const nextNum = data.steps.length + 1;
        setData('steps', [
            ...data.steps,
            { title: `ขั้นตอนที่ ${nextNum}: ระบุรายละเอียดขั้นตอน`, due_date: '' },
        ]);
    };

    const handleRemoveStepField = (index) => {
        if (data.steps.length <= 1) return;
        const newSteps = data.steps.filter((_, i) => i !== index);
        setData('steps', newSteps);
    };

    const handleStepChange = (index, field, value) => {
        const newSteps = [...data.steps];
        newSteps[index][field] = value;
        setData('steps', newSteps);
    };

    const handleSubmitNewTask = (e) => {
        e.preventDefault();
        post('/agency-docs', {
            onSuccess: () => {
                setShowCreateModal(false);
                reset();
            },
        });
    };

    const handleDeleteTask = (taskId, taskTitle) => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายการกิจกรรม "${taskTitle}" พร้อมขั้นตอนและเอกสารแนบทั้งหมด?`)) {
            return;
        }

        router.delete(`/agency-docs/${taskId}`, {
            preserveScroll: true,
        });
    };

    // Priority badge styles
    const getPriorityBadge = (priority) => {
        switch (priority) {
            case 'urgent':
                return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">เร่งด่วนที่สุด</span>;
            case 'high':
                return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">ความสำคัญสูง</span>;
            case 'normal':
                return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-sky-100 text-sky-800 border border-sky-200">ปกติ</span>;
            case 'low':
                return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">ทั่วไป</span>;
            default:
                return null;
        }
    };

    // Status badge styles
    const getStatusBadge = (status) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        เสร็จสมบูรณ์
                    </span>
                );
            case 'in_progress':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-[#006BB4]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#006BB4] animate-pulse"></span>
                        กำลังดำเนินการ
                    </span>
                );
            case 'under_review':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                        รอตรวจสอบผล
                    </span>
                );
            case 'pending':
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                        รอดำเนินการ
                    </span>
                );
        }
    };

    // Category badge
    const getCategoryBadge = (catId) => {
        const cat = categories.find((c) => c.id === catId);
        if (!cat) return null;

        switch (catId) {
            case 'cybersecurity':
                return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-sky-50 text-sky-700 border border-sky-200">{cat.name}</span>;
            case 'his_system':
                return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">{cat.name}</span>;
            case 'monthly_report':
                return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">{cat.name}</span>;
            case 'audit':
                return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">{cat.name}</span>;
            case 'meeting_report':
                return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">รายงานการประชุม</span>;
            default:
                return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">{cat.name}</span>;
        }
    };

    // File type icon & badge
    const renderFileTypeBadge = (type) => {
        switch (type) {
            case 'pdf':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <svg className="w-3.5 h-3.5 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5z" />
                        </svg>
                        PDF
                    </span>
                );
            case 'word':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                        <svg className="w-3.5 h-3.5 text-sky-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM9.5 16.5l-1.25-5h1.1l.65 3.3.65-3.3h1.1l-1.25 5h-1z" />
                        </svg>
                        Word (.docx)
                    </span>
                );
            case 'excel':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <svg className="w-3.5 h-3.5 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM10.2 16.5l-1.2-2.1-1.2 2.1H6.5l1.8-3-1.7-2.9h1.3l1.1 2 1.1-2h1.3l-1.7 2.9 1.8 3h-1.3z" />
                        </svg>
                        Excel (.xlsx)
                    </span>
                );
            case 'powerpoint':
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-orange-50 text-orange-700 border border-orange-200">
                        <svg className="w-3.5 h-3.5 text-orange-600" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-3 14H9.5V8.5H12c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5h-1V16zm0-4.5h1c.6 0 1-.4 1-1s-.4-1-1-1h-1v2z" />
                        </svg>
                        PPT (.pptx)
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        เอกสารแนบ
                    </span>
                );
        }
    };

    return (
        <CtmrLayout title="ระบบเอกสาร & ติดตามงาน (Agency Docs & Timeline)" activeNav="agency-docs">
            <div className="max-w-[1720px] mx-auto p-4 sm:p-6 space-y-6">

                {/* HEADER & ACTIONS */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full bg-[#00A88F]"></span>
                            <h1 className="text-xl font-bold text-slate-800">
                                ระบบเอกสาร & ติดตามงานแยกตามหน่วยงาน (Agency Docs & Step Timeline)
                            </h1>
                            <span className="text-[11px] px-2 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-full">
                                13 รพ./สสจ.
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            ศูนย์กลางจัดเก็บเอกสารรายงานผล ติดตามความคืบหน้าของงานทีละขั้นตอน (Step Timeline) รองรับไฟล์ PDF, Word, Excel, PowerPoint
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="px-4 py-2.5 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition flex items-center gap-2 cursor-pointer"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>สร้างภารกิจงานใหม่</span>
                        </button>
                    </div>
                </div>

                {/* KPI EXECUTIVE CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-slate-500">ภารกิจงานทั้งหมด</div>
                            <div className="text-2xl font-bold text-slate-800 mt-1">{stats.total_tasks}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">ในหน่วยงานที่เลือก</div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#006BB4] flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-slate-500">เสร็จสิ้นสมบูรณ์</div>
                            <div className="text-2xl font-bold text-emerald-600 mt-1">{stats.completed}</div>
                            <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
                                {stats.total_tasks > 0 ? Math.round((stats.completed / stats.total_tasks) * 100) : 0}% ของงานทั้งหมด
                            </div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-slate-500">กำลังดำเนินการ</div>
                            <div className="text-2xl font-bold text-[#006BB4] mt-1">{stats.in_progress}</div>
                            <div className="text-[11px] text-[#006BB4] mt-0.5">มี Step Timeline Active</div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-sky-50 text-[#006BB4] flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-slate-500">รอดำเนินการ</div>
                            <div className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</div>
                            <div className="text-[11px] text-amber-600 mt-0.5">รอเริ่มขั้นตอนแรก</div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between col-span-2 sm:col-span-1">
                        <div>
                            <div className="text-xs font-semibold text-slate-500">เอกสารรายงานในคลัง</div>
                            <div className="text-2xl font-bold text-[#00A88F] mt-1">{stats.total_attachments}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">PDF, Word, Excel, PPT</div>
                        </div>
                        <div className="w-10 h-10 rounded-lg bg-teal-50 text-[#00A88F] flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* FILTERS & TABS BAR */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4">
                    {/* Tabs */}
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setActiveTab('tasks')}
                                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition cursor-pointer flex items-center gap-2 ${
                                    activeTab === 'tasks'
                                        ? 'bg-[#006BB4] text-white shadow-xs'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                <span>รายการติดตามงาน & Timeline ({tasks.total || 0})</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('repository')}
                                className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition cursor-pointer flex items-center gap-2 ${
                                    activeTab === 'repository'
                                        ? 'bg-[#006BB4] text-white shadow-xs'
                                        : 'text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                </svg>
                                <span>คลังเอกสารรายงานผล (Document Explorer)</span>
                            </button>
                        </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* Hospital / Agency Filter */}
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">หน่วยงาน / โรงพยาบาล</label>
                            <select
                                value={selectedAgency}
                                onChange={(e) => {
                                    setSelectedAgency(e.target.value);
                                    handleFilterChange({ agency_code: e.target.value });
                                }}
                                disabled={!isAdmin}
                                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#006BB4]/20 focus:border-[#006BB4] focus:outline-none"
                            >
                                {isAdmin && <option value="all">ทุกหน่วยงาน (ทั้ง 13 แห่ง)</option>}
                                {agencies.map((ag) => (
                                    <option key={ag.code} value={ag.code}>
                                        {ag.code} - {ag.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">หมวดหมู่งาน</label>
                            <select
                                value={selectedCategory}
                                onChange={(e) => {
                                    setSelectedCategory(e.target.value);
                                    handleFilterChange({ category: e.target.value });
                                }}
                                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#006BB4]/20 focus:border-[#006BB4] focus:outline-none"
                            >
                                <option value="all">ทุกหมวดหมู่</option>
                                {categories.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">สถานะโครงการ</label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    handleFilterChange({ status: e.target.value });
                                }}
                                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#006BB4]/20 focus:border-[#006BB4] focus:outline-none"
                            >
                                <option value="all">ทุกสถานะ</option>
                                <option value="pending">รอดำเนินการ</option>
                                <option value="in_progress">กำลังดำเนินการ</option>
                                <option value="under_review">รอตรวจสอบ</option>
                                <option value="completed">เสร็จสิ้นสมบูรณ์</option>
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">ระดับความสำคัญ</label>
                            <select
                                value={selectedPriority}
                                onChange={(e) => {
                                    setSelectedPriority(e.target.value);
                                    handleFilterChange({ priority: e.target.value });
                                }}
                                className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#006BB4]/20 focus:border-[#006BB4] focus:outline-none"
                            >
                                <option value="all">ทุกระดับความสำคัญ</option>
                                <option value="urgent">เร่งด่วนที่สุด</option>
                                <option value="high">ความสำคัญสูง</option>
                                <option value="normal">ปกติ</option>
                                <option value="low">ทั่วไป</option>
                            </select>
                        </div>

                        {/* Search Bar */}
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 mb-1">ค้นหาชื่องาน / เอกสาร</label>
                            <form onSubmit={handleSearchSubmit} className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="พิมพ์คำค้นหา..."
                                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg pl-3 pr-8 py-2 focus:ring-2 focus:ring-[#006BB4]/20 focus:border-[#006BB4] focus:outline-none"
                                />
                                <button type="submit" className="absolute right-2.5 top-2.5 text-slate-400 hover:text-[#006BB4]">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* TAB 1: TASK & TIMELINE VIEW */}
                {activeTab === 'tasks' && (
                    <div className="space-y-4">
                        {tasks.data.length === 0 ? (
                            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
                                <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-sm font-bold text-slate-700">ไม่พบรายการภารกิจงานตามเงื่อนไขที่เลือก</h3>
                                <p className="text-xs text-slate-500 mt-1">
                                    ท่านสามารถเริ่มต้นสร้างโครงการใหม่เพื่อติดตามงานและแนบไฟล์เอกสารในแต่ละขั้นตอนได้ทันที
                                </p>
                                <button
                                    onClick={() => setShowCreateModal(true)}
                                    className="mt-4 px-4 py-2 bg-[#006BB4] text-white text-xs font-semibold rounded-lg shadow-sm hover:bg-[#00528A] transition cursor-pointer"
                                >
                                    + สร้างภารกิจงานใหม่
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {tasks.data.map((task) => (
                                    <div
                                        key={task.id}
                                        className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition p-5 flex flex-col justify-between group"
                                    >
                                        <div className="space-y-3">
                                            {/* Top Meta Bar */}
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                                        รหัส {task.agency_code}: {task.agency_name}
                                                    </span>
                                                    {getCategoryBadge(task.category)}
                                                    {getPriorityBadge(task.priority)}
                                                    {getStatusBadge(task.status)}
                                                </div>

                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    {task.due_date && (
                                                        <span className="flex items-center gap-1">
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <span>กำหนดส่ง: {task.due_date}</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Task Title & Description */}
                                            <div>
                                                <Link
                                                    href={`/agency-docs/${task.id}`}
                                                    className="text-base font-bold text-slate-800 hover:text-[#006BB4] transition group-hover:text-[#006BB4]"
                                                >
                                                    {task.title}
                                                </Link>
                                                {task.description && (
                                                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                                        {task.description}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="space-y-1.5 pt-1">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="font-semibold text-slate-600 flex items-center gap-1.5">
                                                        <svg className="w-3.5 h-3.5 text-[#006BB4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                        </svg>
                                                        ความคืบหน้ารวม
                                                    </span>
                                                    <span className="font-bold text-[#006BB4]">{task.progress_percent}%</span>
                                                </div>
                                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${
                                                            task.progress_percent === 100
                                                                ? 'bg-emerald-500'
                                                                : task.progress_percent >= 50
                                                                ? 'bg-[#006BB4]'
                                                                : 'bg-amber-500'
                                                        }`}
                                                        style={{ width: `${task.progress_percent}%` }}
                                                    ></div>
                                                </div>
                                            </div>

                                            {/* Step Timeline Preview Nodes */}
                                            {task.steps && task.steps.length > 0 && (
                                                <div className="pt-2 border-t border-slate-100">
                                                    <div className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                                                        ลำดับขั้นตอนการทำงาน (Timeline Steps - {task.steps.length} ขั้นตอน):
                                                    </div>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                                                        {task.steps.map((step) => (
                                                            <div
                                                                key={step.id}
                                                                className={`p-2 rounded-lg border text-xs flex items-start gap-2 ${
                                                                    step.status === 'completed'
                                                                        ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                                                                        : step.status === 'in_progress'
                                                                        ? 'bg-sky-50/60 border-sky-200 text-sky-900'
                                                                        : 'bg-slate-50 border-slate-200 text-slate-600'
                                                                }`}
                                                            >
                                                                <span className="shrink-0 mt-0.5">
                                                                    {step.status === 'completed' ? (
                                                                        <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                                        </svg>
                                                                    ) : step.status === 'in_progress' ? (
                                                                        <span className="w-4 h-4 rounded-full border-2 border-[#006BB4] flex items-center justify-center">
                                                                            <span className="w-1.5 h-1.5 rounded-full bg-[#006BB4] animate-ping"></span>
                                                                        </span>
                                                                    ) : (
                                                                        <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-400">
                                                                            {step.step_number}
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                <div className="min-w-0 flex-1">
                                                                    <div className="font-semibold truncate">{step.title}</div>
                                                                    <div className="text-[10px] opacity-75">
                                                                        {step.status === 'completed' ? 'เสร็จแล้ว' : step.status === 'in_progress' ? 'กำลังดำเนินการ' : 'ยังไม่เริ่ม'}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Card Footer Bar */}
                                        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                                            <div className="flex items-center gap-4">
                                                <span className="flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-[#00A88F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                    <span>เอกสารแนบ {task.attachments_count || 0} ไฟล์</span>
                                                </span>
                                                <span className="hidden sm:inline text-slate-400">•</span>
                                                <span className="hidden sm:inline">สร้างโดย: {task.user?.name}</span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/agency-docs/${task.id}`}
                                                    className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-slate-100 hover:bg-[#006BB4] hover:text-white text-slate-700 font-semibold rounded-lg transition"
                                                >
                                                    <span>เข้าดู Timeline & แนบเอกสาร</span>
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </Link>

                                                {(isAdmin || auth?.user?.agency_code === task.agency_code || auth?.user?.id === task.user_id) && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteTask(task.id, task.title)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-medium rounded-lg transition border border-rose-200 hover:border-rose-600 cursor-pointer text-xs"
                                                        title="ลบรายการกิจกรรมนี้"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                        <span>ลบ</span>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 2: DOCUMENT REPOSITORY EXPLORER */}
                {activeTab === 'repository' && (
                    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800">คลังเอกสารรายงานผลทั้งหมด (Document Explorer)</h3>
                                <p className="text-xs text-slate-500">เอกสาร PDF, Word, Excel, PowerPoint ที่แนบรายงานในแต่ละ Step Timeline</p>
                            </div>

                            {/* File Type Filter Badges */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                    onClick={() => {
                                        setSelectedFileType('all');
                                        handleFilterChange({ file_type: 'all' });
                                    }}
                                    className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer ${
                                        selectedFileType === 'all' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                                >
                                    ทั้งหมด
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedFileType('pdf');
                                        handleFilterChange({ file_type: 'pdf' });
                                    }}
                                    className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                                        selectedFileType === 'pdf' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                    }`}
                                >
                                    PDF
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedFileType('word');
                                        handleFilterChange({ file_type: 'word' });
                                    }}
                                    className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                                        selectedFileType === 'word' ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-700 hover:bg-sky-100'
                                    }`}
                                >
                                    Word
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedFileType('excel');
                                        handleFilterChange({ file_type: 'excel' });
                                    }}
                                    className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                                        selectedFileType === 'excel' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                    }`}
                                >
                                    Excel
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedFileType('powerpoint');
                                        handleFilterChange({ file_type: 'powerpoint' });
                                    }}
                                    className={`px-2.5 py-1 rounded text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                                        selectedFileType === 'powerpoint' ? 'bg-orange-600 text-white' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                                    }`}
                                >
                                    PowerPoint
                                </button>
                            </div>
                        </div>

                        {recentAttachments.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-2">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="text-xs text-slate-500 font-medium">ยังไม่มีไฟล์เอกสารแนบรายงานผลในหมวดหมู่นี้</div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-slate-50 text-slate-600 uppercase text-[11px] font-bold border-b border-slate-200">
                                        <tr>
                                            <th className="px-4 py-3">ประเภทไฟล์</th>
                                            <th className="px-4 py-3">ชื่อเอกสารรายงานผล</th>
                                            <th className="px-4 py-3">โครงการ / หน่วยงาน</th>
                                            <th className="px-4 py-3">ขั้นตอน (Step)</th>
                                            <th className="px-4 py-3">ขนาด / ผู้อัปโหลด</th>
                                            <th className="px-4 py-3 text-right">ดาวน์โหลด</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {recentAttachments.map((att) => (
                                            <tr key={att.id} className="hover:bg-slate-50/80 transition">
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {renderFileTypeBadge(att.file_type)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-slate-800 hover:text-[#006BB4]">
                                                        {att.file_name}
                                                    </div>
                                                    {att.description && (
                                                        <div className="text-[11px] text-slate-400 mt-0.5 truncate max-w-sm">
                                                            {att.description}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <Link
                                                        href={`/agency-docs/${att.task_id}`}
                                                        className="font-medium text-[#006BB4] hover:underline"
                                                    >
                                                        {att.task_title}
                                                    </Link>
                                                    <div className="text-[11px] text-slate-400">{att.agency_name}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <span className="text-[11px] font-semibold text-slate-700">
                                                        Step {att.step_number}:
                                                    </span>{' '}
                                                    <span className="text-[11px] text-slate-500 truncate max-w-[160px] inline-block align-middle">
                                                        {att.step_title}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                                                    <div>{att.file_size}</div>
                                                    <div className="text-[10px] text-slate-400">{att.uploader} • {att.created_at}</div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    <a
                                                        href={`/agency-docs/attachments/${att.id}/download`}
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#006BB4] hover:bg-[#00528A] text-white font-semibold rounded-md shadow-xs transition"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                        </svg>
                                                        <span>ดาวน์โหลด</span>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* MODAL: CREATE NEW TASK */}
                {showCreateModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 overflow-y-auto">
                        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-sky-100 text-[#006BB4] flex items-center justify-center font-bold">
                                        +
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-800">สร้างภารกิจงานและกำหนด Step Timeline</h3>
                                        <p className="text-[11px] text-slate-500">กำหนดขั้นตอนการดำเนินงานและกำหนดส่งสำหรับหน่วยงาน</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowCreateModal(false)}
                                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmitNewTask} className="p-5 overflow-y-auto space-y-4 text-xs flex-1">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        ชื่องาน / โครงการ <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.title}
                                        onChange={(e) => setData('title', e.target.value)}
                                        placeholder="เช่น โครงการตรวจประเมินระบบคอมพิวเตอร์และเครือข่าย 2569"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#006BB4]/20 focus:border-[#006BB4]"
                                        required
                                    />
                                    {errors.title && <p className="text-rose-600 text-[11px] mt-1">{errors.title}</p>}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">
                                            หน่วยงานผู้รับผิดชอบ <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={data.agency_code}
                                            onChange={(e) => setData('agency_code', e.target.value)}
                                            disabled={!isAdmin}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#006BB4]/20 focus:border-[#006BB4]"
                                        >
                                            {agencies.map((ag) => (
                                                <option key={ag.code} value={ag.code}>
                                                    {ag.code} - {ag.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">หมวดหมู่งาน</label>
                                        <select
                                            value={data.category}
                                            onChange={(e) => setData('category', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#006BB4]/20 focus:border-[#006BB4]"
                                        >
                                            {categories.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">ระดับความสำคัญ</label>
                                        <select
                                            value={data.priority}
                                            onChange={(e) => setData('priority', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#006BB4]/20 focus:border-[#006BB4]"
                                        >
                                            <option value="urgent">เร่งด่วนที่สุด (Urgent)</option>
                                            <option value="high">ความสำคัญสูง (High)</option>
                                            <option value="normal">ปกติ (Normal)</option>
                                            <option value="low">ทั่วไป (Low)</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">วันที่เริ่มต้น</label>
                                        <input
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#006BB4]/20 focus:border-[#006BB4]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block font-semibold text-slate-700 mb-1">กำหนดส่ง (Due Date)</label>
                                        <input
                                            type="date"
                                            value={data.due_date}
                                            onChange={(e) => setData('due_date', e.target.value)}
                                            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#006BB4]/20 focus:border-[#006BB4]"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">รายละเอียดและวัตถุประสงค์งาน</label>
                                    <textarea
                                        rows="2"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="ระบุเป้าหมาย ตัวชี้วัด หรือคำอธิบายเพิ่มเติม..."
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#006BB4]/20 focus:border-[#006BB4]"
                                    ></textarea>
                                </div>

                                {/* Step Timeline Configuration */}
                                <div className="pt-2 border-t border-slate-200">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                                            <span>กำหนดขั้นตอนการติดตามงาน (Step Timeline)</span>
                                            <span className="text-[10px] px-2 py-0.5 rounded bg-sky-100 text-[#006BB4] font-semibold">
                                                {data.steps.length} ขั้นตอน
                                            </span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleAddStepField}
                                            className="text-xs font-semibold text-[#006BB4] hover:underline cursor-pointer"
                                        >
                                            + เพิ่มขั้นตอน
                                        </button>
                                    </div>

                                    <div className="space-y-2">
                                        {data.steps.map((step, idx) => (
                                            <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg border border-slate-200">
                                                <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                                                    {idx + 1}
                                                </span>
                                                <input
                                                    type="text"
                                                    value={step.title}
                                                    onChange={(e) => handleStepChange(idx, 'title', e.target.value)}
                                                    placeholder="ชื่อขั้นตอน..."
                                                    className="flex-1 text-xs bg-white border border-slate-300 rounded px-2.5 py-1.5 focus:border-[#006BB4] focus:outline-none"
                                                    required
                                                />
                                                <input
                                                    type="date"
                                                    value={step.due_date}
                                                    onChange={(e) => handleStepChange(idx, 'due_date', e.target.value)}
                                                    className="w-32 text-xs bg-white border border-slate-300 rounded px-2 py-1.5 focus:border-[#006BB4] focus:outline-none"
                                                    title="กำหนดเสร็จของขั้นตอนนี้"
                                                />
                                                {data.steps.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => handleRemoveStepField(idx)}
                                                        className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer"
                                                        title="ลบขั้นตอนนี้"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateModal(false)}
                                        className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 cursor-pointer"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-5 py-2 bg-[#006BB4] hover:bg-[#00528A] text-white font-semibold rounded-lg shadow-sm disabled:opacity-50 cursor-pointer"
                                    >
                                        {processing ? 'กำลังบันทึก...' : 'บันทึกและสร้างภารกิจ'}
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
