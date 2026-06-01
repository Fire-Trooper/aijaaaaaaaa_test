"use client";

import { useState, useEffect } from "react";
import { Search, Plus, FileText, Download, Trash2, FileDown, Sparkles } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

type Contract = { id: string; contractDate: string; contractType: string; totalPrice: number; contractFilePath: string; receiptFilePath: string; customer: { fullName: string }; deeds: { deedNumber: string }[] };

export default function ContractsPage() {
    const [contracts, setContracts] = useState<Contract[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    const fetchContracts = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/contracts/list");
            if (res.ok) setContracts(await res.json());
        } catch (error) { toast.error("ไม่สามารถดึงข้อมูลสัญญาได้"); }
        setLoading(false);
    };

    useEffect(() => { fetchContracts(); }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกและลบสัญญานี้? ข้อมูลนี้จะไม่สามารถกู้คืนได้")) return;
        try {
            const res = await fetch(`/api/contracts/list?id=${id}`, { method: "DELETE" });
            if (res.ok) { toast.success("ลบสัญญาสำเร็จ"); fetchContracts(); } else toast.error("ไม่สามารถลบสัญญาได้");
        } catch (error) { toast.error("ระบบขัดข้อง"); }
    };

    const filteredContracts = contracts.filter(c =>
        c.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.deeds.some(d => d.deedNumber.includes(searchTerm))
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <FileText className="text-white" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-800 tracking-tight">จัดการทำสัญญา</h1>
                        <p className="text-slate-500 font-medium mt-1">รายการสัญญาทั้งหมด (สด/ผ่อน) และเอกสาร</p>
                    </div>
                </div>
                <Link href="/contracts/new" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3.5 rounded-2xl text-sm font-black flex items-center gap-2 transition-transform active:scale-95 shadow-lg shadow-blue-600/30">
                    <Plus size={20} /> สร้างสัญญาใหม่
                </Link>
            </div>

            {/* Content Area */}
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-[2rem] shadow-sm overflow-hidden flex flex-col">
                <div className="p-6 border-b border-slate-100/80 flex items-center justify-between bg-slate-50/50">
                    <div className="relative w-full max-w-md group">
                        <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="ค้นหาชื่อลูกค้า หรือ เลขโฉนด..." className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-slate-700 transition-all shadow-sm" />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-slate-100/50 border-b border-slate-200/60 text-slate-500">
                            <tr>
                                <th className="px-8 py-5 text-left font-bold uppercase tracking-widest text-xs">วันที่ทำสัญญา</th>
                                <th className="px-8 py-5 text-left font-bold uppercase tracking-widest text-xs">ชื่อลูกค้า</th>
                                <th className="px-8 py-5 text-left font-bold uppercase tracking-widest text-xs">เลขโฉนด</th>
                                <th className="px-8 py-5 text-left font-bold uppercase tracking-widest text-xs">ประเภท</th>
                                <th className="px-8 py-5 text-left font-bold uppercase tracking-widest text-xs">ราคาเต็ม</th>
                                <th className="px-8 py-5 text-center font-bold uppercase tracking-widest text-xs">เอกสาร</th>
                                <th className="px-8 py-5 text-right font-bold uppercase tracking-widest text-xs">จัดการ</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100/80 bg-white/50">
                            {loading ? (
                                <tr><td className="px-8 py-16 text-center text-slate-400 font-bold animate-pulse" colSpan={7}>กำลังโหลดข้อมูล...</td></tr>
                            ) : filteredContracts.length === 0 ? (
                                <tr>
                                    <td className="px-8 py-20 text-center text-slate-400" colSpan={7}>
                                        <div className="flex flex-col items-center justify-center gap-4">
                                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center"><FileText className="text-slate-300" size={40} /></div>
                                            <p className="font-bold text-lg">ไม่พบข้อมูลสัญญาในระบบ</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredContracts.map((contract) => (
                                    <tr key={contract.id} className="hover:bg-blue-50/40 transition-colors group">
                                        <td className="px-8 py-5 font-bold text-slate-600">{new Date(contract.contractDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                                        <td className="px-8 py-5 font-black text-slate-800">{contract.customer.fullName}</td>
                                        <td className="px-8 py-5 font-bold text-blue-600 bg-blue-50/30 rounded-lg">{contract.deeds.map(d => d.deedNumber).join(', ')}</td>
                                        <td className="px-8 py-5">
                                            <span className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-widest rounded-lg border shadow-sm ${contract.contractType === 'CASH' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                                                {contract.contractType === 'CASH' ? 'เงินสด' : 'เงินผ่อน'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 font-black text-slate-700">{contract.totalPrice.toLocaleString()} ฿</td>
                                        <td className="px-8 py-5 text-center">
                                            <div className="flex justify-center gap-2">
                                                {contract.contractFilePath ? (
                                                    <a href={contract.contractFilePath} target="_blank" download className="p-2 text-blue-600 bg-white border border-blue-100 hover:bg-blue-50 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5" title="โหลดสัญญา Word"><FileDown size={18} /></a>
                                                ) : <span className="text-slate-200 p-2"><FileDown size={18} /></span>}

                                                {contract.receiptFilePath ? (
                                                    <a href={contract.receiptFilePath} target="_blank" download className="p-2 text-emerald-600 bg-white border border-emerald-100 hover:bg-emerald-50 rounded-xl transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5" title="โหลดใบเสร็จ PDF"><Download size={18} /></a>
                                                ) : <span className="text-slate-200 p-2"><Download size={18} /></span>}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button onClick={() => handleDelete(contract.id)} className="text-slate-400 hover:text-red-500 bg-white hover:bg-red-50 border border-transparent hover:border-red-100 cursor-pointer p-2.5 rounded-xl transition-all opacity-0 group-hover:opacity-100 shadow-sm"><Trash2 size={18} /></button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}