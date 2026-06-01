"use client";
import { useState, useEffect } from "react";
import { Plus, MapPin, Save, Search, X, CheckCircle2, Layers } from "lucide-react";
import { NumericFormat } from "react-number-format";
import toast from "react-hot-toast";

type Zone = { id: string; name: string };
type Project = { id: string; name: string; zones: Zone[] };
type Plot = { id: string; plotName: string; areaSqWa: number; status: string; project: { name: string }; zone?: { name: string } };
type PlotInput = { id: string; plotName: string; areaSqWa: string };

export default function PlotManager() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [plots, setPlots] = useState<Plot[]>([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [filterProject, setFilterProject] = useState("");
    const [filterZone, setFilterZone] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalProject, setModalProject] = useState("");
    const [modalZone, setModalZone] = useState("");
    const [prefix, setPrefix] = useState("");
    const [startNum, setStartNum] = useState(1);
    const [qty, setQuantity] = useState(10);
    const [plotInputs, setPlotInputs] = useState<PlotInput[]>([]);

    useEffect(() => {
        fetch('/api/projects').then(res => res.json()).then(setProjects);
        fetchPlots();
    }, []);

    useEffect(() => { fetchPlots(); }, [filterProject, filterZone]);

    const fetchPlots = async () => {
        setLoading(true);
        let url = `/api/plots?`;
        if (filterProject) url += `projectId=${filterProject}&`;
        if (filterZone) url += `zoneId=${filterZone}&`;

        try {
            const res = await fetch(url);
            if (res.ok) setPlots(await res.json());
        } catch (e) { toast.error("ดึงข้อมูลแปลงไม่สำเร็จ"); }
        setLoading(false);
    };

    const handleGenerate = () => {
        if (qty < 1) return toast.error("จำนวนแปลงต้องมากกว่า 0");
        const newInputs = Array.from({ length: qty }).map((_, i) => ({
            id: Math.random().toString(),
            plotName: `${prefix}${startNum + i}`,
            areaSqWa: ""
        }));
        setPlotInputs(newInputs);
    };

    const updatePlotArea = (id: string, value: string) => {
        setPlotInputs(prev => prev.map(p => p.id === id ? { ...p, areaSqWa: value } : p));
    };

    const handleSaveBulk = async () => {
        if (!modalProject) return toast.error("กรุณาเลือกโครงการ");
        const invalid = plotInputs.some(p => !p.areaSqWa || Number(p.areaSqWa) <= 0);
        if (invalid) return toast.error("กรุณากรอกเนื้อที่ให้ครบทุกแปลง (ห้ามติดลบ)");

        const toastId = toast.loading("กำลังบันทึกแปลงที่ดิน...");
        try {
            const res = await fetch("/api/plots", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ projectId: modalProject, zoneId: modalZone, plots: plotInputs })
            });
            if (res.ok) {
                toast.success(`บันทึก ${plotInputs.length} แปลงสำเร็จ!`, { id: toastId });
                setIsModalOpen(false);
                setPlotInputs([]);
                fetchPlots();
            } else throw new Error();
        } catch (e) { toast.error("เกิดข้อผิดพลาด", { id: toastId }); }
    };

    const filteredPlots = plots.filter(p => p.plotName.toLowerCase().includes(searchQuery.toLowerCase()));
    const activeProjectZones = projects.find(p => p.id === filterProject)?.zones || [];
    const modalProjectZones = projects.find(p => p.id === modalProject)?.zones || [];

    const getStatusColor = (status: string) => {
        switch (status) {
            case "ว่าง": return "bg-green-100 text-green-700 border-green-200";
            case "จอง": return "bg-amber-100 text-amber-700 border-amber-200";
            case "ทำสัญญา": return "bg-blue-100 text-blue-700 border-blue-200";
            case "โอนแล้ว": return "bg-slate-100 text-slate-500 border-slate-200";
            default: return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">จัดการแปลงที่ดิน (Plots)</h1>
                    <p className="text-slate-500 text-sm mt-1">ดูสถานะและสร้างแปลงที่ดินเข้าโครงการ</p>
                </div>
                <button onClick={() => { setIsModalOpen(true); setPlotInputs([]); }} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm transition-all active:scale-95">
                    <Plus size={18} /> เพิ่มแปลง (Bulk Add)
                </button>
            </div>

            {/* Filter Section */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">โครงการ</label>
                    <select value={filterProject} onChange={e => { setFilterProject(e.target.value); setFilterZone(""); }} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 cursor-pointer">
                        <option value="">-- ทุกโครงการ --</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">โซน</label>
                    <select value={filterZone} onChange={e => setFilterZone(e.target.value)} disabled={!filterProject} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700 disabled:opacity-50 cursor-pointer">
                        <option value="">-- ทุกโซน --</option>
                        {activeProjectZones.map((z: any) => <option key={z.id} value={z.id}>{z.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 space-y-1 relative">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ค้นหาชื่อแปลง</label>
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="พิมพ์ชื่อแปลง..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-slate-700" />
                    </div>
                </div>
            </div>

            {/* Grid Display */}
            {loading ? (
                <div className="text-center py-20 text-slate-400 font-bold animate-pulse">กำลังโหลดข้อมูลแปลง...</div>
            ) : filteredPlots.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 flex flex-col items-center justify-center text-slate-400">
                    <MapPin size={48} className="opacity-20 mb-4" />
                    <p className="text-lg font-bold">ไม่พบข้อมูลแปลงที่ดิน</p>
                    <p className="text-sm mt-1">ลองเปลี่ยนเงื่อนไขการค้นหา หรือกด "เพิ่มแปลง" เพื่อสร้างใหม่</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredPlots.map(plot => (
                        <div key={plot.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-4 flex flex-col items-center text-center group cursor-default">
                            <div className={`px-2.5 py-0.5 rounded-md border text-[10px] font-bold mb-3 w-full truncate ${getStatusColor(plot.status)}`}>
                                {plot.status}
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">{plot.plotName}</h3>
                            <p className="text-slate-500 text-sm font-medium mt-1">{plot.areaSqWa.toLocaleString()} ตร.ว.</p>
                            <div className="w-full border-t border-slate-100 mt-3 pt-3 flex flex-col gap-1">
                                <span className="text-[10px] text-slate-400 font-bold uppercase truncate">{plot.project.name}</span>
                                {plot.zone && <span className="text-[10px] bg-slate-100 text-slate-500 rounded px-1.5 py-0.5 w-max mx-auto">โซน {plot.zone.name}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal: Bulk Add */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl flex flex-col max-h-[90vh] shadow-2xl animate-in zoom-in-95">
                        <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-blue-50/50 rounded-t-3xl">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-sm"><Layers size={20} /></div>
                                <div><h2 className="text-lg font-bold text-slate-800">เครื่องมือสร้างแปลงที่ดินอัตโนมัติ (Bulk Generator)</h2><p className="text-xs text-slate-500">สร้างแปลงที่ดินจำนวนมากเข้าโครงการได้ในคลิกเดียว</p></div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"><X size={20} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                                <div className="col-span-2 md:col-span-2 space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">เลือกโครงการ *</label>
                                    <select value={modalProject} onChange={e => { setModalProject(e.target.value); setModalZone(""); }} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold">
                                        <option value="">-- เลือกโครงการ --</option>
                                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2 md:col-span-2 space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">เลือกโซน (ถ้ามี)</label>
                                    <select value={modalZone} onChange={e => setModalZone(e.target.value)} disabled={!modalProject} className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold disabled:opacity-50">
                                        <option value="">-- ไม่มีโซน --</option>
                                        {modalProjectZones.map((z: any) => <option key={z.id} value={z.id}>{z.name}</option>)}
                                    </select>
                                </div>

                                <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">อักษรนำ (Prefix)</label><input value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="เช่น A, B" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" /></div>
                                <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">เริ่มที่เลข</label><input type="number" value={startNum} onChange={e => setStartNum(Number(e.target.value))} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" /></div>
                                <div className="col-span-2 space-y-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">จำนวนแปลงที่ต้องการสร้าง *</label>
                                    <div className="flex gap-2">
                                        <input type="number" min="1" value={qty} onChange={e => setQuantity(Number(e.target.value))} className="w-full px-4 py-2.5 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold" />
                                        <button onClick={handleGenerate} className="bg-slate-800 text-white px-6 font-bold rounded-xl hover:bg-slate-700 shadow-sm transition-transform active:scale-95 whitespace-nowrap cursor-pointer">สร้างตาราง</button>
                                    </div>
                                </div>
                            </div>

                            {plotInputs.length > 0 && (
                                <div className="animate-in slide-in-from-bottom-4">
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="font-bold text-slate-700 flex items-center gap-2"><CheckCircle2 size={18} className="text-green-500" /> กรอกเนื้อที่ของแต่ละแปลง (ตารางวา)</h3>
                                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">{plotInputs.length} แปลง</span>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 p-1">
                                        {plotInputs.map((p) => (
                                            <div key={p.id} className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2 relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <span className="font-black text-slate-800 text-lg">{p.plotName}</span>
                                                <NumericFormat
                                                    value={p.areaSqWa}
                                                    onValueChange={(v) => updatePlotArea(p.id, v.value || "")}
                                                    thousandSeparator decimalScale={2} fixedDecimalScale allowNegative={false}
                                                    placeholder="0.00"
                                                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-right font-bold text-blue-700 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-between items-center">
                            <p className="text-xs text-slate-500">ตรวจสอบข้อมูลให้ถูกต้องก่อนกดบันทึก</p>
                            <div className="flex gap-3">
                                <button onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 cursor-pointer">ยกเลิก</button>
                                <button onClick={handleSaveBulk} disabled={plotInputs.length === 0} className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"><Save size={18} /> บันทึกเข้าโครงการ</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}