import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import CtmrLayout from '@/Layouts/CtmrLayout';

export default function Show({ task, steps, categories, agencies }) {
    const { auth } = usePage().props;
    const isAdmin = auth?.user?.role === 'admin';
    const canManage = isAdmin || auth?.user?.agency_code === task.agency_code;

    const [activeUploadStepId, setActiveUploadStepId] = useState(null);
    const [uploadDescription, setUploadDescription] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const [showAddStepModal, setShowAddStepModal] = useState(false);
    const [newStepTitle, setNewStepTitle] = useState('');
    const [newStepDesc, setNewStepDesc] = useState('');
    const [newStepDueDate, setNewStepDueDate] = useState('');

    const [editingStep, setEditingStep] = useState(null);

    // Handle Quick Step Status Update
    const handleUpdateStepStatus = (stepId, newStatus) => {
        router.put(
            `/agency-docs/steps/${stepId}`,
            { status: newStatus },
            {
                preserveScroll: true,
            }
        );
    };

    // Handle File Upload to Step
    const handleUploadAttachment = (e, stepId) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('กรุณาเลือกไฟล์เอกสารที่ต้องการอัปโหลด');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);
        if (uploadDescription) {
            formData.append('description', uploadDescription);
        }

        setIsUploading(true);

        router.post(`/agency-docs/steps/${stepId}/attachments`, formData, {
            onSuccess: () => {
                setSelectedFile(null);
                setUploadDescription('');
                setActiveUploadStepId(null);
                setIsUploading(false);
            },
            onError: (errors) => {
                setIsUploading(false);
                alert(errors.file || 'เกิดข้อผิดพลาดในการอัปโหลดไฟล์');
            },
            preserveScroll: true,
        });
    };

    // Handle Add New Step
    const handleAddNewStep = (e) => {
        e.preventDefault();
        if (!newStepTitle.trim()) return;

        router.post(
            `/agency-docs/${task.id}/steps`,
            {
                title: newStepTitle,
                description: newStepDesc,
                due_date: newStepDueDate || null,
            },
            {
                onSuccess: () => {
                    setShowAddStepModal(false);
                    setNewStepTitle('');
                    setNewStepDesc('');
                    setNewStepDueDate('');
                },
                preserveScroll: true,
            }
        );
    };

    // Handle Delete Step
    const handleDeleteStep = (stepId, stepTitle) => {
        if (!confirm(`คุณต้องการลบ "${stepTitle}" และเอกสารแนบทั้งหมดในขั้นตอนนี้หรือไม่?`)) return;

        router.delete(`/agency-docs/steps/${stepId}`, {
            preserveScroll: true,
        });
    };

    // Handle Delete Attachment
    const handleDeleteAttachment = (attId, fileName) => {
        if (!confirm(`คุณต้องการลบไฟล์ "${fileName}" หรือไม่?`)) return;

        router.delete(`/agency-docs/attachments/${attId}`, {
            preserveScroll: true,
        });
    };

    // Handle Delete Whole Task
    const handleDeleteTask = () => {
        if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบรายการกิจกรรม "${task.title}" พร้อมขั้นตอนและเอกสารแนบทั้งหมด?`)) {
            return;
        }

        router.delete(`/agency-docs/${task.id}`);
    };

    // Render File Type Icon and Color
    const renderFileBadge = (type) => {
        switch (type) {
            case 'pdf':
                return (
                    <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M20 2H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-8.5 7.5c0 .83-.67 1.5-1.5 1.5H9v2H7.5V7H10c.83 0 1.5.67 1.5 1.5v1zm5 2c0 .83-.67 1.5-1.5 1.5h-2.5V7H15c.83 0 1.5.67 1.5 1.5v3zm4-3H19v1h1.5V11H19v2h-1.5V7h3v1.5z" />
                        </svg>
                    </div>
                );
            case 'word':
                return (
                    <div className="w-9 h-9 rounded-lg bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM9.5 16.5l-1.25-5h1.1l.65 3.3.65-3.3h1.1l-1.25 5h-1z" />
                        </svg>
                    </div>
                );
            case 'excel':
                return (
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zM10.2 16.5l-1.2-2.1-1.2 2.1H6.5l1.8-3-1.7-2.9h1.3l1.1 2 1.1-2h1.3l-1.7 2.9 1.8 3h-1.3z" />
                        </svg>
                    </div>
                );
            case 'powerpoint':
                return (
                    <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-3 14H9.5V8.5H12c1.4 0 2.5 1.1 2.5 2.5s-1.1 2.5-2.5 2.5h-1V16zm0-4.5h1c.6 0 1-.4 1-1s-.4-1-1-1h-1v2z" />
                        </svg>
                    </div>
                );
            default:
                return (
                    <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                );
        }
    };

    return (
        <CtmrLayout title={`${task.title} - Step Timeline & เอกสาร`} activeNav="agency-docs">
            <div className="max-w-[1720px] mx-auto p-4 sm:p-6 space-y-6">

                {/* BACK BAR */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/agency-docs"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#006BB4] transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        <span>ย้อนกลับไปหน้ารวมภารกิจงาน & เอกสาร</span>
                    </Link>

                    <div className="flex items-center gap-3">
                        <div className="text-xs text-slate-400">
                            สร้างเมื่อ: {task.created_at} โดย <span className="font-semibold text-slate-600">{task.creator_name}</span>
                        </div>

                        {canManage && (
                            <button
                                type="button"
                                onClick={handleDeleteTask}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white text-xs font-semibold rounded-lg border border-rose-200 hover:border-rose-600 transition cursor-pointer shadow-2xs"
                                title="ลบรายการกิจกรรมนี้"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>ลบรายการกิจกรรมนี้</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* PROJECT SUMMARY HERO CARD */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-[#006BB4] via-[#00A88F] to-emerald-400"></div>

                    <div className="p-5 sm:p-6 space-y-4">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="space-y-1.5">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#006BB4]/10 text-[#006BB4] border border-[#006BB4]/20">
                                        รหัส {task.agency_code}: {task.agency_name}
                                    </span>
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                                        หมวดหมู่: {categories.find((c) => c.id === task.category)?.name || task.category}
                                    </span>
                                    {task.priority === 'urgent' && (
                                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-700 border border-rose-200">
                                            เร่งด่วนที่สุด
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                                    {task.title}
                                </h1>
                            </div>

                            {/* Status & Progress Counter */}
                            <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-3 rounded-xl">
                                <div className="text-center px-2">
                                    <div className="text-[11px] font-semibold text-slate-400 uppercase">สถานะรวม</div>
                                    <div className="text-xs font-bold text-slate-800 mt-0.5">
                                        {task.status === 'completed'
                                            ? 'เสร็จสมบูรณ์'
                                            : task.status === 'in_progress'
                                            ? 'กำลังดำเนินการ'
                                            : 'รอดำเนินการ'}
                                    </div>
                                </div>
                                <div className="h-8 border-r border-slate-200"></div>
                                <div className="text-center px-2">
                                    <div className="text-[11px] font-semibold text-slate-400 uppercase">ความคืบหน้า</div>
                                    <div className="text-xl font-bold text-[#006BB4] mt-0.5">
                                        {task.progress_percent}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {task.description && (
                            <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                                {task.description}
                            </p>
                        )}

                        {/* Progress Bar & Schedule */}
                        <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-4 text-slate-500">
                                    {task.start_date && <span>วันที่เริ่ม: <strong className="text-slate-700">{task.start_date}</strong></span>}
                                    {task.due_date && <span>กำหนดส่ง: <strong className="text-slate-700">{task.due_date}</strong></span>}
                                </div>
                                <span className="font-semibold text-slate-600">
                                    สำเร็จ {steps.filter((s) => s.status === 'completed').length} จาก {steps.length} ขั้นตอน
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ${
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
                    </div>
                </div>

                {/* TIMELINE SECTION HEADER */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#006BB4]"></span>
                            ขั้นตอนการปฏิบัติงาน & เอกสารรายงานผล (Step Timeline)
                        </h2>
                        <p className="text-xs text-slate-500">
                            ติดตามความคืบหน้าทีละขั้นตอน สามารถเปลี่ยนสถานะและแนบเอกสาร PDF, Word, Excel, PowerPoint ในแต่ละขั้นตอน
                        </p>
                    </div>

                    {canManage && (
                        <button
                            onClick={() => setShowAddStepModal(true)}
                            className="px-3.5 py-2 bg-slate-100 hover:bg-[#006BB4] hover:text-white text-slate-700 text-xs font-semibold rounded-lg transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            <span>เพิ่มขั้นตอน (Step)</span>
                        </button>
                    )}
                </div>

                {/* CONNECTED VERTICAL STEP TIMELINE */}
                <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
                    {steps.map((step, idx) => {
                        const isCompleted = step.status === 'completed';
                        const isInProgress = step.status === 'in_progress';
                        const isPending = step.status === 'pending';

                        return (
                            <div key={step.id} className="relative group">
                                {/* Timeline Milestone Node Marker */}
                                <div className="absolute -left-6 sm:-left-8 top-4 flex items-center justify-center">
                                    {isCompleted ? (
                                        <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-4 ring-white shadow-xs">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    ) : isInProgress ? (
                                        <div className="w-7 h-7 rounded-full bg-[#006BB4] text-white flex items-center justify-center ring-4 ring-white shadow-xs">
                                            <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping"></span>
                                        </div>
                                    ) : (
                                        <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-500 font-bold text-xs flex items-center justify-center ring-4 ring-white">
                                            {step.step_number}
                                        </div>
                                    )}
                                </div>

                                {/* Step Card Container */}
                                <div className={`bg-white rounded-xl border p-5 shadow-xs transition ${
                                    isCompleted
                                        ? 'border-emerald-200 shadow-emerald-50/50'
                                        : isInProgress
                                        ? 'border-[#006BB4]/40 ring-1 ring-[#006BB4]/20'
                                        : 'border-slate-200'
                                }`}>
                                    {/* Step Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                                        <div className="flex items-center gap-2.5">
                                            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700">
                                                STEP {step.step_number}
                                            </span>
                                            <h3 className="text-base font-bold text-slate-800">{step.title}</h3>
                                        </div>

                                        {/* Status Toggle Actions */}
                                        <div className="flex items-center gap-2">
                                            {canManage && (
                                                <div className="flex items-center gap-1.5">
                                                    {isPending && (
                                                        <button
                                                            onClick={() => handleUpdateStepStatus(step.id, 'in_progress')}
                                                            className="px-2.5 py-1 bg-sky-50 text-[#006BB4] hover:bg-sky-100 text-xs font-semibold rounded border border-sky-200 transition cursor-pointer"
                                                        >
                                                            ▶ เริ่มทำขั้นตอนนี้
                                                        </button>
                                                    )}

                                                    {isInProgress && (
                                                        <button
                                                            onClick={() => handleUpdateStepStatus(step.id, 'completed')}
                                                            className="px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold rounded shadow-xs transition flex items-center gap-1 cursor-pointer"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            <span>ยืนยันเสร็จสมบูรณ์</span>
                                                        </button>
                                                    )}

                                                    {isCompleted && (
                                                        <button
                                                            onClick={() => handleUpdateStepStatus(step.id, 'in_progress')}
                                                            className="px-2 py-1 text-slate-500 hover:text-[#006BB4] text-xs font-medium transition cursor-pointer"
                                                            title="ย้อนกลับเป็นกำลังดำเนินการ"
                                                        >
                                                            ↩ ย้อนกลับ
                                                        </button>
                                                    )}

                                                    {canManage && (
                                                        <button
                                                            onClick={() => handleDeleteStep(step.id, step.title)}
                                                            className="text-slate-300 hover:text-rose-500 p-1 text-xs transition cursor-pointer"
                                                            title="ลบขั้นตอนนี้"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            )}

                                            {/* Status Badge */}
                                            {isCompleted ? (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                                                    ✓ เสร็จสิ้นแล้ว
                                                </span>
                                            ) : isInProgress ? (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-[#006BB4] flex items-center gap-1">
                                                    ● กำลังดำเนินการ
                                                </span>
                                            ) : (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                                                    รอดำเนินการ
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Step Description & Remarks */}
                                    <div className="py-3 text-xs space-y-2">
                                        {step.description && (
                                            <p className="text-slate-600 leading-relaxed">{step.description}</p>
                                        )}

                                        <div className="flex flex-wrap items-center gap-4 text-slate-400 text-[11px] pt-1">
                                            {step.due_date && (
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span>เป้าหมายขั้นตอนนี้: {step.due_date}</span>
                                                </span>
                                            )}

                                            {step.completed_at && (
                                                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <span>เสร็จสิ้นเมื่อ {step.completed_at} โดย {step.completed_by_name || 'เจ้าหน้าที่'}</span>
                                                </span>
                                            )}
                                        </div>

                                        {step.remarks && (
                                            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-700 text-[11px]">
                                                <span className="font-semibold text-slate-500">บันทึกผลการปฏิบัติ:</span> {step.remarks}
                                            </div>
                                        )}
                                    </div>

                                    {/* REPORT ATTACHMENTS BOX */}
                                    <div className="mt-3 pt-3 border-t border-slate-100">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                                <svg className="w-4 h-4 text-[#00A88F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                </svg>
                                                <span>เอกสารรายงานผลประจำขั้นตอนนี้ ({step.attachments.length} ไฟล์)</span>
                                                <span className="text-[10px] text-slate-400 font-normal">
                                                    (PDF, Word, Excel, PowerPoint)
                                                </span>
                                            </div>

                                            {canManage && (
                                                <button
                                                    onClick={() => {
                                                        if (activeUploadStepId === step.id) {
                                                            setActiveUploadStepId(null);
                                                        } else {
                                                            setActiveUploadStepId(step.id);
                                                            setSelectedFile(null);
                                                            setUploadDescription('');
                                                        }
                                                    }}
                                                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#006BB4] hover:text-[#00528A] cursor-pointer"
                                                >
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                    </svg>
                                                    <span>{activeUploadStepId === step.id ? 'ปิดกล่องแนบไฟล์' : '+ แนบเอกสารผลงาน'}</span>
                                                </button>
                                            )}
                                        </div>

                                        {/* File Upload Form Area (if active for this step) */}
                                        {activeUploadStepId === step.id && (
                                            <form
                                                onSubmit={(e) => handleUploadAttachment(e, step.id)}
                                                className="mb-3 p-3.5 bg-sky-50/70 border border-sky-200 rounded-xl space-y-3"
                                            >
                                                <div className="text-xs font-semibold text-sky-900 flex items-center gap-1.5">
                                                    <svg className="w-4 h-4 text-[#006BB4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                    </svg>
                                                    <span>อัปโหลดเอกสารรายงานผลสำหรับ {step.title}</span>
                                                </div>

                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                                            เลือกไฟล์เอกสาร (PDF, Word, Excel, PPT สูงสุด 25MB) <span className="text-rose-500">*</span>
                                                        </label>
                                                        <input
                                                            type="file"
                                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                                            onChange={(e) => setSelectedFile(e.target.files[0])}
                                                            className="w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#006BB4] file:text-white hover:file:bg-[#00528A] cursor-pointer"
                                                            required
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                                                            คำอธิบายสั้นๆ ของเอกสาร
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={uploadDescription}
                                                            onChange={(e) => setUploadDescription(e.target.value)}
                                                            placeholder="เช่น รายงานผลการทดสอบระบบรอบที่ 1"
                                                            className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-md focus:border-[#006BB4] focus:outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-end gap-2 pt-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveUploadStepId(null)}
                                                        className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800"
                                                    >
                                                        ยกเลิก
                                                    </button>
                                                    <button
                                                        type="submit"
                                                        disabled={isUploading || !selectedFile}
                                                        className="px-4 py-1.5 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-semibold rounded-md shadow-xs disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5"
                                                    >
                                                        {isUploading ? (
                                                            <>
                                                                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                                                <span>กำลังอัปโหลด...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                                </svg>
                                                                <span>ยืนยันแนบเอกสาร</span>
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </form>
                                        )}

                                        {/* Attachments List */}
                                        {step.attachments.length === 0 ? (
                                            <div className="py-2 text-[11px] text-slate-400 italic">
                                                ยังไม่มีเอกสารรายงานผลแนบในขั้นตอนนี้
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                                {step.attachments.map((att) => (
                                                    <div
                                                        key={att.id}
                                                        className="p-3 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg flex items-center justify-between gap-3 transition group/att"
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0">
                                                            {renderFileBadge(att.file_type)}
                                                            <div className="min-w-0">
                                                                <div className="font-semibold text-xs text-slate-800 truncate" title={att.file_name}>
                                                                    {att.file_name}
                                                                </div>
                                                                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                                                                    {att.file_size} • {att.uploader_name} • {att.created_at}
                                                                </div>
                                                                {att.description && (
                                                                    <div className="text-[10px] text-slate-500 italic truncate">
                                                                        {att.description}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <a
                                                                href={`/agency-docs/attachments/${att.id}/download`}
                                                                className="p-1.5 bg-[#006BB4] hover:bg-[#00528A] text-white rounded shadow-2xs transition cursor-pointer"
                                                                title="ดาวน์โหลดไฟล์เอกสาร"
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                </svg>
                                                            </a>

                                                            {canManage && (
                                                                <button
                                                                    onClick={() => handleDeleteAttachment(att.id, att.file_name)}
                                                                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition cursor-pointer"
                                                                    title="ลบเอกสารนี้"
                                                                >
                                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* MODAL: ADD STEP */}
                {showAddStepModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
                        <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden">
                            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                                <h3 className="text-sm font-bold text-slate-800">+ เพิ่มขั้นตอนใหม่ใน Timeline</h3>
                                <button onClick={() => setShowAddStepModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                            </div>
                            <form onSubmit={handleAddNewStep} className="p-4 space-y-3 text-xs">
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">
                                        ชื่อขั้นตอน (Step Title) <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={newStepTitle}
                                        onChange={(e) => setNewStepTitle(e.target.value)}
                                        placeholder="เช่น ขั้นตอนที่ 5: จัดทำรายงานสรุปประจำเดือน"
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#006BB4]/20 focus:border-[#006BB4]"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">รายละเอียดขั้นตอน</label>
                                    <textarea
                                        rows="2"
                                        value={newStepDesc}
                                        onChange={(e) => setNewStepDesc(e.target.value)}
                                        placeholder="วัตถุประสงค์ หรือตัวชี้วัดของขั้นตอนนี้..."
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#006BB4]/20 focus:border-[#006BB4]"
                                    ></textarea>
                                </div>
                                <div>
                                    <label className="block font-semibold text-slate-700 mb-1">กำหนดเสร็จ (Due Date)</label>
                                    <input
                                        type="date"
                                        value={newStepDueDate}
                                        onChange={(e) => setNewStepDueDate(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:ring-2 focus:ring-[#006BB4]/20 focus:border-[#006BB4]"
                                    />
                                </div>
                                <div className="pt-2 flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddStepModal(false)}
                                        className="px-3.5 py-1.5 border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-50"
                                    >
                                        ยกเลิก
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-1.5 bg-[#006BB4] hover:bg-[#00528A] text-white font-semibold rounded-lg shadow-sm"
                                    >
                                        เพิ่มขั้นตอน
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
