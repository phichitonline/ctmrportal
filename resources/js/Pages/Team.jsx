import React, { useState } from 'react';
import CtmrLayout from '@/Layouts/CtmrLayout';

const DEFAULT_MEMBERS = [
    {
        id: 1,
        name: 'นายณฐพงศ์ ครุฑเทศ',
        position: 'หัวหน้าศูนย์เทคโนโลยีสารสนเทศ (CISO)',
        department: 'กลุ่มงานพัฒนายุทธศาสตร์สาธารณสุข สสจ.พิจิตร',
        category: 'soc network',
        roleBadge: 'Team Lead',
        initials: 'ณพ',
        avatarBg: 'from-[#006BB4] to-sky-400',
        responsibilities: 'กำกับดูแลสถาปัตยกรรมความปลอดภัยไซเบอร์ระดับจังหวัด, นโยบายตอบสนองเหตุฉุกเฉิน (Incident Commander), ประสานงาน สกมช.',
        skills: ['CISSP', 'Wazuh Admin', 'Incident Cmd'],
        phone: '056-611-131 ต่อ 101',
        email: 'nathaphong.k@ppho.go.th',
        nodes: 'สสจ.พิจิตร (Agent 001 - 002)',
        detail: 'กำกับดูแลระบบรักษาความมั่นคงปลอดภัยไซเบอร์ทั้งหมดในจังหวัดพิจิตร ประสานงานศูนย์ประสานการรักษาความมั่นคงปลอดภัยระบบคอมพิวเตอร์แห่งชาติ (NCSA) และขับเคลื่อนเกณฑ์ความปลอดภัยโรงพยาบาลอัจฉริยะ',
    },
    {
        id: 2,
        name: 'นายกิตติศักดิ์ สุขเจริญ',
        position: 'วิศวกรความมั่นคงปลอดภัยไซเบอร์ (SOC Lead)',
        department: 'ศูนย์ปฏิบัติการความมั่นคงปลอดภัย สสจ.พิจิตร',
        category: 'soc',
        roleBadge: 'SOC Lead',
        initials: 'กศ',
        avatarBg: 'from-emerald-600 to-teal-400',
        responsibilities: 'มอนิเตอร์เหตุการณ์ Wazuh SIEM 24 ชม., วิเคราะห์ภัยคุกคาม Threat Hunting, คัดกรอง False Positive และจัดการ Alert ระดับสูง',
        skills: ['CompTIA Sec+', 'Threat Hunting', 'OpenSearch'],
        phone: '056-611-131 ต่อ 104',
        email: 'kittisak.s@ppho.go.th',
        nodes: 'รพ.พิจิตร, รพ.โพทะเล, รพ.บางมูลนาก',
        detail: 'ดูแลระบบเฝ้าระวังความปลอดภัยไซเบอร์ การวิเคราะห์พฤติกรรมมัลแวร์ การเฝ้าระวัง Log แม่ข่ายโรงพยาบาลพิจิตร และโรงพยาบาลโซนใต้ของจังหวัด',
    },
    {
        id: 3,
        name: 'นายอนุภาพ มงคลชัย',
        position: 'วิศวกรเครือข่ายและความมั่นคงระบบ (Network Admin)',
        department: 'ศูนย์เทคโนโลยีสารสนเทศ สสจ.พิจิตร',
        category: 'network',
        roleBadge: 'Network Eng',
        initials: 'อพ',
        avatarBg: 'from-purple-600 to-indigo-400',
        responsibilities: 'ดูแล Firewall จังหวัด, วง VPN ระหว่างโรงพยาบาล, ระบบป้องกัน DDoS, การทำ Network Segmentation แยกวงผู้ป่วยและระบบ HIS',
        skills: ['CCNA', 'Fortinet NSE', 'VPN/VLAN'],
        phone: '056-611-131 ต่อ 105',
        email: 'anuparp.m@ppho.go.th',
        nodes: 'เครือข่ายเชื่อมต่อ 12 รพ. และวง VPN สาธารณสุข',
        detail: 'ดูแลระบบเครือข่ายส่วนกลาง การตั้งค่าไฟร์วอลล์ สวิตช์ และการตรวจวัดทราฟฟิกผิดปกติเข้าออกหน่วยบริการสาธารณสุขพิจิตร',
    },
    {
        id: 4,
        name: 'น.ส.วรัญญา ธนสิทธิ์',
        position: 'นักวิชาการคอมพิวเตอร์ (HIS & Database Sec)',
        department: 'กลุ่มงานพัฒนายุทธศาสตร์ สสจ.พิจิตร',
        category: 'his',
        roleBadge: 'Database Sec',
        initials: 'วร',
        avatarBg: 'from-amber-600 to-orange-400',
        responsibilities: 'ดูแลความมั่นคงปลอดภัยฐานข้อมูล MySQL/PostgreSQL สำหรับ HOSxP และ JHCIS, เฝ้าระวัง SQL Injection, สำรองข้อมูลแบบ Immutable',
        skills: ['HOSxP Cert', 'MySQL DBA', 'Backup Sec'],
        phone: '056-611-131 ต่อ 106',
        email: 'waranya.t@ppho.go.th',
        nodes: 'รพ.สมเด็จพระยุพราชตะพานหิน, รพ.ทับคล้อ, รพ.วังทรายพูน',
        detail: 'ดูแลระบบความปลอดภัยฐานข้อมูลผู้ป่วย HOSxP การเข้ารหัสข้อมูลเวชระเบียน (Encryption at rest) และการตรวจสอบความสมบูรณ์ของไฟล์สำรองข้อมูล',
    },
    {
        id: 5,
        name: 'นางภัทราพร ศิริวัฒน์',
        position: 'เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO / PDPA)',
        department: 'กลุ่มงานนิติการและพัฒนายุทธศาสตร์ สสจ.พิจิตร',
        category: 'pdpa',
        roleBadge: 'DPO Officer',
        initials: 'ภค',
        avatarBg: 'from-rose-600 to-pink-400',
        responsibilities: 'กำกับดูแลการปฏิบัติตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA), นโยบายการเข้าถึงเวชระเบียน, ตรวจสอบสิทธิผู้ใช้งาน (Access Control Audit)',
        skills: ['DPO Certified', 'PDPA Audit', 'Data Privacy'],
        phone: '056-611-131 ต่อ 108',
        email: 'pattaraporn.s@ppho.go.th',
        nodes: 'โรงพยาบาลและ รพ.สต. ทุกแห่งในพิจิตร',
        detail: 'ดูแลด้านกฎหมายคุ้มครองข้อมูลสุขภาพและข้อมูลส่วนบุคคล ตรวจสอบบันทึกการประมวลผลข้อมูล (ROPA) และให้คำปรึกษาการส่งต่อข้อมูลเวชระเบียนอิเล็กทรอนิกส์',
    },
    {
        id: 6,
        name: 'นายธนดล วาณิชย์กุล',
        position: 'นักวิชาการคอมพิวเตอร์ (Endpoint & Vulnerability)',
        department: 'ศูนย์เทคโนโลยีสารสนเทศ สสจ.พิจิตร',
        category: 'soc',
        roleBadge: 'Endpoint Sec',
        initials: 'ธน',
        avatarBg: 'from-cyan-600 to-blue-400',
        responsibilities: 'ติดตั้งและดูแล Wazuh Agent ใน 613 โหนด, สแกนช่องโหว่ซอฟต์แวร์ (CVE Scanning), ตรวจสอบความปลอดภัยเครื่องลูกข่ายห้องฉุกเฉินและ OPD',
        skills: ['EDR Expert', 'CVE Analyst', 'Patch Mgmt'],
        phone: '056-611-131 ต่อ 107',
        email: 'thanadol.w@ppho.go.th',
        nodes: 'รพ.สามง่าม, รพ.โพธิ์ประทับช้าง, รพ.วชิรบารมี',
        detail: 'รับผิดชอบการติดตั้งและบำรุงรักษา Agent ตรวจสอบช่องโหว่ความปลอดภัยระดับโฮสต์ การอัปเดตระบบปฏิบัติการ และทดสอบการบุกรุกเครื่องลูกข่าย',
    },
    {
        id: 7,
        name: 'นายสรวิชญ์ เกียรติไพบูลย์',
        position: 'ผู้ดูแลระบบคลาวด์และศูนย์ข้อมูล (HDC & Cloud Admin)',
        department: 'ศูนย์ข้อมูล HDC สำนักงานสาธารณสุขจังหวัดพิจิตร',
        category: 'network',
        roleBadge: 'Cloud / HDC',
        initials: 'สร',
        avatarBg: 'from-blue-700 to-sky-500',
        responsibilities: 'บริหารจัดการระบบคลาวด์ HDC พิจิตร, Docker Container Microservices, API Gateway ข้อมูลสุขภาพ, การทำ Hardening บน Rocky Linux',
        skills: ['Docker Certified', 'Linux Hardening', 'API Sec'],
        phone: '056-611-131 ต่อ 109',
        email: 'sorawit.k@ppho.go.th',
        nodes: 'ศูนย์ข้อมูล HDC พิจิตร และคลาวด์สาธารณสุข',
        detail: 'บริหารจัดการศูนย์ข้อมูลสาธารณสุขจังหวัดพิจิตร (HDC) ความมั่นคงปลอดภัยของ Docker Container, Web API และการแลกเปลี่ยนข้อมูลตามเกณฑ์มาตรฐานความปลอดภัย',
    },
    {
        id: 8,
        name: 'น.ส.ปนัดดา พรหมมา',
        position: 'นักวิชาการสาธารณสุข (ผู้ประสานงาน MIS เครือข่าย รพช.)',
        department: 'กลุ่มงานพัฒนายุทธศาสตร์ สสจ.พิจิตร',
        category: 'his soc',
        roleBadge: 'Hospital Liaison',
        initials: 'ปน',
        avatarBg: 'from-teal-600 to-emerald-400',
        responsibilities: 'ประสานงานทีม MIS Admin โรงพยาบาลชุมชนและ รพ.สต. ทั้งจังหวัด, จัดทำแบบประเมิน Cyber Hygiene, จัดอบรมความตระหนักรู้ (Awareness)',
        skills: ['Cyber Hygiene', 'Hospital MIS', 'Awareness'],
        phone: '056-611-131 ต่อ 110',
        email: 'panadda.p@ppho.go.th',
        nodes: 'รพ.สากเหล็ก, รพ.บึงนาราง, รพ.ดงเจริญ',
        detail: 'ประสานงานการขับเคลื่อนความปลอดภัยไซเบอร์กับโรงพยาบาลชุมชนและ รพ.สต. การจัดอบรมสร้างความตระหนักรู้ด้าน Phishing และการป้องกันข้อมูลรั่วไหล',
    },
];

export default function Team({ members = DEFAULT_MEMBERS }) {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [profileModal, setProfileModal] = useState({ open: false, member: null });

    const filteredMembers = members.filter((member) => {
        const matchesCategory = activeCategory === 'all' || member.category.includes(activeCategory);
        const matchesQuery =
            !searchQuery ||
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.nodes.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
    });

    const openProfile = (member) => {
        setProfileModal({ open: true, member });
    };

    const closeProfile = () => {
        setProfileModal({ open: false, member: null });
    };

    return (
        <CtmrLayout title="Team Members" activeNav="team">
            {() => (
                <div className="space-y-6">
                    {/* HEADER BANNER */}
                    <div className="bg-white border border-[#D3DAE6] rounded-md p-6 sm:p-8 shadow-xs">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 text-[#006BB4] rounded-full text-xs font-semibold mb-2">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                    ทีมปฏิบัติการความมั่นคงปลอดภัยสารสนเทศ สสจ.พิจิตร
                                </div>
                                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                                    ทำเนียบบุคลากรและผู้รับผิดชอบระบบความปลอดภัยทางไซเบอร์
                                </h1>
                                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                                    รายชื่อวิศวกรความปลอดภัย นักวิชาการคอมพิวเตอร์ และผู้ประสานงานความมั่นคงปลอดภัยไซเบอร์ประจำโรงพยาบาลในจังหวัดพิจิตร
                                </p>
                            </div>

                            {/* Search Input */}
                            <div className="w-full md:w-72">
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="ค้นหาชื่อ, ตำแหน่ง หรือโรงพยาบาล..."
                                        className="w-full bg-slate-50 border border-slate-300 rounded-md pl-9 pr-3 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#006BB4]"
                                    />
                                    <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                                </div>
                            </div>
                        </div>

                        {/* Unit Filter Tabs */}
                        <div className="flex flex-wrap gap-2 pt-6 border-t border-slate-200 mt-6">
                            <button
                                onClick={() => setActiveCategory('all')}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
                                    activeCategory === 'all'
                                        ? 'bg-[#006BB4] border-[#006BB4] text-white font-semibold'
                                        : 'bg-white border-[#D3DAE6] text-slate-600 hover:border-[#006BB4]'
                                }`}
                            >
                                ทั้งหมด ({members.length} เจ้าหน้าที่)
                            </button>
                            <button
                                onClick={() => setActiveCategory('soc')}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
                                    activeCategory === 'soc'
                                        ? 'bg-[#006BB4] border-[#006BB4] text-white font-semibold'
                                        : 'bg-white border-[#D3DAE6] text-slate-600 hover:border-[#006BB4]'
                                }`}
                            >
                                SOC & Threat Detection
                            </button>
                            <button
                                onClick={() => setActiveCategory('network')}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
                                    activeCategory === 'network'
                                        ? 'bg-[#006BB4] border-[#006BB4] text-white font-semibold'
                                        : 'bg-white border-[#D3DAE6] text-slate-600 hover:border-[#006BB4]'
                                }`}
                            >
                                Network & Infrastructure
                            </button>
                            <button
                                onClick={() => setActiveCategory('his')}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
                                    activeCategory === 'his'
                                        ? 'bg-[#006BB4] border-[#006BB4] text-white font-semibold'
                                        : 'bg-white border-[#D3DAE6] text-slate-600 hover:border-[#006BB4]'
                                }`}
                            >
                                HOSxP / Database Security
                            </button>
                            <button
                                onClick={() => setActiveCategory('pdpa')}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition ${
                                    activeCategory === 'pdpa'
                                        ? 'bg-[#006BB4] border-[#006BB4] text-white font-semibold'
                                        : 'bg-white border-[#D3DAE6] text-slate-600 hover:border-[#006BB4]'
                                }`}
                            >
                                PDPA & Compliance
                            </button>
                        </div>
                    </div>

                    {/* MEMBER CARDS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredMembers.map((member) => (
                            <div
                                key={member.id}
                                className="bg-white border border-[#D3DAE6] hover:border-[#006BB4] rounded-lg p-5 space-y-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="relative">
                                        <div
                                            className={`w-14 h-14 rounded-full bg-gradient-to-tr ${member.avatarBg} text-white flex items-center justify-center font-bold text-lg shadow-sm`}
                                        >
                                            {member.initials}
                                        </div>
                                        <span
                                            className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white"
                                            title="On Duty / ปฏิบัติหน้าที่ปกติ"
                                        ></span>
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-100 text-[#006BB4] px-2 py-0.5 rounded">
                                        {member.roleBadge}
                                    </span>
                                </div>

                                <div>
                                    <h3 className="font-bold text-slate-900 text-base">{member.name}</h3>
                                    <p className="text-xs text-[#006BB4] font-semibold">{member.position}</p>
                                    <p className="text-[11px] text-slate-500">{member.department}</p>
                                </div>

                                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded border border-slate-100 space-y-1">
                                    <div className="font-medium text-slate-700">ภารกิจที่รับผิดชอบ:</div>
                                    <p className="text-[11px] leading-relaxed text-slate-500">{member.responsibilities}</p>
                                </div>

                                <div className="flex flex-wrap gap-1">
                                    {member.skills.map((skill, idx) => (
                                        <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                                            {skill}
                                        </span>
                                    ))}
                                </div>

                                <div className="pt-3 border-t border-slate-100 text-xs space-y-1.5 text-slate-600">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                        <span>{member.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 truncate">
                                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                        <span className="font-mono text-[11px] truncate">{member.email}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => openProfile(member)}
                                    className="w-full py-1.5 bg-slate-50 hover:bg-sky-50 text-[#006BB4] font-semibold text-xs rounded border border-slate-200 hover:border-sky-300 transition"
                                >
                                    ดูประวัติและโหนดที่รับผิดชอบ
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* PROFILE DETAIL MODAL */}
                    {profileModal.open && profileModal.member && (
                        <div className="fixed inset-0 z-[2000] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
                            <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-xl w-full flex flex-col overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                                    <div className="flex items-center gap-2">
                                        <span className="w-3 h-3 rounded-full bg-[#006BB4]"></span>
                                        <h3 className="text-base font-bold text-slate-800">{profileModal.member.name}</h3>
                                    </div>
                                    <button onClick={closeProfile} className="text-slate-400 hover:text-slate-600 p-1 rounded">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                    </button>
                                </div>

                                <div className="p-6 space-y-4 text-xs">
                                    <div>
                                        <div className="text-slate-400 text-[11px] font-semibold uppercase">ตำแหน่งหน้าที่</div>
                                        <div className="text-sm font-bold text-[#006BB4] mt-0.5">{profileModal.member.position}</div>
                                    </div>

                                    <div className="bg-slate-50 border border-slate-200 rounded p-3 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">โหนดโรงพยาบาลที่กำกับดูแล:</span>
                                            <span className="font-semibold text-slate-800 text-right">{profileModal.member.nodes}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">เบอร์โทรศัพท์โต๊ะทำงาน:</span>
                                            <span className="font-mono text-slate-700 font-semibold">{profileModal.member.phone}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">อีเมลทางราชการ:</span>
                                            <span className="font-mono text-slate-700">{profileModal.member.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-500">สถานะความพร้อม:</span>
                                            <span className="font-semibold text-emerald-600 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> พร้อมปฏิบัติงาน (Active On Duty)
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-slate-400 text-[11px] font-semibold uppercase mb-1">ขอบข่ายความรับผิดชอบเชิงลึก</div>
                                        <p className="text-slate-600 leading-relaxed bg-white border border-slate-200 p-3 rounded">
                                            {profileModal.member.detail}
                                        </p>
                                    </div>
                                </div>

                                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                                    <button
                                        onClick={closeProfile}
                                        className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded"
                                    >
                                        ปิดหน้าต่าง
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </CtmrLayout>
    );
}
