"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import { Search, Plus, Edit, Trash2, X, Save, User, Building2, FileText, MapPin, AlertTriangle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown, Building, ArrowLeft, Layers, UploadCloud, Check } from "lucide-react";

const THAI_LOCATIONS = [
    { subDistrict: "ป่าป้อง", district: "ดอยสะเก็ด", province: "เชียงใหม่", zip: "50220" },
    { subDistrict: "สันปูเลย", district: "ดอยสะเก็ด", province: "เชียงใหม่", zip: "50220" },
    { subDistrict: "บ้านจันทร์", district: "กัลยาณิวัฒนา", province: "เชียงใหม่", zip: "58130" },
];

type Zone = { id: string; name: string; deeds?: Deed[] };
type Deed = { id: string; deedNumber: string; landNumber: string; utmNo: string; surveyPage: string; subDistrict: string; district: string; province: string; powerOfAttorneyPdf?: string; zones: Zone[] };
type Bank = { id: string; bankName: string; accountName: string; accountNumber: string };
type Project = { id: string; name: string; utilityYear: string; entityType: string; transferDate?: string | null; bank?: Bank; zones: Zone[]; deeds?: Deed[] };

const MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const currentYear = dayjs().year();
const YEARS = Array.from({ length: 120 }, (_, i) => currentYear + 10 - i);

// --- Custom DatePicker สไตล์ Glassmorphism ---
const BuddhistDatePicker = ({ value, onChange, fullWidth = false, align = "left" }: { value: string, onChange: (date: string) => void, fullWidth?: boolean, align?: "left" | "right" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(dayjs(value || dayjs()));
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false); };
        document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const daysInMonth = currentDate.daysInMonth();
    const firstDayOfMonth = currentDate.startOf('month').day();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

    return (
        <div className={`relative ${fullWidth ? 'w-full' : ''}`} ref={ref}>
            <div onClick={() => setIsOpen(!isOpen)} className={`flex items-center justify-between bg-slate-50 hover:bg-blue-50/50 transition-all px-4 py-3.5 rounded-2xl border border-slate-200 focus-within:ring-2 focus-within:ring-blue-500/30 text-slate-700 font-bold cursor-pointer select-none group ${fullWidth ? 'w-full' : ''}`}>
                <div className="flex items-center text-sm">
                    <CalendarIcon size={18} className="mr-2 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="truncate">{value ? dayjs(value).locale('th').format('D MMMM BBBB') : "เลือกวันที่"}</span>
                </div>
                {fullWidth && <ChevronDown size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors ml-1" />}
            </div>

            {isOpen && (
                <div className={`absolute top-full mt-2 ${align === "right" ? "right-0" : "left-0"} z-50 bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 p-5 w-[320px] animate-in zoom-in-95`}>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                        <button onClick={(e) => { e.preventDefault(); setCurrentDate(currentDate.subtract(1, 'month')); }} className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-100 shadow-sm"><ChevronLeft size={16} className="text-blue-600" /></button>
                        <div className="flex gap-2">
                            <select value={currentDate.month()} onChange={(e) => setCurrentDate(currentDate.month(Number(e.target.value)))} className="font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 outline-none cursor-pointer text-sm focus:ring-2 focus:ring-blue-500/30">
                                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <select value={currentDate.year()} onChange={(e) => setCurrentDate(currentDate.year(Number(e.target.value)))} className="font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 outline-none cursor-pointer text-sm focus:ring-2 focus:ring-blue-500/30">
                                {YEARS.map(y => <option key={y} value={y}>{y + 543}</option>)}
                            </select>
                        </div>
                        <button onClick={(e) => { e.preventDefault(); setCurrentDate(currentDate.add(1, 'month')); }} className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-100 shadow-sm"><ChevronRight size={16} className="text-blue-600" /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-3 pb-3 border-b border-slate-100">
                        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => <div key={d} className="text-[10px] font-bold text-slate-400">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {blanks.map(b => <div key={`blank-${b}`} className="p-1"></div>)}
                        {days.map(d => {
                            const isSelected = dayjs(value).isSame(currentDate.date(d), 'day');
                            return (
                                <button key={d} onClick={(e) => { e.preventDefault(); onChange(currentDate.date(d).format('YYYY-MM-DD')); setIsOpen(false); }} className={`p-1 rounded-xl w-9 h-9 flex items-center justify-center text-xs font-bold transition-all cursor-pointer mx-auto ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110' : 'hover:bg-blue-50 text-slate-700 hover:text-blue-700'}`}>
                                    {d}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function ProjectSettings() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, id: string | null, type: 'PROJECT' | 'ZONE' | 'DEED' }>({ isOpen: false, id: null, type: 'PROJECT' });

    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [projectForm, setProjectForm] = useState({ name: "", utilityYear: "", entityType: "INDIVIDUAL", bankId: "", transferDate: "" });

    const [activeProject, setActiveProject] = useState<Project | null>(null);
    const [zoneName, setZoneName] = useState("");
    const [editingZoneId, setEditingZoneId] = useState<string | null>(null);

    const [isDeedModalOpen, setIsDeedModalOpen] = useState(false);
    const [editingDeedId, setEditingDeedId] = useState<string | null>(null);
    const [deedForm, setDeedForm] = useState({ deedNumber: "", landNumber: "", utmNo: "", surveyPage: "", subDistrict: "", district: "", province: "", selectedZones: [] as string[] });

    const [pdfFile, setPdfFile] = useState<File | null>(null);

    const [locationQuery, setLocationQuery] = useState("");
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const locationRef = useRef<HTMLDivElement>(null);

    const fetchProjects = async (keepActive = false) => { const res = await fetch("/api/projects"); if (res.ok) { const data = await res.json(); setProjects(data); if (keepActive && activeProject) setActiveProject(data.find((p: Project) => p.id === activeProject.id) || null); } };
    const fetchBanks = async () => { const res = await fetch("/api/banks"); if (res.ok) setBanks(await res.json()); };

    useEffect(() => {
        fetchProjects(); fetchBanks();
        const handleClickOutside = (e: MouseEvent) => { if (locationRef.current && !locationRef.current.contains(e.target as Node)) setShowLocationDropdown(false); };
        document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredLocations = THAI_LOCATIONS.filter(l => l.subDistrict.includes(locationQuery) || l.district.includes(locationQuery) || l.province.includes(locationQuery));
    const highlightText = (text: string, query: string) => {
        if (!query) return text; const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((p, i) => p.toLowerCase() === query.toLowerCase() ? <span key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{p}</span> : p);
    };

    const handleOpenProjectModal = (proj?: Project) => {
        if (proj) {
            setEditingProjectId(proj.id);
            setProjectForm({
                name: proj.name, utilityYear: proj.utilityYear, entityType: proj.entityType, bankId: proj.bank?.id || "",
                // ✅ ดึงมาแบบปกติ แล้วให้ DatePicker แปลงให้เอง
                transferDate: proj.transferDate ? dayjs(proj.transferDate).format('YYYY-MM-DD') : ""
            });
        } else {
            setEditingProjectId(null);
            setProjectForm({ name: "", utilityYear: "", entityType: "INDIVIDUAL", bankId: "", transferDate: "" });
        }
        setIsProjectModalOpen(true);
    };

    const handleProjectSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        try {
            const res = await fetch("/api/projects", { method: editingProjectId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...projectForm, id: editingProjectId }) });
            if (res.ok) { toast.success(editingProjectId ? "อัปเดตสำเร็จ" : "เพิ่มสำเร็จ"); fetchProjects(); setIsProjectModalOpen(false); } else toast.error("เกิดข้อผิดพลาด");
        } catch (error) { toast.error("ระบบขัดข้อง"); }
        setLoading(false);
    };

    const handleZoneSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); if (!activeProject) return; setLoading(true);
        const res = await fetch("/api/zones", { method: editingZoneId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editingZoneId, name: zoneName, projectId: activeProject.id }) });
        if (res.ok) { toast.success("บันทึกโซนสำเร็จ"); setZoneName(""); setEditingZoneId(null); fetchProjects(true); }
        setLoading(false);
    };

    const handleOpenDeedModal = (deed?: Deed) => {
        setPdfFile(null);
        if (deed) {
            setEditingDeedId(deed.id);
            setDeedForm({ deedNumber: deed.deedNumber, landNumber: deed.landNumber, utmNo: deed.utmNo, surveyPage: deed.surveyPage, subDistrict: deed.subDistrict, district: deed.district, province: deed.province, selectedZones: deed.zones?.map(z => z.id) || [] });
            setLocationQuery("");
        } else {
            setEditingDeedId(null);
            setDeedForm({ deedNumber: "", landNumber: "", utmNo: "", surveyPage: "", subDistrict: "", district: "", province: "", selectedZones: [] });
            setLocationQuery("");
        }
        setIsDeedModalOpen(true);
    };

    const toggleZoneSelection = (zoneId: string) => { setDeedForm(p => ({ ...p, selectedZones: p.selectedZones.includes(zoneId) ? p.selectedZones.filter(id => id !== zoneId) : [...p.selectedZones, zoneId] })); };

    const handleDeedSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (deedForm.selectedZones.length === 0) return toast.error("กรุณาเลือกอย่างน้อย 1 โซน");
        setLoading(true);

        const formData = new FormData();
        formData.append("deedNumber", deedForm.deedNumber);
        formData.append("landNumber", deedForm.landNumber);
        formData.append("utmNo", deedForm.utmNo);
        formData.append("surveyPage", deedForm.surveyPage);
        formData.append("subDistrict", deedForm.subDistrict);
        formData.append("district", deedForm.district);
        formData.append("province", deedForm.province);
        formData.append("selectedZones", JSON.stringify(deedForm.selectedZones));

        if (pdfFile) formData.append("file", pdfFile);
        if (editingDeedId) formData.append("id", editingDeedId);

        try {
            const res = await fetch("/api/deeds", { method: editingDeedId ? "PUT" : "POST", body: formData });
            if (res.ok) { toast.success(editingDeedId ? "อัปเดตโฉนดสำเร็จ" : "เพิ่มโฉนดสำเร็จ"); setIsDeedModalOpen(false); fetchProjects(true); } else toast.error("เกิดข้อผิดพลาดในการบันทึก");
        } catch (error) { toast.error("ระบบขัดข้อง"); }
        setLoading(false);
    };

    const executeDelete = async () => {
        if (!confirmDialog.id) return;
        const { id, type } = confirmDialog;
        const endpoint = type === 'PROJECT' ? '/api/projects' : type === 'ZONE' ? '/api/zones' : '/api/deeds';
        const res = await fetch(`${endpoint}?id=${id}`, { method: "DELETE" });
        if (res.ok) { toast.success("ลบสำเร็จ"); fetchProjects(type !== 'PROJECT'); } else toast.error("ลบไม่ได้ (อาจมีข้อมูลผูกอยู่)");
        setConfirmDialog({ isOpen: false, id: null, type: 'PROJECT' });
    };

    // ---------------- UI: แสดงรายละเอียดภายในโครงการ (Zone & Deeds) ----------------
    if (activeProject) {
        const allDeedsInProject = activeProject.zones.flatMap(z => z.deeds || []);
        const uniqueDeeds = Array.from(new Map(allDeedsInProject.map(item => [item.id, item])).values());

        return (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center gap-4 bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] border border-slate-200/60 shadow-sm">
                    <button onClick={() => setActiveProject(null)} className="p-3 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-2xl cursor-pointer text-slate-500 transition-colors shadow-sm"><ArrowLeft size={24} /></button>
                    <div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                            <Building size={24} className="text-blue-600" /> โครงการ: {activeProject.name}
                        </h2>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Zone Management */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm">
                            <h3 className="font-black text-lg mb-6 flex items-center gap-2 text-slate-800"><Layers size={22} className="text-teal-500" /> จัดการโซน (Zones)</h3>
                            <form onSubmit={handleZoneSubmit} className="flex gap-2 mb-6">
                                <input required value={zoneName} onChange={e => setZoneName(e.target.value)} placeholder="ชื่อโซน (เช่น A, B1)" className="w-full bg-slate-50 text-slate-800 px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-teal-500/30 outline-none transition-all" />
                                <button type="submit" disabled={loading} className="px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl cursor-pointer shadow-md shadow-teal-500/20 active:scale-95 transition-transform">{editingZoneId ? <Save size={20} /> : <Plus size={20} />}</button>
                                {editingZoneId && <button type="button" onClick={() => { setEditingZoneId(null); setZoneName(""); }} className="px-3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl cursor-pointer transition-colors"><X size={20} /></button>}
                            </form>
                            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                                {activeProject.zones.map(zone => (
                                    <div key={zone.id} className="flex justify-between items-center p-4 rounded-2xl border border-slate-100 bg-white hover:border-teal-200 hover:shadow-md transition-all group">
                                        <div className="font-black text-slate-700 text-lg group-hover:text-teal-700 transition-colors">โซน {zone.name}</div>
                                        <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => { setEditingZoneId(zone.id); setZoneName(zone.name); }} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl cursor-pointer transition-colors"><Edit size={18} /></button>
                                            <button onClick={() => setConfirmDialog({ isOpen: true, id: zone.id, type: 'ZONE' })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl cursor-pointer transition-colors"><Trash2 size={18} /></button>
                                        </div>
                                    </div>
                                ))}
                                {activeProject.zones.length === 0 && <div className="text-center py-8 text-slate-400 text-sm font-medium">ยังไม่มีข้อมูลโซน</div>}
                            </div>
                        </div>
                    </div>

                    {/* Deed Management */}
                    <div className="lg:col-span-8">
                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] border border-slate-200/60 shadow-sm space-y-6">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-6 gap-4">
                                <h3 className="font-black text-lg flex items-center gap-2 text-slate-800"><MapPin size={22} className="text-blue-500" /> จัดการโฉนดที่ดิน (Deeds)</h3>
                                <button onClick={() => handleOpenDeedModal()} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer shadow-md shadow-blue-500/20 active:scale-95 transition-all"><Plus size={18} /> เพิ่มโฉนดเข้าระบบ</button>
                            </div>

                            <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-sm">
                                <table className="min-w-full text-sm">
                                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                                        <tr><th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-xs">โฉนดเลขที่</th><th className="px-6 py-4 text-left font-bold uppercase tracking-wider text-xs">โซนที่ผูกไว้</th><th className="px-6 py-4 text-center font-bold uppercase tracking-wider text-xs">ใบมอบอำนาจ</th><th className="px-6 py-4 text-right font-bold uppercase tracking-wider text-xs">จัดการ</th></tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 bg-white">
                                        {uniqueDeeds.length === 0 ? <tr><td colSpan={4} className="text-center py-10 text-slate-400 font-medium">ยังไม่มีข้อมูลโฉนดในโครงการนี้</td></tr> :
                                            uniqueDeeds.map(deed => (
                                                <tr key={deed.id} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="px-6 py-4 font-black text-slate-700 text-base">{deed.deedNumber}</td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {deed.zones?.map(z => <span key={z.id} className="px-2.5 py-1 bg-teal-50 border border-teal-200 text-teal-700 rounded-lg text-[10px] font-black uppercase tracking-wider">โซน {z.name}</span>)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {deed.powerOfAttorneyPdf ? <a href={deed.powerOfAttorneyPdf} target="_blank" className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg font-bold text-xs transition-colors"><FileText size={14} /> เปิดดู PDF</a> : <span className="text-slate-300 font-bold">-</span>}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => handleOpenDeedModal(deed)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl cursor-pointer transition-colors"><Edit size={18} /></button>
                                                            <button onClick={() => setConfirmDialog({ isOpen: true, id: deed.id, type: 'DEED' })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl cursor-pointer transition-colors"><Trash2 size={18} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                {/* --- Modal จัดการโฉนด --- */}
                {isDeedModalOpen && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
                        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 border border-white/50">
                            <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50/30 flex justify-between items-center rounded-t-[2.5rem]">
                                <div className="flex items-center gap-3 ml-2">
                                    <div className="w-12 h-12 bg-white text-blue-600 rounded-2xl flex items-center justify-center shadow-sm"><MapPin size={24} /></div>
                                    <div><h2 className="font-black text-xl text-slate-800 tracking-tight">{editingDeedId ? "แก้ไขโฉนด" : "เพิ่มโฉนดใหม่"}</h2><p className="text-xs text-slate-500 font-medium">ระบุข้อมูลที่ตั้งและโฉนดให้ถูกต้อง</p></div>
                                </div>
                                <button onClick={() => setIsDeedModalOpen(false)} className="p-3 bg-white hover:bg-slate-100 rounded-full cursor-pointer text-slate-500 transition-colors shadow-sm"><X size={20} /></button>
                            </div>

                            <form onSubmit={handleDeedSubmit} className="p-8 overflow-y-auto space-y-6 flex-1">
                                <div className="grid grid-cols-2 gap-5">
                                    <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700 ml-1">โฉนดเลขที่ *</label><input required value={deedForm.deedNumber} onChange={e => setDeedForm({ ...deedForm, deedNumber: e.target.value })} className="w-full px-5 py-3.5 border border-slate-200 bg-slate-50 focus:bg-white rounded-2xl focus:ring-2 focus:ring-blue-500/30 outline-none font-bold text-slate-800 transition-all" /></div>
                                    <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700 ml-1">เลขที่ดิน *</label><input required value={deedForm.landNumber} onChange={e => setDeedForm({ ...deedForm, landNumber: e.target.value })} className="w-full px-5 py-3.5 border border-slate-200 bg-slate-50 focus:bg-white rounded-2xl focus:ring-2 focus:ring-blue-500/30 outline-none font-bold text-slate-800 transition-all" /></div>
                                    <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700 ml-1">หน้าสำรวจ *</label><input required value={deedForm.surveyPage} onChange={e => setDeedForm({ ...deedForm, surveyPage: e.target.value })} className="w-full px-5 py-3.5 border border-slate-200 bg-slate-50 focus:bg-white rounded-2xl focus:ring-2 focus:ring-blue-500/30 outline-none font-bold text-slate-800 transition-all" /></div>
                                    <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700 ml-1">ระวาง *</label><input required value={deedForm.utmNo} onChange={e => setDeedForm({ ...deedForm, utmNo: e.target.value })} className="w-full px-5 py-3.5 border border-slate-200 bg-slate-50 focus:bg-white rounded-2xl focus:ring-2 focus:ring-blue-500/30 outline-none font-bold text-slate-800 transition-all" /></div>
                                </div>

                                <div className="p-5 bg-indigo-50/40 border border-indigo-100 rounded-3xl space-y-4 relative" ref={locationRef}>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-indigo-900 flex items-center gap-2 ml-1"><MapPin size={16} className="text-indigo-500" /> ค้นหาที่ตั้งโฉนดอัตโนมัติ *</label>
                                        <div className="relative">
                                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                            <input value={locationQuery} onChange={(e) => { setLocationQuery(e.target.value); setShowLocationDropdown(true); }} onFocus={() => setShowLocationDropdown(true)} placeholder="พิมพ์ ตำบล, อำเภอ หรือ จังหวัด..." className="w-full pl-11 pr-4 py-3.5 border border-white shadow-sm rounded-2xl focus:ring-2 focus:ring-indigo-500/30 outline-none bg-white font-bold text-slate-800" />
                                        </div>
                                        {showLocationDropdown && locationQuery.length > 0 && (
                                            <div className="absolute z-20 w-[calc(100%-2.5rem)] mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                                                {filteredLocations.map((loc, idx) => (
                                                    <div key={idx} onClick={() => { setDeedForm(p => ({ ...p, subDistrict: loc.subDistrict, district: loc.district, province: loc.province })); setLocationQuery(""); setShowLocationDropdown(false); }} className="px-5 py-3 border-b border-slate-50 hover:bg-indigo-50 cursor-pointer transition-colors">
                                                        <span className="text-sm font-bold text-slate-700">{highlightText(loc.subDistrict, locationQuery)}</span><span className="text-xs text-slate-300 mx-2">»</span><span className="text-sm font-bold text-slate-700">{highlightText(loc.district, locationQuery)}</span><span className="text-xs text-slate-300 mx-2">»</span><span className="text-sm font-black text-indigo-600">{highlightText(loc.province, locationQuery)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">ตำบล</label><input required value={deedForm.subDistrict} onChange={e => setDeedForm({ ...deedForm, subDistrict: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-sm font-bold bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/30 transition-all" /></div>
                                        <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">อำเภอ</label><input required value={deedForm.district} onChange={e => setDeedForm({ ...deedForm, district: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-sm font-bold bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/30 transition-all" /></div>
                                        <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">จังหวัด</label><input required value={deedForm.province} onChange={e => setDeedForm({ ...deedForm, province: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-sm font-bold bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500/30 transition-all" /></div>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <label className="text-sm font-bold mb-3 block text-slate-700 ml-1">เลือกโซนที่โฉนดนี้ครอบคลุม <span className="text-red-500">*</span></label>
                                    <div className="flex flex-wrap gap-2.5">
                                        {activeProject.zones.map(zone => (
                                            <label key={zone.id} className={`px-5 py-3 border-2 rounded-2xl cursor-pointer text-sm font-bold transition-all ${deedForm.selectedZones.includes(zone.id) ? 'bg-teal-50 border-teal-500 text-teal-800 shadow-md shadow-teal-500/10' : 'bg-white border-slate-200 text-slate-600 hover:border-teal-300 hover:shadow-sm'}`}>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${deedForm.selectedZones.includes(zone.id) ? 'bg-teal-500 border-teal-500' : 'border-slate-300'}`}>{deedForm.selectedZones.includes(zone.id) && <Check size={14} className="text-white" />}</div>
                                                    โซน {zone.name}
                                                </div>
                                                <input type="checkbox" className="hidden" onChange={() => toggleZoneSelection(zone.id)} />
                                            </label>
                                        ))}
                                        {activeProject.zones.length === 0 && <span className="text-sm text-slate-400 bg-slate-50 px-4 py-2 rounded-xl">ไม่มีโซนให้เลือก กรุณาเพิ่มโซนก่อน</span>}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <label className="text-sm font-bold mb-2 block text-slate-700 ml-1">ใบมอบอำนาจ (PDF) <span className="text-slate-400 font-medium">{editingDeedId ? "(ไม่ต้องอัปโหลดใหม่ถ้าใช้ไฟล์เดิม)" : "*"}</span></label>
                                    <label className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer relative overflow-hidden group ${pdfFile ? 'border-emerald-400 bg-emerald-50/50' : 'border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50'}`}>
                                        {pdfFile ? (
                                            <>
                                                <FileText size={40} className="mb-3 text-emerald-500 drop-shadow-sm group-hover:scale-110 transition-transform" />
                                                <p className="text-base font-black text-emerald-700">{pdfFile.name}</p>
                                                <p className="text-xs font-bold text-emerald-500/70 mt-1.5">คลิกเพื่อเปลี่ยนไฟล์</p>
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud size={40} className="mb-4 text-blue-500 opacity-80 group-hover:scale-110 transition-transform" />
                                                <p className="text-base"><span className="font-black text-blue-600 block mb-1 text-center">คลิกเพื่ออัปโหลด</span> ไฟล์ PDF ใบมอบอำนาจ</p>
                                            </>
                                        )}
                                        <input type="file" accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} required={!editingDeedId && !pdfFile} />
                                    </label>
                                </div>
                            </form>

                            <div className="px-8 py-5 bg-slate-50/80 border-t border-slate-100 flex justify-end gap-3 rounded-b-[2.5rem]">
                                <button type="button" onClick={() => setIsDeedModalOpen(false)} className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold cursor-pointer hover:bg-slate-50 shadow-sm transition-colors">ยกเลิก</button>
                                <button onClick={handleDeedSubmit} disabled={loading} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black cursor-pointer hover:bg-blue-700 shadow-md shadow-blue-600/30 active:scale-95 transition-all">บันทึกโฉนด</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // ---------------- UI: แสดงรายการโครงการ (หน้าแรกของแท็บ) ----------------
    return (
        <div className="space-y-6">
            <div className="flex justify-end mb-6"><button onClick={() => handleOpenProjectModal()} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-2xl text-sm font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-500/30 transition-transform active:scale-95"><Plus size={18} /> เพิ่มโครงการใหม่</button></div>

            <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] border border-slate-200/60 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-100 text-sm">
                    <thead className="bg-slate-50/80 text-slate-500">
                        <tr><th className="px-8 py-5 text-left font-bold uppercase tracking-wider text-xs">ชื่อโครงการ</th><th className="px-8 py-5 text-center font-bold uppercase tracking-wider text-xs">ประเภทสัญญา</th><th className="px-8 py-5 text-center font-bold uppercase tracking-wider text-xs">จัดการพื้นที่ (โซน & โฉนด)</th><th className="px-8 py-5 text-right font-bold uppercase tracking-wider text-xs">จัดการ</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                        {projects.length === 0 ? <tr><td colSpan={4} className="text-center py-16 text-slate-400 font-medium">ยังไม่มีข้อมูลโครงการ <span className="block mt-2 text-xs">กดปุ่ม "เพิ่มโครงการใหม่" เพื่อเริ่มต้น</span></td></tr> :
                            projects.map((project) => (
                                <tr key={project.id} className="hover:bg-blue-50/30 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-black text-slate-800 text-base group-hover:text-blue-700 transition-colors">{project.name}</span>
                                            <span className="text-xs text-slate-400 font-bold mt-0.5">พ.ศ. {project.utilityYear}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-center"><span className={`px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg border shadow-sm ${project.entityType === 'CORPORATE' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>{project.entityType === 'CORPORATE' ? 'นิติบุคคล' : 'บุคคลธรรมดา'}</span></td>
                                    <td className="px-8 py-5 text-center"><button onClick={() => setActiveProject(project)} className="cursor-pointer px-5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white hover:shadow-md transition-all rounded-xl font-bold flex items-center mx-auto gap-2 active:scale-95"><Layers size={16} /> จัดการ {project.zones?.length || 0} โซน</button></td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => handleOpenProjectModal(project)} className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-xl cursor-pointer transition-colors shadow-sm border border-transparent hover:border-amber-200"><Edit size={18} /></button>
                                            <button onClick={() => setConfirmDialog({ isOpen: true, id: project.id, type: 'PROJECT' })} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl cursor-pointer transition-colors shadow-sm border border-transparent hover:border-red-200"><Trash2 size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* Modal จัดการโครงการ */}
            {isProjectModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-300 border border-white/50 overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50/30 flex justify-between items-center"><h2 className="text-xl font-black text-slate-800 flex items-center gap-3"><Building2 className="text-blue-600" size={24} /> {editingProjectId ? "แก้ไขข้อมูลโครงการ" : "สร้างโครงการใหม่"}</h2><button onClick={() => setIsProjectModalOpen(false)} className="cursor-pointer p-2 bg-white rounded-full hover:bg-slate-100 text-slate-500 shadow-sm transition-colors"><X size={20} /></button></div>

                        <form onSubmit={handleProjectSubmit} className="p-8 space-y-6">
                            <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700 ml-1">ชื่อโครงการ *</label><input required value={projectForm.name} onChange={e => setProjectForm({ ...projectForm, name: e.target.value })} className="w-full px-5 py-3.5 border border-slate-200 bg-slate-50 focus:bg-white rounded-2xl focus:ring-2 focus:ring-blue-500/30 outline-none font-bold text-slate-800 transition-all" placeholder="ระบุชื่อโครงการ" /></div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700 ml-1">ปีที่คาดว่าจะแล้วเสร็จ (พ.ศ.) *</label><input required type="number" min="2500" value={projectForm.utilityYear} onChange={e => setProjectForm({ ...projectForm, utilityYear: e.target.value })} className="w-full px-5 py-3.5 border border-slate-200 bg-slate-50 focus:bg-white rounded-2xl focus:ring-2 focus:ring-blue-500/30 outline-none font-bold text-slate-800 transition-all" placeholder="เช่น 2568" /></div>
                                <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700 ml-1">กำหนดวันโอนกรรมสิทธิ์ <span className="font-medium text-slate-400 text-xs">(ถ้ามี)</span></label>
                                    <BuddhistDatePicker align="right" value={projectForm.transferDate} onChange={(d) => setProjectForm({ ...projectForm, transferDate: d })} fullWidth />
                                </div>
                            </div>

                            <div className="space-y-2"><label className="text-sm font-bold text-slate-700 ml-1">รูปแบบการทำสัญญาหลัก *</label>
                                <div className="flex gap-4 mt-2">
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-2xl cursor-pointer transition-all font-bold ${projectForm.entityType === "INDIVIDUAL" ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-md shadow-emerald-500/10' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                        <input type="radio" name="entityType" value="INDIVIDUAL" checked={projectForm.entityType === "INDIVIDUAL"} onChange={e => setProjectForm({ ...projectForm, entityType: e.target.value })} className="hidden" /> <User size={18} /> บุคคลธรรมดา
                                    </label>
                                    <label className={`flex-1 flex items-center justify-center gap-2 p-4 border-2 rounded-2xl cursor-pointer transition-all font-bold ${projectForm.entityType === "CORPORATE" ? 'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-md shadow-indigo-500/10' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                                        <input type="radio" name="entityType" value="CORPORATE" checked={projectForm.entityType === "CORPORATE"} onChange={e => setProjectForm({ ...projectForm, entityType: e.target.value })} className="hidden" /> <Building2 size={18} /> นิติบุคคล
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700 ml-1">บัญชีธนาคารหลักของโครงการ *</label>
                                <select required value={projectForm.bankId} onChange={e => setProjectForm({ ...projectForm, bankId: e.target.value })} className="w-full px-5 py-4 border border-slate-200 bg-slate-50 focus:bg-white rounded-2xl focus:ring-2 focus:ring-blue-500/30 outline-none font-bold text-slate-800 transition-all cursor-pointer appearance-none">
                                    <option value="">-- กรุณาเลือกบัญชีธนาคาร --</option>{banks.map(b => <option key={b.id} value={b.id}>{b.bankName} ({b.accountNumber})</option>)}
                                </select>
                            </div>

                            <div className="flex justify-end pt-6 mt-4 border-t border-slate-100 gap-3">
                                <button type="button" onClick={() => setIsProjectModalOpen(false)} className="px-6 py-3.5 bg-slate-100 text-slate-600 rounded-2xl font-bold cursor-pointer hover:bg-slate-200 transition-colors">ยกเลิก</button>
                                <button type="submit" disabled={loading} className="px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black cursor-pointer shadow-lg shadow-blue-600/30 active:scale-95 transition-all">บันทึกโครงการ</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {confirmDialog.isOpen && (<div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-in fade-in"><div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-8 w-full max-w-sm text-center shadow-2xl border border-white/50 animate-in zoom-in-95"><div className="w-20 h-20 bg-red-100/50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertTriangle size={40} /></div><h2 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">ยืนยันลบข้อมูล?</h2><p className="text-sm font-medium text-slate-500 mb-8">ข้อมูลที่ถูกลบจะไม่สามารถกู้คืนได้ และอาจส่งผลกระทบต่อสัญญาที่ผูกไว้</p><div className="flex justify-center gap-4"><button onClick={() => setConfirmDialog({ isOpen: false, id: null, type: 'PROJECT' })} className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer transition-colors w-full">ยกเลิก</button><button onClick={executeDelete} className="px-6 py-3 rounded-xl font-black text-white bg-red-600 hover:bg-red-700 cursor-pointer shadow-md shadow-red-600/30 active:scale-95 transition-all w-full">ยืนยันลบข้อมูล</button></div></div></div>)}
        </div>
    );
}