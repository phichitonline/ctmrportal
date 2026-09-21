import React, { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import CtmrLayout from '../../Layouts/CtmrLayout';

export default function Show({
    topic,
    agencies,
    categoryLabels,
    severityLabels,
    statusLabels,
    shiftLabels,
}) {
    const { auth } = usePage().props;

    // Modals state
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [statusToChange, setStatusToChange] = useState(topic.status);
    const [resolutionNotes, setResolutionNotes] = useState(topic.resolution_notes || '');
    const [lightboxImage, setLightboxImage] = useState(null);

    // Form for Adding Comment
    const {
        data: commentData,
        setData: setCommentData,
        post: postComment,
        processing: commentProcessing,
        reset: resetComment,
        errors: commentErrors,
    } = useForm({
        content: '',
    });

    // Form for Editing Topic
    const {
        data: editData,
        setData: setEditData,
        put: putEdit,
        processing: editProcessing,
        errors: editErrors,
    } = useForm({
        title: topic.title,
        category: topic.category,
        severity: topic.severity,
        agency_code: topic.agency_code || auth?.user?.agency_code || '001',
        agency_name: topic.agency_name || '',
        shift: topic.shift || 'daily',
        shift_date: topic.shift_date ? topic.shift_date.split('T')[0] : '',
        system_affected: topic.system_affected || '',
        content: topic.content,
    });

    const isAuthor = auth?.user?.id === topic.user_id;
    const isAdmin = auth?.user?.role === 'admin';
    const canManageTopic = isAuthor || isAdmin;

    // Handle Comment Submit
    const handleCommentSubmit = (e) => {
        e.preventDefault();
        postComment(`/webboard/${topic.id}/comments`, {
            preserveScroll: true,
            onSuccess: () => resetComment(),
        });
    };

    // Handle Edit Submit
    const handleEditSubmit = (e) => {
        e.preventDefault();
        putEdit(`/webboard/${topic.id}`, {
            onSuccess: () => setIsEditModalOpen(false),
        });
    };

    // Handle Delete Topic
    const handleDeleteTopic = () => {
        if (confirm('คุณแน่ใจหรือไม่ว่าต้องการลบกระทู้นี้? ข้อมูลความคิดเห็นทั้งหมดจะถูกลบด้วย')) {
            router.delete(`/webboard/${topic.id}`);
        }
    };

    // Handle Toggle Pin
    const handleTogglePin = () => {
        router.patch(`/webboard/${topic.id}/pin`, {}, { preserveScroll: true });
    };

    // Handle Status Change Submit
    const handleStatusSubmit = (e) => {
        e.preventDefault();
        router.patch(
            `/webboard/${topic.id}/status`,
            {
                status: statusToChange,
                resolution_notes: resolutionNotes,
            },
            {
                preserveScroll: true,
                onSuccess: () => setIsStatusModalOpen(false),
            }
        );
    };

    // Handle Mark as Solution
    const handleToggleSolution = (commentId) => {
        router.patch(`/webboard/comments/${commentId}/solution`, {}, { preserveScroll: true });
    };

    // Handle Delete Comment
    const handleDeleteComment = (commentId) => {
        if (confirm('คุณต้องการลบความคิดเห็นนี้ใช่หรือไม่?')) {
            router.delete(`/webboard/comments/${commentId}`, { preserveScroll: true });
        }
    };

    // Category badge helper
    const getCategoryBadge = (cat) => {
        switch (cat) {
            case 'soc_report':
                return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-300', icon: '📋', label: 'รายงานเวร SOC' };
            case 'incident_alert':
                return { bg: 'bg-rose-50 text-rose-700 border-rose-300', icon: '🚨', label: 'แจ้งเตือนภัยคุกคาม' };
            case 'troubleshoot':
                return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-300', icon: '💡', label: 'บันทึกแก้ปัญหา (KB)' };
            case 'announcement':
                return { bg: 'bg-amber-50 text-amber-800 border-amber-300', icon: '📢', label: 'ประกาศ & ข่าวสาร' };
            default:
                return { bg: 'bg-sky-50 text-sky-700 border-sky-300', icon: '💬', label: 'แลกเปลี่ยนประเด็น' };
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
                return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', label: 'แก้ไขเรียบร้อย (Resolved)', dot: 'bg-emerald-500' };
            case 'in_progress':
                return { bg: 'bg-amber-100 text-amber-800 border-amber-300', label: 'กำลังดำเนินการ (In Progress)', dot: 'bg-amber-500' };
            case 'closed':
                return { bg: 'bg-slate-100 text-slate-700 border-slate-300', label: 'ปิดประเด็น (Closed)', dot: 'bg-slate-400' };
            default:
                return { bg: 'bg-sky-100 text-sky-800 border-sky-300', label: 'เปิดประเด็น (Open)', dot: 'bg-sky-500' };
        }
    };

    const catBadge = getCategoryBadge(topic.category);
    const sevBadge = getSeverityBadge(topic.severity);
    const stBadge = getStatusBadge(topic.status);

    return (
        <CtmrLayout title="SOC Webboard" activeNav="webboard">
            <Head title={`${topic.title} - กระดานข่าว SOC`} />

            <div className="max-w-[1380px] mx-auto px-4 py-5 w-full flex-1">
                {/* BACK NAVIGATION */}
                <div className="mb-4 flex items-center justify-between">
                    <Link
                        href="/webboard"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#006BB4] bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        กลับสู่หน้ารายการกระทู้
                    </Link>

                    {/* TOPIC ACTION BUTTONS */}
                    <div className="flex items-center gap-2">
                        {/* Admin Pin Toggle */}
                        {isAdmin && (
                            <button
                                onClick={handleTogglePin}
                                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition cursor-pointer ${
                                    topic.is_pinned
                                        ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                                }`}
                                title="ปักหมุดกระทู้สำคัญ"
                            >
                                <span>📌</span>
                                <span>{topic.is_pinned ? 'ยกเลิกการปักหมุด' : 'ปักหมุดกระทู้'}</span>
                            </button>
                        )}

                        {/* Status Change Button */}
                        {canManageTopic && (
                            <button
                                onClick={() => {
                                    setStatusToChange(topic.status);
                                    setResolutionNotes(topic.resolution_notes || '');
                                    setIsStatusModalOpen(true);
                                }}
                                className="bg-sky-50 hover:bg-sky-100 text-[#006BB4] border border-sky-300 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                ปรับสถานะประเด็น
                            </button>
                        )}

                        {/* Edit Button */}
                        {canManageTopic && (
                            <button
                                onClick={() => setIsEditModalOpen(true)}
                                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                แก้ไข
                            </button>
                        )}

                        {/* Delete Button */}
                        {canManageTopic && (
                            <button
                                onClick={handleDeleteTopic}
                                className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                ลบ
                            </button>
                        )}
                    </div>
                </div>

                {/* MAIN TOPIC ARTICLE CARD */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-6">
                    {/* TOPIC HEADER BANNER */}
                    <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                        {/* Badges line */}
                        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
                            {topic.is_pinned && (
                                <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                                    📌 ปักหมุดสำคัญ
                                </span>
                            )}

                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border flex items-center gap-1 ${catBadge.bg}`}>
                                <span>{catBadge.icon}</span>
                                <span>{catBadge.label}</span>
                            </span>

                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${sevBadge.bg}`}>
                                {sevBadge.label}
                            </span>

                            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border flex items-center gap-1.5 ${stBadge.bg}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${stBadge.dot}`}></span>
                                <span>{stBadge.label}</span>
                            </span>

                            {topic.shift && (
                                <span className="bg-slate-200 text-slate-800 text-[11px] px-2.5 py-0.5 rounded-md font-semibold">
                                    กะ: {shiftLabels[topic.shift] || topic.shift}
                                </span>
                            )}

                            {topic.shift_date && (
                                <span className="bg-slate-100 text-slate-600 text-[11px] px-2.5 py-0.5 rounded-md">
                                    วันที่กะ: {new Date(topic.shift_date).toLocaleDateString('th-TH')}
                                </span>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                            {topic.title}
                        </h1>

                        {/* Author & Meta row */}
                        <div className="mt-4 pt-4 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#003B64] to-[#006BB4] text-white font-bold flex items-center justify-center text-sm shadow-xs">
                                    {topic.user?.name ? topic.user.name.charAt(0) : 'U'}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-800 text-sm">{topic.user?.name || 'นิรนาม'}</span>
                                        {topic.user?.role === 'admin' ? (
                                            <span className="bg-sky-100 text-sky-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                SOC Administrator
                                            </span>
                                        ) : (
                                            <span className="bg-slate-100 text-slate-700 text-[9px] font-medium px-1.5 py-0.5 rounded">
                                                Hospital Staff
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-[11px] text-slate-500 mt-0.5">
                                        {topic.user?.position && <span>{topic.user.position} • </span>}
                                        <span className="font-medium text-slate-700">{topic.agency_name || topic.user?.agency_name}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-slate-500 text-[11px]">
                                <div>
                                    โพสต์เมื่อ: {new Date(topic.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} น.
                                </div>
                                <div className="flex items-center gap-1 text-slate-400">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                    <span>{topic.views_count} ครั้ง</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* System Affected Banner */}
                    {topic.system_affected && (
                        <div className="bg-slate-100/80 px-6 py-2.5 border-b border-slate-200 text-xs flex items-center gap-2">
                            <span className="font-bold text-slate-700">🖥️ ระบบหรืออุปกรณ์ที่เกี่ยวข้อง:</span>
                            <span className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-[11px] text-slate-800 font-semibold">
                                {topic.system_affected}
                            </span>
                        </div>
                    )}

                    {/* MAIN CONTENT BODY */}
                    <div className="p-6">
                        <div className="prose max-w-none text-slate-800 text-sm leading-relaxed whitespace-pre-line font-sans">
                            {topic.content}
                        </div>
                    </div>

                    {/* ATTACHED IMAGES GALLERY */}
                    {((topic.images && topic.images.length > 0) || topic.image_path) && (
                        <div className="px-6 pb-6">
                            <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                                <svg className="w-4 h-4 text-[#006BB4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>รูปภาพและสกรีนช็อตแนบประกอบรายงาน ({topic.images?.length || 1})</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                {(topic.images && topic.images.length > 0 ? topic.images : [topic.image_path]).map((imgSrc, i) => (
                                    <div
                                        key={i}
                                        onClick={() => setLightboxImage(imgSrc)}
                                        className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50 cursor-pointer hover:shadow-md hover:border-[#006BB4] transition"
                                    >
                                        <img
                                            src={imgSrc}
                                            alt={`สกรีนช็อตประกอบ ${i + 1}`}
                                            className="w-full h-44 object-cover group-hover:scale-102 transition duration-200"
                                        />
                                        <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/30 transition flex items-center justify-center">
                                            <span className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-xs text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition">
                                                <svg className="w-3.5 h-3.5 text-[#006BB4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                                                </svg>
                                                ดูภาพขนาดใหญ่
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* RESOLUTION NOTE BOX (IF RESOLVED) */}
                    {topic.status === 'resolved' && (
                        <div className="mx-6 mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                            <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs mb-1.5">
                                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>สรุปผลและแนวทางแก้ไขปัญหา (Resolution Summary)</span>
                            </div>
                            <div className="text-emerald-950 text-xs whitespace-pre-line bg-white/70 p-3 rounded-lg border border-emerald-100">
                                {topic.resolution_notes || 'ปัญหาได้รับการแก้ไขและตรวจสอบความถูกต้องเรียบร้อยแล้ว'}
                            </div>
                            <div className="mt-2 text-[11px] text-emerald-700 flex items-center justify-between">
                                <span>
                                    ผู้บันทึกปิดประเด็น: <strong>{topic.resolved_by_user?.name || 'เจ้าหน้าที่ผู้ดูแล'}</strong>
                                </span>
                                {topic.resolved_at && (
                                    <span>
                                        เวลา: {new Date(topic.resolved_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} น.
                                    </span>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* DISCUSSION / COMMENTS THREAD */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-5">
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                            <svg className="w-5 h-5 text-[#006BB4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            ความคิดเห็นและการตอบกลับ ({topic.comments.length})
                        </h2>
                    </div>

                    {/* COMMENTS LIST */}
                    {topic.comments.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">
                            ยังไม่มีความคิดเห็นหรือข้อเสนอแนะในกระทู้นี้ เป็นคนแรกที่เริ่มตอบกลับเลย!
                        </div>
                    ) : (
                        <div className="space-y-4 mb-6">
                            {topic.comments.map((comment) => {
                                const isCommentAuthor = auth?.user?.id === comment.user_id;
                                const canDeleteComment = isCommentAuthor || isAdmin;

                                return (
                                    <div
                                        key={comment.id}
                                        className={`rounded-xl border p-4 transition ${
                                            comment.is_solution
                                                ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200'
                                                : 'bg-slate-50/40 border-slate-200 hover:border-slate-300'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-2.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                                                    {comment.user?.name ? comment.user.name.charAt(0) : 'U'}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-slate-800 text-xs">{comment.user?.name}</span>
                                                        {comment.user?.role === 'admin' && (
                                                            <span className="bg-sky-100 text-sky-800 text-[9px] font-bold px-1.5 py-0.2 rounded">
                                                                Admin
                                                            </span>
                                                        )}
                                                        {comment.is_solution && (
                                                            <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                                                                ✓ วิธีแก้ไขปัญหาที่เลือก (Solution)
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] text-slate-500">
                                                        {comment.user?.agency_name} • {new Date(comment.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} น.
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Comment action menu */}
                                            <div className="flex items-center gap-1.5">
                                                {canManageTopic && (
                                                    <button
                                                        onClick={() => handleToggleSolution(comment.id)}
                                                        className={`text-[11px] font-semibold px-2 py-1 rounded transition cursor-pointer ${
                                                            comment.is_solution
                                                                ? 'text-rose-600 hover:bg-rose-50'
                                                                : 'text-emerald-700 hover:bg-emerald-100 bg-emerald-50'
                                                        }`}
                                                        title="ทำเครื่องหมายว่าเป็นแนวทางแก้ปัญหาสำเร็จ"
                                                    >
                                                        {comment.is_solution ? '✕ ยกเลิก Solution' : '✓ เลือกเป็น Solution'}
                                                    </button>
                                                )}

                                                {canDeleteComment && (
                                                    <button
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                        className="text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition cursor-pointer"
                                                        title="ลบความคิดเห็น"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Comment text */}
                                        <div className="text-slate-800 text-xs whitespace-pre-line leading-relaxed pl-9">
                                            {comment.content}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* REPLY FORM */}
                    <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-slate-200">
                        <label className="block font-bold text-slate-800 text-xs mb-1.5">
                            เขียนข้อความตอบกลับ / บันทึกการส่งมอบงาน
                        </label>
                        <textarea
                            rows="4"
                            value={commentData.content}
                            onChange={(e) => setCommentData('content', e.target.value)}
                            placeholder="พิมพ์ข้อความแนะนำ หรือรายงานความคืบหน้าที่นี่..."
                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#006BB4] leading-relaxed mb-2"
                            required
                        />
                        {commentErrors.content && <p className="text-rose-600 text-xs mb-2 font-medium">{commentErrors.content}</p>}

                        <div className="flex items-center justify-between">
                            <span className="text-[11px] text-slate-400">
                                โพสต์ในนาม: <strong>{auth?.user?.name}</strong> ({auth?.user?.agency_name})
                            </span>
                            <button
                                type="submit"
                                disabled={commentProcessing}
                                className="bg-[#006BB4] hover:bg-[#005590] text-white font-bold text-xs px-5 py-2 rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                                {commentProcessing ? 'กำลังส่ง...' : 'ส่งความคิดเห็น'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* STATUS & RESOLUTION MODAL */}
            {isStatusModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
                        <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                            <h3 className="font-bold text-slate-800 text-sm">ปรับปรุงสถานะประเด็น</h3>
                            <button onClick={() => setIsStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleStatusSubmit} className="p-5 space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">เลือกสถานะใหม่</label>
                                <select
                                    value={statusToChange}
                                    onChange={(e) => setStatusToChange(e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                >
                                    <option value="open">เปิดประเด็น (Open)</option>
                                    <option value="in_progress">กำลังดำเนินการ (In Progress)</option>
                                    <option value="resolved">แก้ไขเรียบร้อย (Resolved)</option>
                                    <option value="closed">ปิดประเด็น (Closed)</option>
                                </select>
                            </div>

                            {statusToChange === 'resolved' && (
                                <div>
                                    <label className="block font-bold text-emerald-900 mb-1">
                                        บันทึกแนวทางแก้ไขปัญหา (Resolution Notes) <span className="text-rose-500">*</span>
                                    </label>
                                    <textarea
                                        rows="4"
                                        value={resolutionNotes}
                                        onChange={(e) => setResolutionNotes(e.target.value)}
                                        placeholder="สรุปวิธีการแก้ไขปัญหา หรือมาตรการที่ได้ดำเนินการเพื่อเป็นประวัติ..."
                                        className="w-full px-3 py-2 bg-emerald-50/50 border border-emerald-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                        required={statusToChange === 'resolved'}
                                    />
                                </div>
                            )}

                            <div className="pt-2 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsStatusModalOpen(false)}
                                    className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    className="bg-[#006BB4] hover:bg-[#005590] text-white px-4 py-1.5 rounded-lg font-bold shadow-xs cursor-pointer"
                                >
                                    บันทึกสถานะ
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT TOPIC MODAL */}
            {isEditModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden my-6">
                        <div className="bg-gradient-to-r from-[#003B64] to-[#006BB4] text-white px-6 py-4 flex items-center justify-between">
                            <h2 className="text-base font-bold">แก้ไขข้อมูลกระทู้ / รายงาน</h2>
                            <button onClick={() => setIsEditModalOpen(false)} className="text-white/70 hover:text-white cursor-pointer font-bold">
                                ✕
                            </button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="p-6 space-y-3.5 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1">หัวข้อกระทู้</label>
                                <input
                                    type="text"
                                    value={editData.title}
                                    onChange={(e) => setEditData('title', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">หมวดหมู่</label>
                                    <select
                                        value={editData.category}
                                        onChange={(e) => setEditData('category', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    >
                                        <option value="soc_report">รายงานเวรศูนย์ SOC</option>
                                        <option value="discussion">แลกเปลี่ยนประเด็นดูแลระบบ</option>
                                        <option value="incident_alert">แจ้งเตือนภัยคุกคาม / Incident</option>
                                        <option value="troubleshoot">บันทึกการแก้ปัญหา (KB)</option>
                                        <option value="announcement">ประกาศ & ข่าวสาร</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-bold text-slate-700 mb-1">ระดับความสำคัญ</label>
                                    <select
                                        value={editData.severity}
                                        onChange={(e) => setEditData('severity', e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    >
                                        <option value="critical">🚨 วิกฤต (Critical)</option>
                                        <option value="high">⚠️ สูง (High)</option>
                                        <option value="medium">🟡 ปานกลาง (Medium)</option>
                                        <option value="low">🔵 ต่ำ (Low)</option>
                                        <option value="normal">⚪ ปกติ (Normal)</option>
                                        <option value="info">ℹ️ ข้อมูลทั่วไป (Info)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">ระบบหรืออุปกรณ์ที่เกี่ยวข้อง</label>
                                <input
                                    type="text"
                                    value={editData.system_affected}
                                    onChange={(e) => setEditData('system_affected', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                />
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1">เนื้อหา</label>
                                <textarea
                                    rows="8"
                                    value={editData.content}
                                    onChange={(e) => setEditData('content', e.target.value)}
                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006BB4] font-mono leading-relaxed"
                                    required
                                />
                            </div>

                            <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditModalOpen(false)}
                                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={editProcessing}
                                    className="bg-[#006BB4] hover:bg-[#005590] text-white px-5 py-2 rounded-lg font-bold shadow-xs cursor-pointer"
                                >
                                    {editProcessing ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* LIGHTBOX MODAL FOR ZOOMED SCREENSHOT */}
            {lightboxImage && (
                <div
                    onClick={() => setLightboxImage(null)}
                    className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
                >
                    <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
                        <button
                            onClick={() => setLightboxImage(null)}
                            className="absolute -top-10 right-0 text-white hover:text-slate-300 text-sm font-bold flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1 rounded-full cursor-pointer transition"
                        >
                            ✕ ปิดหน้าต่าง (ESC)
                        </button>
                        <img
                            src={lightboxImage}
                            alt="สกรีนช็อตขยายใหญ่"
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/20 cursor-default"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </div>
                </div>
            )}
        </CtmrLayout>
    );
}
