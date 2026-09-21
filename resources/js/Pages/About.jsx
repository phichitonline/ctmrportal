import React from 'react';
import { Link } from '@inertiajs/react';
import CtmrLayout from '@/Layouts/CtmrLayout';

export default function About({
    stats = { nodes: 613, hospitals: 12, availability: '99.9%', sla: '< 15 นาที' }
}) {
    return (
        <CtmrLayout title="About Team" activeNav="about">
            {({ openModule }) => (
                <div className="space-y-6">
                    {/* HERO BANNER CARD */}
                    <div className="bg-white border border-[#D3DAE6] rounded-md p-6 sm:p-8 bg-gradient-to-r from-white via-white to-sky-50/60 overflow-hidden shadow-xs">
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                            <div className="space-y-3 max-w-3xl">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100/80 border border-sky-200 text-[#006BB4] rounded-full text-xs font-semibold">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                                    ศูนย์ปฏิบัติการความมั่นคงปลอดภัยไซเบอร์ (CSOC) สสจ.พิจิตร
                                </div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-snug">
                                    ทีมบริหารจัดการความมั่นคงปลอดภัยสารสนเทศและไซเบอร์ (MIS Cyber Security Admin)
                                </h1>
                                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                                    หน่วยงานภายใต้กลุ่มงานพัฒนายุทธศาสตร์สาธารณสุขและเทคโนโลยีสารสนเทศ สำนักงานสาธารณสุขจังหวัดพิจิตร 
                                    รับผิดชอบการเฝ้าระวัง ตรวจจับ ป้องกัน และตอบสนองต่อภัยคุกคามทางไซเบอร์ที่อาจส่งผลกระทบต่อระบบบริการสุขภาพและข้อมูลเวชระเบียนผู้ป่วยของโรงพยาบาลทุกแห่งในจังหวัดพิจิตร
                                </p>
                                <div className="flex flex-wrap gap-4 pt-2">
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-2xs">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        เฝ้าระวัง 24/7 SIEM & EDR
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-2xs">
                                        <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                                        ครอบคลุม 12 รพ. + 120 รพ.สต.
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-2xs">
                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                                        มาตรฐาน พ.ร.บ. ไซเบอร์ & PDPA
                                    </div>
                                </div>
                            </div>

                            {/* Stats summary badge block */}
                            <div className="grid grid-cols-2 gap-3 w-full lg:w-auto flex-shrink-0">
                                <div className="bg-white border border-slate-200 rounded-lg p-4 text-center shadow-2xs">
                                    <div className="text-2xl font-bold text-[#006BB4]">{stats.nodes}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">เครื่องแม่ข่าย & ลูกข่าย</div>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-lg p-4 text-center shadow-2xs">
                                    <div className="text-2xl font-bold text-emerald-600">{stats.hospitals}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">โรงพยาบาลในเครือข่าย</div>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-lg p-4 text-center shadow-2xs">
                                    <div className="text-2xl font-bold text-amber-600">{stats.availability}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">System Availability</div>
                                </div>
                                <div className="bg-white border border-slate-200 rounded-lg p-4 text-center shadow-2xs">
                                    <div className="text-2xl font-bold text-purple-600">{stats.sla}</div>
                                    <div className="text-xs text-slate-500 mt-0.5">Incident Response SLA</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3 KEY PILLARS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* 1: ภารกิจหลัก */}
                        <div className="bg-white border border-[#D3DAE6] rounded-md p-6 pt-7 relative shadow-xs">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-[#D3DAE6] rounded-full px-4 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap shadow-2xs">
                                MISSION & OBJECTIVES
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-sky-100 text-[#006BB4] flex items-center justify-center font-bold">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                </div>
                                <h3 className="font-bold text-slate-800 text-base">วิสัยทัศน์และภารกิจหลัก</h3>
                            </div>
                            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    <span>ปกป้องระบบสารสนเทศโรงพยาบาล (HIS/HOSxP) และฐานข้อมูล HDC พิจิตร ให้มีความปลอดภัยและพร้อมให้บริการต่อเนื่อง</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    <span>ป้องกันการรั่วไหลของข้อมูลเวชระเบียนและข้อมูลสุขภาพส่วนบุคคลของผู้ป่วย (PDPA & HIPAA Compliance)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    <span>ตรวจจับและยับยั้งมัลแวร์เรียกค่าไถ่ (Ransomware) และการโจมตีทางไซเบอร์ในทุกจุดเชื่อมต่อ</span>
                                </li>
                            </ul>
                        </div>

                        {/* 2: ขอบเขตงานรับผิดชอบ */}
                        <div className="bg-white border border-[#D3DAE6] rounded-md p-6 pt-7 relative shadow-xs">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-[#D3DAE6] rounded-full px-4 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap shadow-2xs">
                                OPERATIONAL SCOPE
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                                </div>
                                <h3 className="font-bold text-slate-800 text-base">ขอบเขตงานรับผิดชอบ</h3>
                            </div>
                            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    <span><strong>แม่ข่ายและศูนย์ข้อมูล:</strong> PPHO Data Center, Health Cloud Server, Virtual Machines, Docker Containers</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    <span><strong>เครือข่ายโรงพยาบาล:</strong> รพ.พิจิตร, รพ.สมเด็จพระยุพราชตะพานหิน และ รพช. อีก 10 แห่ง รวมถึง รพ.สต. ในสังกัด</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <svg className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    <span><strong>ระบบบริหารจัดการ:</strong> Wazuh Security Platform, OpenSearch SIEM, Active Directory, Firewalls และ VPN Gateway</span>
                                </li>
                            </ul>
                        </div>

                        {/* 3: กรอบมาตรฐานสากล */}
                        <div className="bg-white border border-[#D3DAE6] rounded-md p-6 pt-7 relative shadow-xs">
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-[#D3DAE6] rounded-full px-4 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap shadow-2xs">
                                COMPLIANCE & STANDARDS
                            </div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                                </div>
                                <h3 className="font-bold text-slate-800 text-base">กรอบมาตรฐานการกำกับดูแล</h3>
                            </div>
                            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                                <li className="flex items-start gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">CII</span>
                                    <span>พ.ร.บ. การรักษาความมั่นคงปลอดภัยไซเบอร์ พ.ศ. 2562 (หน่วยงานโครงสร้างพื้นฐานสำคัญทางสารสนเทศ)</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">PDPA</span>
                                    <span>พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 มาตรการรักษาความมั่นคงปลอดภัยข้อมูลสุขภาพ</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[11px] font-semibold">NIST</span>
                                    <span>NIST Cybersecurity Framework (CSF) & CIS Critical Security Controls v8</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* INCIDENT RESPONSE WORKFLOW */}
                    <div className="bg-white border border-[#D3DAE6] rounded-md p-6 pt-7 relative shadow-xs">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-[#D3DAE6] rounded-full px-4 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap shadow-2xs">
                            INCIDENT RESPONSE WORKFLOW
                        </div>
                        <h3 className="font-bold text-slate-800 text-base mb-2">ขั้นตอนการรับมือและตอบสนองต่อเหตุการณ์ภัยคุกคามไซเบอร์ (SOP Incident Response)</h3>
                        <p className="text-xs sm:text-sm text-slate-500 mb-6">แนวทางการปฏิบัติงานร่วมกันระหว่างทีม MIS Admin สสจ.พิจิตร และโรงพยาบาลทุกแห่งเมื่อตรวจพบภัยคุกคาม</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#D3E5F5] text-[#006BB4] flex items-center justify-center font-bold text-sm">1</div>
                                    <span className="font-bold text-slate-800 text-sm">ตรวจจับและแจ้งเตือน</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    Wazuh Agent ตรวจจับ Event ผิดปกติ (Brute force, File modification หรือ Malware) แล้วส่งแจ้งเตือนผ่าน Telegram/LINE Notify ถึงทีม Admin
                                </p>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#D3E5F5] text-[#006BB4] flex items-center justify-center font-bold text-sm">2</div>
                                    <span className="font-bold text-slate-800 text-sm">วิเคราะห์คัดกรอง</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    เจ้าหน้าที่ SOC ตรวจสอบ Log, IP ต้นทาง, เทคนิค MITRE ATT&CK เพื่อประเมินระดับความรุนแรง (Level 1–15) ภายใน 15 นาที
                                </p>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#D3E5F5] text-[#006BB4] flex items-center justify-center font-bold text-sm">3</div>
                                    <span className="font-bold text-slate-800 text-sm">จำกัดวงความเสียหาย</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    สั่งการตัดการเชื่อมต่อเครือข่ายของโหนดที่ได้รับผลกระทบ (Isolation) และบล็อก IP ผู้โจมตีที่ Firewall ทันทีเพื่อปกป้องระบบส่วนรวม
                                </p>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#D3E5F5] text-[#006BB4] flex items-center justify-center font-bold text-sm">4</div>
                                    <span className="font-bold text-slate-800 text-sm">กวาดล้างและฟื้นฟู</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    กำจัดมัลแวร์ อุดช่องโหว่ (Patch) และกู้คืนข้อมูลจากระบบสำรอง (Immutable Backup) พร้อมตรวจสอบความถูกต้องครบถ้วนของฐานข้อมูล
                                </p>
                            </div>

                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-[#D3E5F5] text-[#006BB4] flex items-center justify-center font-bold text-sm">5</div>
                                    <span className="font-bold text-slate-800 text-sm">สรุปและรายงาน สกมช.</span>
                                </div>
                                <p className="text-xs text-slate-600 leading-relaxed">
                                    จัดทำรายงาน Incident Report ส่งผู้บริหาร สสจ. และรายงานศูนย์ประสานการรักษาความมั่นคงปลอดภัยไซเบอร์ (NCSA/CERT) ตามเกณฑ์กฎหมาย
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* EMERGENCY CONTACT & REPORTING CARD */}
                    <div className="bg-white border border-[#D3DAE6] rounded-md p-6 pt-7 relative shadow-xs">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white border border-[#D3DAE6] rounded-full px-4 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-700 whitespace-nowrap shadow-2xs">
                            CONTACT & EMERGENCY REPORTING
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                                    ศูนย์ประสานงานรับแจ้งเหตุการณ์ไซเบอร์ฉุกเฉิน (24/7 Hotlines)
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">
                                    พบเหตุผิดปกติหรือต้องการความช่วยเหลือด้านความปลอดภัยสารสนเทศ
                                </h3>
                                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                                    หากโรงพยาบาลหรือหน่วยงานสาธารณสุขในจังหวัดพิจิตรพบข้อความเรียกค่าไถ่, ระบบ HOSxP เข้าไม่ได้ผิดปกติ, หรือตรวจพบการเข้าถึงข้อมูลโดยไม่ได้รับอนุญาต โปรดติดต่อทีม MIS Admin ทันที
                                </p>
                                <div className="flex flex-wrap gap-3 pt-1">
                                    <Link
                                        href="/team"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-[#006BB4] hover:bg-[#004F85] text-white rounded text-xs font-semibold shadow-xs transition"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                                        ดูรายชื่อและเบอร์ติดต่อทีมงาน (Team Directory)
                                    </Link>
                                    <Link
                                        href="/"
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition"
                                    >
                                        ไปยังหน้าแดชบอร์ดหลัก
                                    </Link>
                                </div>
                            </div>

                            {/* Contact details table */}
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3 text-xs">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                    <span className="text-slate-500">สถานที่ปฏิบัติงาน:</span>
                                    <span className="font-medium text-slate-800 text-right">ศูนย์ข้อมูลเทคโนโลยีสารสนเทศ ชั้น 3 สสจ.พิจิตร</span>
                                </div>
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                    <span className="text-slate-500">โทรศัพท์สายตรง (ห้อง MIS):</span>
                                    <span className="font-mono font-bold text-[#006BB4]">056-611-131 ต่อ 104, 105</span>
                                </div>
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                    <span className="text-slate-500">สายด่วนฉุกเฉิน (Hotline 24 ชม.):</span>
                                    <span className="font-mono font-bold text-rose-600">089-xxx-xxxx (หัวหน้ากลุ่มงาน MIS)</span>
                                </div>
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                                    <span className="text-slate-500">อีเมลทางการรับแจ้งเหตุ:</span>
                                    <span className="font-mono font-medium text-slate-700">cybersec@ppho.go.th</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500">LINE Official Group:</span>
                                    <span className="font-medium text-emerald-700 font-mono">@MIS-Phichit-Cyber</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </CtmrLayout>
    );
}
