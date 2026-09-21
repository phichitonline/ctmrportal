import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import CtmrLayout from '../../Layouts/CtmrLayout';

export default function Index({ users, filters, agencies, stats }) {
    const { auth, flash, errors } = usePage().props;

    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const [selectedRole, setSelectedRole] = useState(filters.role || '');
    const [selectedAgency, setSelectedAgency] = useState(filters.agency_code || '');
    const [selectedStatus, setSelectedStatus] = useState(filters.status || '');

    // Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deletingUser, setDeletingUser] = useState(null);
    const [resetting2FAUser, setResetting2FAUser] = useState(null);

    // Form for Add / Edit
    const { data, setData, post, put, processing, reset, errors: formErrors, clearErrors } = useForm({
        name: '',
        provider_id: '',
        email: '',
        password: '',
        role: 'hospital_user',
        agency_code: '002',
        position: '',
        phone: '',
        is_active: true,
    });

    const handleFilter = (customFilters = {}) => {
        const query = {
            search: customFilters.search !== undefined ? customFilters.search : searchTerm,
            role: customFilters.role !== undefined ? customFilters.role : selectedRole,
            agency_code: customFilters.agency_code !== undefined ? customFilters.agency_code : selectedAgency,
            status: customFilters.status !== undefined ? customFilters.status : selectedStatus,
        };

        // Remove empty keys
        Object.keys(query).forEach((key) => {
            if (!query[key]) delete query[key];
        });

        router.get('/users', query, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        handleFilter();
    };

    const handleResetFilters = () => {
        setSearchTerm('');
        setSelectedRole('');
        setSelectedAgency('');
        setSelectedStatus('');
        router.get('/users');
    };

    const openAddModal = () => {
        clearErrors();
        reset();
        setData({
            name: '',
            provider_id: '',
            email: '',
            password: '',
            role: 'hospital_user',
            agency_code: '002',
            position: '',
            phone: '',
            is_active: true,
        });
        setIsAddModalOpen(true);
    };

    const openEditModal = (user) => {
        clearErrors();
        setEditingUser(user);
        setData({
            name: user.name,
            provider_id: user.provider_id,
            email: user.email || '',
            password: '',
            role: user.role,
            agency_code: user.agency_code,
            position: user.position || '',
            phone: user.phone || '',
            is_active: Boolean(user.is_active),
        });
    };

    const handleCreateUser = (e) => {
        e.preventDefault();
        post('/users', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
            },
        });
    };

    const handleUpdateUser = (e) => {
        e.preventDefault();
        if (!editingUser) return;

        put(`/users/${editingUser.id}`, {
            onSuccess: () => {
                setEditingUser(null);
                reset();
            },
        });
    };

    const handleToggleStatus = (user) => {
        if (user.id === auth?.user?.id) {
            alert('ไม่สามารถปิดการใช้งานบัญชีของตนเองได้');
            return;
        }
        router.patch(`/users/${user.id}/toggle`, {}, {
            preserveScroll: true,
        });
    };

    const handleDeleteUser = () => {
        if (!deletingUser) return;
        router.delete(`/users/${deletingUser.id}`, {
            preserveScroll: true,
            onSuccess: () => setDeletingUser(null),
        });
    };

    const handleReset2FA = () => {
        if (!resetting2FAUser) return;
        router.post(`/users/${resetting2FAUser.id}/reset-2fa`, {}, {
            preserveScroll: true,
            onSuccess: () => setResetting2FAUser(null),
        });
    };

    return (
        <CtmrLayout title="User Management" activeNav="users">
            <div className="space-y-6">
                {/* PAGE HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D3DAE6] pb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#006BB4]"></span>
                            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                                ระบบจัดการผู้ใช้งาน (User & Role Management)
                            </h1>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-sky-100 text-sky-800 border border-sky-200">
                                RBAC Security
                            </span>
                        </div>
                        <p className="text-xs text-slate-500">
                            จัดการบัญชีผู้ใช้งาน สิทธิ์การเข้าถึงแยกรายโรงพยาบาลในจังหวัดพิจิตร และการยืนยันตัวตนด้วย Provider ID
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-semibold rounded-md shadow-xs transition cursor-pointer self-start sm:self-auto"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        <span>เพิ่มผู้ใช้งานใหม่</span>
                    </button>
                </div>

                {/* STATS OVERVIEW CARDS */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
                    <div className="bg-white border border-[#D3DAE6] rounded-lg p-3.5 shadow-2xs flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">ผู้ใช้งานทั้งหมด</div>
                            <div className="text-xl font-bold text-slate-800 mt-1">{stats.total}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">ในระบบ MIS พิจิตร</div>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#006BB4] flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-white border border-[#D3DAE6] rounded-lg p-3.5 shadow-2xs flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider">ใช้งานปกติ</div>
                            <div className="text-xl font-bold text-emerald-700 mt-1">{stats.active}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">บัญชี Active</div>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-white border border-[#D3DAE6] rounded-lg p-3.5 shadow-2xs flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">2FA Protected</div>
                            <div className="text-xl font-bold text-emerald-700 mt-1">{stats.two_factor_active || 0}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">Google 2FA</div>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-white border border-[#D3DAE6] rounded-lg p-3.5 shadow-2xs flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-semibold text-[#006BB4] uppercase tracking-wider">Super Admins</div>
                            <div className="text-xl font-bold text-[#006BB4] mt-1">{stats.admins}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">สสจ.พิจิตร</div>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-sky-50 text-[#006BB4] flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>

                    <div className="bg-white border border-[#D3DAE6] rounded-lg p-3.5 shadow-2xs flex items-center justify-between">
                        <div>
                            <div className="text-[11px] font-semibold text-amber-600 uppercase tracking-wider">Hospital Staff</div>
                            <div className="text-xl font-bold text-amber-700 mt-1">{stats.hospital_users}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">ประจำโรงพยาบาล</div>
                        </div>
                        <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* FILTERS & SEARCH TOOLBAR */}
                <div className="bg-white border border-[#D3DAE6] rounded-lg p-4 shadow-2xs space-y-3">
                    <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* Search Input */}
                        <div className="lg:col-span-2 relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="ค้นหาด้วยชื่อ, Provider ID, ตำแหน่ง..."
                                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                            />
                        </div>

                        {/* Role Filter */}
                        <div>
                            <select
                                value={selectedRole}
                                onChange={(e) => {
                                    setSelectedRole(e.target.value);
                                    handleFilter({ role: e.target.value });
                                }}
                                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                            >
                                <option value="">-- ทุกบทบาท (Roles) --</option>
                                <option value="admin">Super Admin (สสจ.)</option>
                                <option value="hospital_user">Hospital User (รพ.)</option>
                            </select>
                        </div>

                        {/* Agency Filter */}
                        <div>
                            <select
                                value={selectedAgency}
                                onChange={(e) => {
                                    setSelectedAgency(e.target.value);
                                    handleFilter({ agency_code: e.target.value });
                                }}
                                className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-300 rounded-md focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                            >
                                <option value="">-- ทุกโรงพยาบาล/สังกัด --</option>
                                {agencies.map((ag) => (
                                    <option key={ag.code} value={ag.code}>
                                        {ag.code} - {ag.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-2">
                            <button
                                type="submit"
                                className="flex-1 py-2 px-3 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-semibold rounded-md transition cursor-pointer"
                            >
                                ค้นหา
                            </button>
                            <button
                                type="button"
                                onClick={handleResetFilters}
                                className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-medium rounded-md transition cursor-pointer"
                                title="ล้างตัวกรอง"
                            >
                                ล้าง
                            </button>
                        </div>
                    </form>
                </div>

                {/* USERS DATA TABLE */}
                <div className="bg-white border border-[#D3DAE6] rounded-lg shadow-2xs overflow-hidden">
                    <div className="px-4 py-3 border-b border-[#D3DAE6] flex items-center justify-between bg-slate-50">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                รายการบัญชีผู้ใช้งาน ({users.total} รายการ)
                            </span>
                        </div>
                        <span className="text-xs text-slate-400">
                            แสดงหน้า {users.current_page} จาก {users.last_page}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-[#F5F7FA] text-slate-600 font-semibold border-b border-[#D3DAE6] uppercase tracking-wider">
                                <tr>
                                    <th className="p-3.5">Provider ID</th>
                                    <th className="p-3.5">ชื่อ-นามสกุล / ตำแหน่ง</th>
                                    <th className="p-3.5">หน่วยงาน / โรงพยาบาลสังกัด</th>
                                    <th className="p-3.5">สิทธิ์ (Role)</th>
                                    <th className="p-3.5">ข้อมูลติดต่อ</th>
                                    <th className="p-3.5">สถานะ</th>
                                    <th className="p-3.5">ความปลอดภัย 2FA</th>
                                    <th className="p-3.5 text-right">การจัดการ</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="p-8 text-center text-slate-400">
                                            ไม่พบข้อมูลผู้ใช้งานที่ตรงกับเงื่อนไขการค้นหา
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50 transition">
                                            {/* Provider ID */}
                                            <td className="p-3.5 font-mono font-bold text-[#006BB4] whitespace-nowrap">
                                                {user.provider_id}
                                            </td>

                                            {/* Name & Position */}
                                            <td className="p-3.5">
                                                <div className="font-semibold text-slate-800">{user.name}</div>
                                                <div className="text-[11px] text-slate-500">{user.position || '-'}</div>
                                            </td>

                                            {/* Agency */}
                                            <td className="p-3.5">
                                                <div className="font-medium text-slate-700">{user.agency_name}</div>
                                                <div className="text-[11px] font-mono text-slate-400">Node ID: {user.agency_code}</div>
                                            </td>

                                            {/* Role */}
                                            <td className="p-3.5 whitespace-nowrap">
                                                {user.role === 'admin' ? (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                                                        <svg className="w-3 h-3 mr-1 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                        </svg>
                                                        Super Admin
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                                        <svg className="w-3 h-3 mr-1 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                        </svg>
                                                        Hospital User
                                                    </span>
                                                )}
                                            </td>

                                            {/* Contact */}
                                            <td className="p-3.5">
                                                <div className="text-slate-600">{user.email || '-'}</div>
                                                <div className="text-[11px] text-slate-400">{user.phone || '-'}</div>
                                            </td>

                                            {/* Status & Toggle */}
                                            <td className="p-3.5 whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleStatus(user)}
                                                    disabled={user.id === auth?.user?.id}
                                                    title={user.id === auth?.user?.id ? 'ไม่สามารถเปลี่ยนสถานะบัญชีตนเองได้' : 'คลิกเพื่อเปิด/ปิดการใช้งาน'}
                                                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold transition ${
                                                        user.is_active
                                                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                            : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                                                    } ${user.id === auth?.user?.id ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
                                                >
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                                    <span>{user.is_active ? 'เปิดใช้งาน' : 'ระงับชั่วคราว'}</span>
                                                </button>
                                            </td>

                                            {/* 2FA Status */}
                                            <td className="p-3.5 whitespace-nowrap">
                                                {user.has_2fa ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                        <span>เปิดแล้ว</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                        <span>ยังไม่เปิด</span>
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="p-3.5 text-right whitespace-nowrap">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    {user.has_2fa && (
                                                        <button
                                                            onClick={() => setResetting2FAUser(user)}
                                                            className="p-1.5 rounded hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition cursor-pointer"
                                                            title="รีเซ็ต 2FA (เมื่อผู้ใช้ทำโทรศัพท์หาย)"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                            </svg>
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => openEditModal(user)}
                                                        className="p-1.5 rounded hover:bg-slate-100 text-slate-600 hover:text-[#006BB4] transition cursor-pointer"
                                                        title="แก้ไขข้อมูล"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>

                                                    {user.id !== auth?.user?.id && (
                                                        <button
                                                            onClick={() => setDeletingUser(user)}
                                                            className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition"
                                                            title="ลบผู้ใช้งาน"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {users.links.length > 3 && (
                        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                                รายการที่ {users.from || 0} - {users.to || 0} จาก {users.total} รายการ
                            </span>
                            <div className="flex items-center gap-1">
                                {users.links.map((link, idx) => (
                                    <button
                                        key={idx}
                                        disabled={!link.url || link.active}
                                        onClick={() => link.url && router.get(link.url, {}, { preserveState: true, preserveScroll: true })}
                                        className={`px-2.5 py-1 rounded text-xs transition ${
                                            link.active
                                                ? 'bg-[#006BB4] text-white font-semibold'
                                                : link.url
                                                ? 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 cursor-pointer'
                                                : 'text-slate-300 cursor-not-allowed'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* ADD USER MODAL */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-xl w-full flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded bg-sky-100 text-[#006BB4] flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">เพิ่มผู้ใช้งานใหม่</h3>
                                    <p className="text-xs text-slate-500">กำหนด Provider ID และบทบาทสิทธิ์รายโรงพยาบาล</p>
                                </div>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateUser} className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Provider ID */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Provider ID <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.provider_id}
                                        onChange={(e) => setData('provider_id', e.target.value)}
                                        placeholder="เช่น HOS007"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4] font-mono uppercase"
                                        required
                                    />
                                    {formErrors.provider_id && <p className="mt-1 text-xs text-rose-600">{formErrors.provider_id}</p>}
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="เช่น นายวิชัย สมบูรณ์"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                        required
                                    />
                                    {formErrors.name && <p className="mt-1 text-xs text-rose-600">{formErrors.name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Role */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        บทบาทสิทธิ์ (Role) <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    >
                                        <option value="hospital_user">Hospital User (จำกัดเฉพาะหน่วยงาน)</option>
                                        <option value="admin">Super Admin (เข้าถึงได้ทุกโหนด/ทุกโมดูล)</option>
                                    </select>
                                    {formErrors.role && <p className="mt-1 text-xs text-rose-600">{formErrors.role}</p>}
                                </div>

                                {/* Agency */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        หน่วยงานสังกัด (Hospital) <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.agency_code}
                                        onChange={(e) => setData('agency_code', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    >
                                        {agencies.map((ag) => (
                                            <option key={ag.code} value={ag.code}>
                                                {ag.code} - {ag.name}
                                            </option>
                                        ))}
                                    </select>
                                    {formErrors.agency_code && <p className="mt-1 text-xs text-rose-600">{formErrors.agency_code}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Position */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">ตำแหน่งงาน</label>
                                    <input
                                        type="text"
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        placeholder="เช่น นักวิชาการคอมพิวเตอร์"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="เช่น 056-611xxx"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมล (ถ้ามี)</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="user@ppho.go.th"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    />
                                    {formErrors.email && <p className="mt-1 text-xs text-rose-600">{formErrors.email}</p>}
                                </div>

                                {/* Password */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        รหัสผ่านเริ่มต้น <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="อย่างน้อย 6 ตัวอักษร"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                        required
                                    />
                                    {formErrors.password && <p className="mt-1 text-xs text-rose-600">{formErrors.password}</p>}
                                </div>
                            </div>

                            {/* Active Status */}
                            <div className="pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        className="w-4 h-4 text-[#006BB4] rounded border-slate-300 focus:ring-[#006BB4]"
                                    />
                                    <span className="text-xs text-slate-700 font-medium">เปิดใช้งานบัญชีทันทีหลังสร้าง</span>
                                </label>
                            </div>

                            <div className="px-6 py-4 -mx-6 -mb-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setIsAddModalOpen(false)}
                                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded cursor-pointer"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
                                >
                                    {processing ? 'กำลังบันทึก...' : 'บันทึกผู้ใช้งาน'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT USER MODAL */}
            {editingUser && (
                <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-xl w-full flex flex-col overflow-hidden max-h-[90vh]">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded bg-sky-100 text-[#006BB4] flex items-center justify-center">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-800">แก้ไขข้อมูลผู้ใช้งาน</h3>
                                    <p className="text-xs text-slate-500">ID: {editingUser.provider_id} • {editingUser.name}</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-slate-600 p-1.5 rounded">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleUpdateUser} className="p-6 overflow-y-auto space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Provider ID */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        Provider ID <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.provider_id}
                                        onChange={(e) => setData('provider_id', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4] font-mono uppercase"
                                        required
                                    />
                                    {formErrors.provider_id && <p className="mt-1 text-xs text-rose-600">{formErrors.provider_id}</p>}
                                </div>

                                {/* Full Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                        required
                                    />
                                    {formErrors.name && <p className="mt-1 text-xs text-rose-600">{formErrors.name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Role */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        บทบาทสิทธิ์ (Role) <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.role}
                                        onChange={(e) => setData('role', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    >
                                        <option value="hospital_user">Hospital User (จำกัดเฉพาะหน่วยงาน)</option>
                                        <option value="admin">Super Admin (เข้าถึงได้ทุกโหนด/ทุกโมดูล)</option>
                                    </select>
                                    {formErrors.role && <p className="mt-1 text-xs text-rose-600">{formErrors.role}</p>}
                                </div>

                                {/* Agency */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        หน่วยงานสังกัด (Hospital) <span className="text-rose-500">*</span>
                                    </label>
                                    <select
                                        value={data.agency_code}
                                        onChange={(e) => setData('agency_code', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    >
                                        {agencies.map((ag) => (
                                            <option key={ag.code} value={ag.code}>
                                                {ag.code} - {ag.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Position */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">ตำแหน่งงาน</label>
                                    <input
                                        type="text"
                                        value={data.position}
                                        onChange={(e) => setData('position', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                                    <input
                                        type="text"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Email */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">อีเมล</label>
                                    <input
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    />
                                </div>

                                {/* Password Reset (Optional) */}
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                                        เปลี่ยนรหัสผ่านใหม่ (เว้นว่างหากไม่เปลี่ยน)
                                    </label>
                                    <input
                                        type="password"
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    />
                                    {formErrors.password && <p className="mt-1 text-xs text-rose-600">{formErrors.password}</p>}
                                </div>
                            </div>

                            {/* Active Status */}
                            <div className="pt-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={data.is_active}
                                        onChange={(e) => setData('is_active', e.target.checked)}
                                        disabled={editingUser.id === auth?.user?.id}
                                        className="w-4 h-4 text-[#006BB4] rounded border-slate-300 focus:ring-[#006BB4]"
                                    />
                                    <span className="text-xs text-slate-700 font-medium">เปิดใช้งานบัญชีนี้</span>
                                </label>
                            </div>

                            <div className="px-6 py-4 -mx-6 -mb-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingUser(null)}
                                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded cursor-pointer"
                                >
                                    ยกเลิก
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-semibold rounded cursor-pointer disabled:opacity-50"
                                >
                                    {processing ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DELETE CONFIRMATION MODAL */}
            {deletingUser && (
                <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800">ยืนยันการลบผู้ใช้งาน</h3>
                                <p className="text-xs text-slate-500">การกระทำนี้ไม่สามารถย้อนกลับได้</p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                            คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีผู้ใช้งาน <strong className="text-slate-800">{deletingUser.name}</strong> ({deletingUser.provider_id}) สังกัด <strong className="text-slate-800">{deletingUser.agency_name}</strong> ออกจากระบบ?
                        </p>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setDeletingUser(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded cursor-pointer"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded cursor-pointer"
                            >
                                ลบผู้ใช้งาน
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* RESET 2FA CONFIRMATION MODAL */}
            {resetting2FAUser && (
                <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-slate-800">ยืนยันการรีเซ็ต 2FA</h3>
                                <p className="text-xs text-slate-500">Google Authenticator Reset</p>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed">
                            คุณต้องการรีเซ็ตการยืนยันตัวตนสองขั้นตอน (2FA) ให้กับคุณ <strong className="text-slate-800">{resetting2FAUser.name}</strong> ({resetting2FAUser.provider_id}) หรือไม่?
                        </p>
                        <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200 leading-relaxed">
                            ⚠️ หลังจากรีเซ็ตแล้ว ผู้ใช้งานจะสามารถเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านตามปกติได้ทันที และต้องเข้าไปตั้งค่า 2FA ใหม่อีกครั้งหากต้องการเปิดใช้งาน
                        </p>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                onClick={() => setResetting2FAUser(null)}
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded cursor-pointer"
                            >
                                ยกเลิก
                            </button>
                            <button
                                onClick={handleReset2FA}
                                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded cursor-pointer"
                            >
                                ยืนยันรีเซ็ต 2FA
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </CtmrLayout>
    );
}
