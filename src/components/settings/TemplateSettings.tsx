"use client";

import { useState, useEffect } from "react";
import { Upload, Trash2, FileText, Plus, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

type Template = { id: string; name: string; type: string; filePath: string; uploadedAt: string };

const TEMPLATE_TYPES = [
    { value: "CONTRACT_CASH_INDIVIDUAL", label: "สัญญาสด - บุคคลธรรมดา", group: "บุคคลธรรมดา" },
    { value: "CONTRACT_CASH_CORPORATE", label: "สัญญาสด - นิติบุคคล", group: "นิติบุคคล" },
    { value: "CONTRACT_INSTALLMENT_INDIVIDUAL", label: "สัญญาผ่อน - บุคคลธรรมดา", group: "บุคคลธรรมดา" },
    { value: "CONTRACT_INSTALLMENT_CORPORATE", label: "สัญญาผ่อน - นิติบุคคล", group: "นิติบุคคล" },
    { value: "RECEIPT_FORM", label: "ใบเสร็จรับเงิน (ใช้ร่วมกัน)", group: "ทั่วไป" },
];

export default function TemplateSettings() {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });

    const fetchTemplates = async () => { const res = await fetch("/api/templates"); if (res.ok) setTemplates(await res.json()); };
    useEffect(() => { fetchTemplates(); }, []);

    const availableTypes = TEMPLATE_TYPES.filter(t => !templates.some(tpl => tpl.type === t.value));

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault(); setLoading(true);
        const formData = new FormData(e.currentTarget);
        const file = formData.get("file") as File;
        const type = formData.get("type") as string;

        if (type === "RECEIPT_FORM" && !file.name.endsWith(".pdf")) return toast.error("ใบเสร็จต้องเป็น .pdf");
        if (type.includes("CONTRACT") && !file.name.endsWith(".docx")) return toast.error("สัญญาต้องเป็น .docx");

        try {
            const res = await fetch("/api/templates", { method: "POST", body: formData });
            if (res.ok) { toast.success("อัปโหลดสำเร็จ"); fetchTemplates(); setIsModalOpen(false); } else toast.error("ล้มเหลว");
        } catch (error) { toast.error("ระบบขัดข้อง"); }
        setLoading(false);
    };

    const confirmDelete = async () => {
        if (!confirmDialog.id) return;
        const res = await fetch(`/api/templates?id=${confirmDialog.id}`, { method: "DELETE" });
        if (res.ok) { toast.success("ลบสำเร็จ"); fetchTemplates(); } else toast.error("ลบไม่ได้");
        setConfirmDialog({ isOpen: false, id: null });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-4"><button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm"><Plus size={18} /> อัปโหลดเทมเพลตใหม่</button></div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-700 text-white"><tr><th className="px-6 py-4 text-left text-xs font-semibold uppercase">สำหรับ (ประเภท)</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase">ประเภทเอกสาร</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase">ชื่อไฟล์</th><th className="px-6 py-4 text-right text-xs font-semibold uppercase">จัดการ</th></tr></thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                        {templates.map((tpl) => {
                            const tInfo = TEMPLATE_TYPES.find(t => t.value === tpl.type);
                            // แยกสีแบบชัดเจน
                            const badgeColor = tInfo?.group === "นิติบุคคล" ? 'bg-purple-100 border-purple-200 text-purple-700' :
                                tInfo?.group === "บุคคลธรรมดา" ? 'bg-emerald-100 border-emerald-200 text-emerald-700' :
                                    'bg-slate-100 border-slate-200 text-slate-600';
                            return (
                                <tr key={tpl.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-bold rounded-md border ${badgeColor}`}>{tInfo?.group}</span></td>
                                    <td className="px-6 py-4 font-bold text-slate-900">{tInfo?.label}</td>
                                    <td className="px-6 py-4 flex gap-2 items-center text-slate-900"><FileText size={16} className={tpl.filePath.endsWith('.pdf') ? 'text-red-500' : 'text-blue-500'} /> {tpl.name}</td>
                                    <td className="px-6 py-4 text-right"><button onClick={() => setConfirmDialog({ isOpen: true, id: tpl.id })} className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 size={18} /></button></td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-in zoom-in-95">
                        <div className="px-6 py-4 border-b flex justify-between bg-blue-50/50 rounded-t-2xl"><h2 className="font-bold flex gap-2"><Upload size={20} /> อัปโหลดไฟล์เทมเพลต</h2><button onClick={() => setIsModalOpen(false)} className="cursor-pointer text-slate-400 hover:text-slate-600"><X size={20} /></button></div>
                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            <div className="space-y-1"><label className="text-sm font-bold">ประเภทเอกสารที่จะอัปโหลด *</label>
                                <select required name="type" className="w-full px-4 py-2 border rounded-lg outline-none bg-white cursor-pointer">
                                    <option value="">-- เลือกประเภทเอกสาร --</option>
                                    {availableTypes.length === 0 ? <option value="" disabled>คุณอัปโหลดครบทุกประเภทแล้ว</option> : availableTypes.map(t => <option key={t.value} value={t.value}>{t.group} - {t.label}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1"><label className="text-sm font-bold">ไฟล์ต้นฉบับ (.docx หรือ .pdf) *</label><input required name="file" type="file" accept=".docx,.pdf" className="w-full px-4 py-2 border border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50/30" /></div>
                            <div className="flex justify-end pt-4"><button type="submit" disabled={loading || availableTypes.length === 0} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold cursor-pointer disabled:opacity-50">อัปโหลดไฟล์</button></div>
                        </form>
                    </div>
                </div>
            )}

            {confirmDialog.isOpen && (
                <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl"><div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div><h2 className="text-xl font-bold mb-2">ยืนยันลบไฟล์?</h2><div className="flex justify-center gap-3"><button onClick={() => setConfirmDialog({ isOpen: false, id: null })} className="px-6 py-2 rounded-xl font-bold bg-slate-100 cursor-pointer">ยกเลิก</button><button onClick={confirmDelete} className="px-6 py-2 rounded-xl font-bold text-white bg-red-600 cursor-pointer">ยืนยันลบ</button></div></div>
                </div>
            )}
        </div>
    );
}