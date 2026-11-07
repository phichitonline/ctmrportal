import React, { useState, useEffect } from 'react';
import { router, useForm, usePage } from '@inertiajs/react';
import CtmrLayout from '@/Layouts/CtmrLayout';

const DEFAULT_GROUP_DEFINITIONS = [
    {
        key: 'soc',
        label: 'SOC & Threat Detection',
        shortLabel: 'SOC & Threat',
        color: 'sky',
        description: 'มอนิเตอร์เหตุการณ์ Wazuh SIEM, วิเคราะห์ภัยคุกคาม Threat Hunting และตอบสนองเหตุฉุกเฉิน',
    },
    {
        key: 'network',
        label: 'Network & Infrastructure',
        shortLabel: 'Network & Infra',
        color: 'indigo',
        description: 'ดูแลระบบเครือข่ายส่วนกลาง Firewall, VPN ระหว่างโรงพยาบาล และโครงสร้างพื้นฐานคลาวด์ HDC',
    },
    {
        key: 'his',
        label: 'HOSxP / Database Security',
        shortLabel: 'HOSxP / DB Sec',
        color: 'amber',
        description: 'ดูแลความมั่นคงปลอดภัยฐานข้อมูล HOSxP / JHCIS, ป้องกัน SQL Injection และระบบสำรองข้อมูล',
    },
    {
        key: 'pdpa',
        label: 'PDPA & Compliance',
        shortLabel: 'PDPA & Compliance',
        color: 'rose',
        description: 'กำกับดูแลการคุ้มครองข้อมูลส่วนบุคคล (PDPA), สิทธิการเข้าถึงเวชระเบียน และธรรมาภิบาลข้อมูล',
    },
];

const GROUP_BADGE_STYLES = {
    soc: 'bg-sky-50 text-sky-700 border-sky-200',
    network: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    his: 'bg-amber-50 text-amber-700 border-amber-200',
    pdpa: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function Team({ members = [], groupDefinitions = DEFAULT_GROUP_DEFINITIONS }) {
    const { auth } = usePage().props;
    const isAdmin = Boolean(auth?.user?.is_admin || auth?.user?.role === 'admin');

    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [profileModal, setProfileModal] = useState({ open: false, member: null });

    // Admin Modal 1: Edit individual user's groups & responsibilities
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState(null);
    const [skillsText, setSkillsText] = useState('');

    const editForm = useForm({
        position: '',
        phone: '',
        team_groups: [],
        team_role_badge: '',
        team_responsibilities: '',
        team_skills: [],
        team_nodes: '',
    });

    // Admin Modal 2: Bulk assign users into one of the 4 groups
    const [groupManageModalOpen, setGroupManageModalOpen] = useState(false);
    const [selectedManageGroup, setSelectedManageGroup] = useState('soc');
    const [groupSearch, setGroupSearch] = useState('');
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [savingGroupAssign, setSavingGroupAssign] = useState(false);

    // Compute counts for each group tab
    const getGroupCount = (groupKey) => {
        return members.filter((m) => Array.isArray(m.team_groups) && m.team_groups.includes(groupKey)).length;
    };

    const filteredMembers = members.filter((member) => {
        const memberGroups = Array.isArray(member.team_groups) ? member.team_groups : [];
        const matchesCategory =
            activeCategory === 'all' ||
            memberGroups.includes(activeCategory) ||
            (member.category && member.category.includes(activeCategory));

        const q = searchQuery.trim().toLowerCase();
        const matchesQuery =
            !q ||
            (member.name || '').toLowerCase().includes(q) ||
            (member.provider_id || '').toLowerCase().includes(q) ||
            (member.position || '').toLowerCase().includes(q) ||
            (member.department || '').toLowerCase().includes(q) ||
            (member.nodes || '').toLowerCase().includes(q);

        return matchesCategory && matchesQuery;
    });

    const openProfile = (member) => {
        setProfileModal({ open: true, member });
    };

    const closeProfile = () => {
        setProfileModal({ open: false, member: null });
    };

    // Open individual member assignment modal (Admin)
    const openEditMemberModal = (member) => {
        setEditingMember(member);
        const skillsArr = Array.isArray(member.skills) ? member.skills : [];
        setSkillsText(skillsArr.join(', '));
        editForm.setData({
            position: member.position || '',
            phone: member.phone || '',
            team_groups: Array.isArray(member.team_groups) ? [...member.team_groups] : [],
            team_role_badge: member.roleBadge || '',
            team_responsibilities: member.responsibilities || '',
            team_skills: skillsArr,
            team_nodes: member.nodes || '',
        });
        setEditModalOpen(true);
    };

    const toggleEditFormGroup = (groupKey) => {
        const current = editForm.data.team_groups || [];
        if (current.includes(groupKey)) {
            editForm.setData(
                'team_groups',
                current.filter((g) => g !== groupKey)
            );
        } else {
            editForm.setData('team_groups', [...current, groupKey]);
        }
    };

    const handleSaveMemberEdit = (e) => {
        e.preventDefault();
        if (!editingMember) return;

        const parsedSkills = skillsText
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);

        router.put(
            `/team/${editingMember.id}`,
            {
                ...editForm.data,
                team_skills: parsedSkills,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setEditModalOpen(false);
                    setEditingMember(null);
                },
            }
        );
    };

    // Open Bulk Group Assignment Modal (Admin)
    const openGroupManageModal = (groupKey = 'soc') => {
        const targetGroup = groupKey === 'all' ? 'soc' : groupKey;
        setSelectedManageGroup(targetGroup);
        setGroupSearch('');
        const currentIds = members
            .filter((m) => Array.isArray(m.team_groups) && m.team_groups.includes(targetGroup))
            .map((m) => m.id);
        setSelectedUserIds(currentIds);
        setGroupManageModalOpen(true);
    };

    // Switch group tab inside Bulk Group Assignment Modal
    const handleSwitchManageGroup = (groupKey) => {
        setSelectedManageGroup(groupKey);
        const currentIds = members
            .filter((m) => Array.isArray(m.team_groups) && m.team_groups.includes(groupKey))
            .map((m) => m.id);
        setSelectedUserIds(currentIds);
    };

    const toggleUserInManageGroup = (userId) => {
        if (selectedUserIds.includes(userId)) {
            setSelectedUserIds(selectedUserIds.filter((id) => id !== userId));
        } else {
            setSelectedUserIds([...selectedUserIds, userId]);
        }
    };

    const handleSaveGroupAssignment = (e) => {
        e.preventDefault();
        setSavingGroupAssign(true);
        router.post(
            '/team/assign-group',
            {
                group_key: selectedManageGroup,
                user_ids: selectedUserIds,
            },
            {
                preserveScroll: true,
                onFinish: () => setSavingGroupAssign(false),
                onSuccess: () => setGroupManageModalOpen(false),
            }
        );
    };

    const activeGroupObj = groupDefinitions.find((g) => g.key === activeCategory);
    const manageGroupObj = groupDefinitions.find((g) => g.key === selectedManageGroup) || groupDefinitions[0];

    const filteredModalUsers = members.filter((m) => {
        const q = groupSearch.trim().toLowerCase();
        if (!q) return true;
        return (
            (m.name || '').toLowerCase().includes(q) ||
            (m.provider_id || '').toLowerCase().includes(q) ||
            (m.department || '').toLowerCase().includes(q) ||
            (m.position || '').toLowerCase().includes(q)
        );
    });

    return (
        <CtmrLayout title="Team Members" activeNav="team">
            {() => (
                <div className="space-y-6">
                    {/* HEADER BANNER */}
                    <div className="bg-white border border-[#D3DAE6] rounded-xl p-6 sm:p-8 shadow-2xs">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 text-[#006BB4] rounded-full text-xs font-semibold mb-2">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                                    </svg>
                                    ทีมปฏิบัติการความมั่นคงปลอดภัยสารสนเทศ สสจ.พิจิตร
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                    ทำเนียบบุคลากรและผู้รับผิดชอบระบบความปลอดภัยทางไซเบอร์
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                    รายชื่อวิศวกรความปลอดภัย นักวิชาการคอมพิวเตอร์ และผู้ประสานงานความมั่นคงปลอดภัยไซเบอร์ประจำโรงพยาบาลในจังหวัดพิจิตร (ดึงข้อมูลจากผู้ใช้งานในระบบ)
                                </p>
                            </div>

                            {/* Search Input & Admin Button */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
                                <div className="relative w-full sm:w-64">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="ค้นหาชื่อ, ตำแหน่ง หรือโรงพยาบาล..."
                                        className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]"
                                    />
                                    <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                </div>

                                {isAdmin && (
                                    <button
                                        type="button"
                                        onClick={() => openGroupManageModal(activeCategory === 'all' ? 'soc' : activeCategory)}
                                        className="px-4 py-2 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-bold rounded-lg shadow-2xs transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                                        </svg>
                                        <span>จัดผู้ใช้ลงแต่ละกลุ่มงาน</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Unit Filter Tabs (Red Box Section) */}
                        <div className="pt-6 border-t border-slate-200 mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveCategory('all')}
                                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer ${
                                        activeCategory === 'all'
                                            ? 'bg-[#006BB4] border-[#006BB4] text-white font-semibold shadow-2xs'
                                            : 'bg-white border-[#D3DAE6] text-slate-600 hover:border-[#006BB4]'
                                    }`}
                                >
                                    ทั้งหมด ({members.length} เจ้าหน้าที่)
                                </button>

                                {groupDefinitions.map((group) => {
                                    const count = getGroupCount(group.key);
                                    const isActive = activeCategory === group.key;
                                    return (
                                        <button
                                            key={group.key}
                                            type="button"
                                            onClick={() => setActiveCategory(group.key)}
                                            className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition cursor-pointer flex items-center gap-1.5 ${
                                                isActive
                                                    ? 'bg-[#006BB4] border-[#006BB4] text-white font-semibold shadow-2xs'
                                                    : 'bg-white border-[#D3DAE6] text-slate-600 hover:border-[#006BB4]'
                                            }`}
                                        >
                                            <span>{group.label}</span>
                                            <span
                                                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                                                    isActive
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-slate-100 text-slate-600'
                                                }`}
                                            >
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Contextual Admin Action when a specific group tab is selected */}
                            {isAdmin && activeCategory !== 'all' && activeGroupObj && (
                                <button
                                    type="button"
                                    onClick={() => openGroupManageModal(activeCategory)}
                                    className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#006BB4] border border-sky-200 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 self-start lg:self-auto shrink-0"
                                >
                                    <span>➕ จัดรายชื่อผู้รับผิดชอบในกลุ่ม "{activeGroupObj.label}"</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* EMPTY STATE */}
                    {filteredMembers.length === 0 ? (
                        <div className="bg-white border border-[#D3DAE6] rounded-xl p-10 text-center space-y-3">
                            <div className="text-base font-bold text-slate-700">
                                ไม่พบรายชื่อเจ้าหน้าที่ในหมวดหมู่นี้
                            </div>
                            <p className="text-xs text-slate-500">
                                {activeCategory !== 'all'
                                    ? 'ยังไม่มีผู้ใช้งานถูกจัดให้อยู่ในกลุ่มความรับผิดชอบนี้'
                                    : 'ไม่พบรายชื่อที่ตรงกับคำค้นหาของคุณ'}
                            </p>
                            {isAdmin && activeCategory !== 'all' && (
                                <button
                                    type="button"
                                    onClick={() => openGroupManageModal(activeCategory)}
                                    className="px-4 py-2 bg-[#006BB4] hover:bg-[#00528A] text-white text-xs font-bold rounded-lg transition cursor-pointer"
                                >
                                    ➕ เลือกผู้ใช้เข้ากลุ่ม {activeGroupObj?.label}
                                </button>
                            )}
                        </div>
                    ) : (
                        /* MEMBER CARDS GRID */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredMembers.map((member) => {
                                const memberGroups = Array.isArray(member.team_groups) ? member.team_groups : [];
                                return (
                                    <div
                                        key={member.id}
                                        className="bg-white border border-[#D3DAE6] hover:border-[#006BB4] rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                                    >
                                        <div className="space-y-3.5">
                                            {/* Avatar & Role Badge */}
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="relative">
                                                    <div
                                                        className={`w-14 h-14 rounded-full bg-gradient-to-tr ${member.avatarBg} text-white flex items-center justify-center font-bold text-lg shadow-sm`}
                                                    >
                                                        {member.initials}
                                                    </div>
                                                    <span
                                                        className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
                                                            member.is_active ? 'bg-emerald-500' : 'bg-slate-400'
                                                        }`}
                                                        title={member.is_active ? 'On Duty / ปฏิบัติหน้าที่ปกติ' : 'ระงับการใช้งานชั่วคราว'}
                                                    ></span>
                                                </div>

                                                <div className="flex flex-col items-end gap-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-[#006BB4] px-2 py-0.5 rounded">
                                                        {member.roleBadge}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-slate-400">
                                                        {member.provider_id}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Name, Position, Agency */}
                                            <div>
                                                <h3 className="font-bold text-slate-900 text-base leading-snug">
                                                    {member.name}
                                                </h3>
                                                <p className="text-xs text-[#006BB4] font-semibold mt-0.5">
                                                    {member.position}
                                                </p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    [{member.agency_code}] {member.department}
                                                </p>
                                            </div>

                                            {/* Assigned Group Badges */}
                                            <div className="space-y-1">
                                                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                                    กลุ่มภารกิจที่รับผิดชอบ:
                                                </div>
                                                {memberGroups.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {memberGroups.map((gKey) => {
                                                            const def = groupDefinitions.find((g) => g.key === gKey);
                                                            if (!def) return null;
                                                            return (
                                                                <span
                                                                    key={gKey}
                                                                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                                                                        GROUP_BADGE_STYLES[gKey] || 'bg-slate-100 text-slate-700 border-slate-200'
                                                                    }`}
                                                                >
                                                                    {def.shortLabel || def.label}
                                                                </span>
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <span className="inline-block text-[10px] text-slate-400 italic">
                                                        ยังไม่ได้กำหนดกลุ่มภารกิจหลัก
                                                    </span>
                                                )}
                                            </div>

                                            {/* Responsibilities Box */}
                                            <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
                                                <div className="font-semibold text-slate-700 text-[11px]">ภารกิจที่รับผิดชอบ:</div>
                                                <p className="text-[11px] leading-relaxed text-slate-500 line-clamp-3">
                                                    {member.responsibilities}
                                                </p>
                                            </div>

                                            {/* Skills Tags */}
                                            <div className="flex flex-wrap gap-1">
                                                {(member.skills || []).map((skill, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono"
                                                    >
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Contact & Action Buttons */}
                                        <div className="space-y-3 pt-3 border-t border-slate-100">
                                            <div className="text-xs space-y-1.5 text-slate-600">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 truncate">
                                                        <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                                                        </svg>
                                                        <span className="truncate">{member.phone}</span>
                                                    </div>

                                                    {/* Telegram / LINE Indicator */}
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <span
                                                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                                                member.has_telegram
                                                                    ? 'bg-sky-100 text-sky-700'
                                                                    : 'bg-slate-100 text-slate-400'
                                                            }`}
                                                            title={member.has_telegram ? 'เชื่อมต่อ Telegram แล้ว' : 'ยังไม่เชื่อมต่อ Telegram'}
                                                        >
                                                            TG
                                                        </span>
                                                        <span
                                                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                                                member.has_line
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : 'bg-slate-100 text-slate-400'
                                                            }`}
                                                            title={member.has_line ? 'เชื่อมต่อ LINE OA แล้ว' : 'ยังไม่เชื่อมต่อ LINE OA'}
                                                        >
                                                            LINE
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 truncate">
                                                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                                                    </svg>
                                                    <span className="font-mono text-[11px] truncate">{member.email}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => openProfile(member)}
                                                    className="flex-1 py-1.5 bg-slate-50 hover:bg-sky-50 text-[#006BB4] font-semibold text-xs rounded-lg border border-slate-200 hover:border-sky-300 transition cursor-pointer"
                                                >
                                                    ดูประวัติและโหนด
                                                </button>

                                                {isAdmin && (
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditMemberModal(member)}
                                                        className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-xs rounded-lg transition cursor-pointer shrink-0"
                                                        title="กำหนดกลุ่มงานและแก้ไขภารกิจของเจ้าหน้าที่"
                                                    >
                                                        ✏️ จัดกลุ่ม
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ==================== MODAL 1: PROFILE DETAIL MODAL ==================== */}
                    {profileModal.open && profileModal.member && (
                        <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                            <div className="bg-white rounded-xl border border-slate-200 shadow-xl max-w-xl w-full flex flex-col overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-3 h-3 rounded-full bg-[#006BB4]"></span>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-800">{profileModal.member.name}</h3>
                                            <div className="text-[11px] text-slate-500 font-mono">
                                                Provider ID: {profileModal.member.provider_id}
                                            </div>
                                        </div>
                                    </div>
                                    <button onClick={closeProfile} className="text-slate-400 hover:text-slate-600 p-1 rounded cursor-pointer">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                </div>

                                <div className="p-6 space-y-4 text-xs">
                                    <div>
                                        <div className="text-slate-400 text-[11px] font-semibold uppercase">ตำแหน่งหน้าที่ & หน่วยงาน</div>
                                        <div className="text-sm font-bold text-[#006BB4] mt-0.5">{profileModal.member.position}</div>
                                        <div className="text-xs text-slate-600">
                                            [{profileModal.member.agency_code}] {profileModal.member.department}
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-slate-400 text-[11px] font-semibold uppercase mb-1.5">กลุ่มงานที่รับผิดชอบ</div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(profileModal.member.team_groups || []).length > 0 ? (
                                                profileModal.member.team_groups.map((gKey) => {
                                                    const def = groupDefinitions.find((g) => g.key === gKey);
                                                    return (
                                                        <span
                                                            key={gKey}
                                                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                                                                GROUP_BADGE_STYLES[gKey] || 'bg-slate-100 text-slate-700'
                                                            }`}
                                                        >
                                                            {def ? def.label : gKey}
                                                        </span>
                                                    );
                                                })
                                            ) : (
                                                <span className="text-slate-400 italic">ยังไม่ได้กำหนดกลุ่มงานหลัก</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-2">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500 shrink-0">โหนดโรงพยาบาลที่กำกับดูแล:</span>
                                            <span className="font-semibold text-slate-800 text-right">{profileModal.member.nodes}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500 shrink-0">เบอร์โทรศัพท์ติดต่อ:</span>
                                            <span className="font-mono text-slate-700 font-semibold">{profileModal.member.phone}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500 shrink-0">อีเมลทางราชการ:</span>
                                            <span className="font-mono text-slate-700">{profileModal.member.email}</span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-slate-500 shrink-0">สถานะความพร้อม:</span>
                                            <span className="font-semibold text-emerald-600 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> พร้อมปฏิบัติงาน (Active On Duty)
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-slate-400 text-[11px] font-semibold uppercase mb-1">ขอบข่ายความรับผิดชอบเชิงลึก</div>
                                        <p className="text-slate-600 leading-relaxed bg-white border border-slate-200 p-3 rounded-lg">
                                            {profileModal.member.detail}
                                        </p>
                                    </div>
                                </div>

                                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center gap-2">
                                    {isAdmin ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const m = profileModal.member;
                                                closeProfile();
                                                openEditMemberModal(m);
                                            }}
                                            className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold rounded-lg cursor-pointer"
                                        >
                                            ✏️ แก้ไขกลุ่มงานและภารกิจ
                                        </button>
                                    ) : (
                                        <div />
                                    )}
                                    <button
                                        type="button"
                                        onClick={closeProfile}
                                        className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                                    >
                                        ปิดหน้าต่าง
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ==================== MODAL 2 (ADMIN): EDIT INDIVIDUAL USER'S GROUPS & DETAILS ==================== */}
                    {isAdmin && editModalOpen && editingMember && (
                        <div className="fixed inset-0 z-[2100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-[#0B2545] to-[#006BB4] text-white flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-bold">
                                            ✏️ กำหนดกลุ่มความรับผิดชอบและภารกิจ: {editingMember.name}
                                        </h3>
                                        <p className="text-xs text-sky-200 mt-0.5">
                                            Provider ID: {editingMember.provider_id} • สังกัด [{editingMember.agency_code}] {editingMember.department}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setEditModalOpen(false)}
                                        className="text-sky-200 hover:text-white p-1 cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleSaveMemberEdit} className="p-6 overflow-y-auto space-y-4 text-xs">
                                    {/* Group Checkboxes */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-800">
                                            เลือกกลุ่มภารกิจที่รับผิดชอบ (สามารถเลือกได้มากกว่า 1 กลุ่ม)
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                            {groupDefinitions.map((group) => {
                                                const checked = (editForm.data.team_groups || []).includes(group.key);
                                                return (
                                                    <label
                                                        key={group.key}
                                                        className={`flex items-start gap-2.5 p-3 rounded-lg border transition cursor-pointer ${
                                                            checked
                                                                ? 'bg-sky-50/80 border-[#006BB4] ring-1 ring-[#006BB4]'
                                                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={checked}
                                                            onChange={() => toggleEditFormGroup(group.key)}
                                                            className="mt-0.5 w-4 h-4 text-[#006BB4] rounded border-slate-300 focus:ring-[#006BB4]"
                                                        />
                                                        <div>
                                                            <div className="font-bold text-slate-800">{group.label}</div>
                                                            <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                                                                {group.description}
                                                            </div>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                ป้ายบทบาทมุมขวาบนการ์ด (Role Badge)
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.data.team_role_badge}
                                                onChange={(e) => editForm.setData('team_role_badge', e.target.value)}
                                                placeholder="เช่น Team Lead, SOC Lead, Network Eng, DPO Officer"
                                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                ตำแหน่งงาน (Position)
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.data.position}
                                                onChange={(e) => editForm.setData('position', e.target.value)}
                                                placeholder="เช่น นักวิชาการคอมพิวเตอร์ปฏิบัติการ"
                                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                โหนดโรงพยาบาลที่รับผิดชอบดูแล (Assigned Nodes)
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.data.team_nodes}
                                                onChange={(e) => editForm.setData('team_nodes', e.target.value)}
                                                placeholder="เช่น รพ.พิจิตร, รพ.โพทะเล (Agent 001-005)"
                                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                                เบอร์โทรศัพท์ติดต่อ
                                            </label>
                                            <input
                                                type="text"
                                                value={editForm.data.phone}
                                                onChange={(e) => editForm.setData('phone', e.target.value)}
                                                placeholder="เช่น 056-611-131 ต่อ 101"
                                                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            ภารกิจและขอบข่ายความรับผิดชอบ (Responsibilities)
                                        </label>
                                        <textarea
                                            rows={3}
                                            value={editForm.data.team_responsibilities}
                                            onChange={(e) => editForm.setData('team_responsibilities', e.target.value)}
                                            placeholder="ระบุรายละเอียดภารกิจที่รับผิดชอบ..."
                                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                                            ทักษะความเชี่ยวชาญ / ใบรับรอง (คั่นด้วยเครื่องหมายจุลภาค `,`)
                                        </label>
                                        <input
                                            type="text"
                                            value={skillsText}
                                            onChange={(e) => setSkillsText(e.target.value)}
                                            placeholder="เช่น CISSP, Wazuh Admin, Fortinet NSE, HOSxP DBA"
                                            className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]"
                                        />
                                    </div>

                                    <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setEditModalOpen(false)}
                                            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
                                        >
                                            ยกเลิก
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2 bg-[#006BB4] hover:bg-[#00528A] text-white font-bold rounded-lg shadow-xs cursor-pointer"
                                        >
                                            💾 บันทึกการจัดกลุ่มและข้อมูล
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* ==================== MODAL 3 (ADMIN): BULK ASSIGN USERS TO EACH GROUP ==================== */}
                    {isAdmin && groupManageModalOpen && (
                        <div className="fixed inset-0 z-[2100] bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
                            <div className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                                <div className="px-6 py-4 bg-gradient-to-r from-[#0B2545] via-[#134074] to-[#006BB4] text-white flex items-center justify-between">
                                    <div>
                                        <h3 className="text-base font-bold">
                                            ⚙️ จัดผู้ใช้งานรับผิดชอบในแต่ละกลุ่มภารกิจ (Assign Users to Team Groups)
                                        </h3>
                                        <p className="text-xs text-sky-200 mt-0.5">
                                            เลือกกลุ่มภารกิจด้านล่าง แล้วติ๊กเลือกผู้ใช้งานที่ต้องการให้รับผิดชอบในกลุ่มนั้น
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setGroupManageModalOpen(false)}
                                        className="text-sky-200 hover:text-white p-1 cursor-pointer"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleSaveGroupAssignment} className="p-6 flex-1 overflow-y-auto space-y-4 text-xs flex flex-col">
                                    {/* Group Selector Tabs */}
                                    <div className="space-y-1.5">
                                        <label className="block font-bold text-slate-700">
                                            1. เลือกกลุ่มภารกิจที่ต้องการจัดผู้รับผิดชอบ:
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {groupDefinitions.map((group) => {
                                                const active = selectedManageGroup === group.key;
                                                return (
                                                    <button
                                                        key={group.key}
                                                        type="button"
                                                        onClick={() => handleSwitchManageGroup(group.key)}
                                                        className={`p-3 rounded-lg border text-left transition cursor-pointer flex items-center justify-between ${
                                                            active
                                                                ? 'bg-[#006BB4] border-[#006BB4] text-white font-bold shadow-2xs'
                                                                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <div>
                                                            <div className="text-xs font-bold">{group.label}</div>
                                                            <div className={`text-[10px] mt-0.5 ${active ? 'text-sky-100' : 'text-slate-500'}`}>
                                                                ปัจจุบันมี {getGroupCount(group.key)} คน
                                                            </div>
                                                        </div>
                                                        {active && (
                                                            <span className="px-2 py-0.5 rounded bg-white/20 text-[10px]">
                                                                กำลังเลือก
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* User Selection List */}
                                    <div className="space-y-2 flex-1 flex flex-col min-h-0">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                            <label className="font-bold text-slate-700">
                                                2. เลือกผู้ใช้งานเข้ากลุ่ม <span className="text-[#006BB4]">"{manageGroupObj?.label}"</span> (เลือกแล้ว {selectedUserIds.length} คน):
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedUserIds(members.map((m) => m.id))}
                                                    className="text-[11px] text-[#006BB4] font-semibold hover:underline cursor-pointer"
                                                >
                                                    เลือกทั้งหมด
                                                </button>
                                                <span className="text-slate-300">|</span>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedUserIds([])}
                                                    className="text-[11px] text-rose-600 font-semibold hover:underline cursor-pointer"
                                                >
                                                    ล้างที่เลือก
                                                </button>
                                            </div>
                                        </div>

                                        <input
                                            type="text"
                                            value={groupSearch}
                                            onChange={(e) => setGroupSearch(e.target.value)}
                                            placeholder="ค้นหาชื่อผู้ใช้งาน, Provider ID หรือโรงพยาบาล..."
                                            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BB4]"
                                        />

                                        <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-72 overflow-y-auto">
                                            {filteredModalUsers.map((user) => {
                                                const isChecked = selectedUserIds.includes(user.id);
                                                return (
                                                    <label
                                                        key={user.id}
                                                        className={`px-3.5 py-2.5 flex items-center justify-between gap-3 cursor-pointer transition ${
                                                            isChecked ? 'bg-sky-50/70' : 'hover:bg-slate-50'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-3 min-w-0">
                                                            <input
                                                                type="checkbox"
                                                                checked={isChecked}
                                                                onChange={() => toggleUserInManageGroup(user.id)}
                                                                className="w-4 h-4 text-[#006BB4] rounded border-slate-300 focus:ring-[#006BB4]"
                                                            />
                                                            <div
                                                                className={`w-8 h-8 rounded-full bg-gradient-to-tr ${user.avatarBg} text-white flex items-center justify-center font-bold text-xs shrink-0`}
                                                            >
                                                                {user.initials}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-bold text-slate-800 truncate">
                                                                    {user.name}{' '}
                                                                    <span className="font-mono text-[11px] font-normal text-slate-500">
                                                                        ({user.provider_id})
                                                                    </span>
                                                                </div>
                                                                <div className="text-[11px] text-slate-500 truncate">
                                                                    {user.position} • [{user.agency_code}] {user.department}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-1 shrink-0">
                                                            {(user.team_groups || []).map((gKey) => {
                                                                const def = groupDefinitions.find((g) => g.key === gKey);
                                                                return (
                                                                    <span
                                                                        key={gKey}
                                                                        className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border ${
                                                                            GROUP_BADGE_STYLES[gKey] || 'bg-slate-100 text-slate-600'
                                                                        }`}
                                                                    >
                                                                        {def?.shortLabel || gKey}
                                                                    </span>
                                                                );
                                                            })}
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-slate-200 flex items-center justify-between gap-2">
                                        <span className="text-[11px] text-slate-500">
                                            คลิกบันทึกเพื่ออัปเดตรายชื่อผู้รับผิดชอบในกลุ่ม "{manageGroupObj?.label}"
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setGroupManageModalOpen(false)}
                                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg cursor-pointer"
                                            >
                                                ปิด
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={savingGroupAssign}
                                                className="px-5 py-2 bg-[#006BB4] hover:bg-[#00528A] text-white font-bold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
                                            >
                                                {savingGroupAssign
                                                    ? 'กำลังบันทึก...'
                                                    : `💾 บันทึกผู้รับผิดชอบกลุ่ม ${manageGroupObj?.shortLabel}`}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </CtmrLayout>
    );
}
