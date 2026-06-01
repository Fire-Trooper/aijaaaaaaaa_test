"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Building2, Trash2, ChevronDown, Search, Edit, Save, X, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

type Bank = { id: string; bankName: string; accountNumber: string; accountName: string; logoUrl?: string; };

const THAI_BANKS = [
    { name: "กสิกรไทย", fullname: "ธนาคารกสิกรไทย", nameEN: "Kasikorn Bank", symbol: "KBANK", icon: "/icons/KBANK.png", color: "#1DA858" },
    { name: "ไทยพาณิชย์", fullname: "ธนาคารไทยพาณิชย์", nameEN: "The Siam Commercial Bank", symbol: "SCB", icon: "/icons/SCB.png", color: "#543186" },
    { name: "กรุงไทย", fullname: "ธนาคารกรุงไทย", nameEN: "Krungthai Bank", symbol: "KTB", icon: "/icons/KTB.png", color: "#1DA8E6" },
    { name: "กรุงเทพ", fullname: "ธนาคารกรุงเทพ", nameEN: "Bangkok Bank", symbol: "BBL", icon: "/icons/BBL.png", color: "#29449D" },
    { name: "กรุงศรีอยุธยา", fullname: "ธนาคารกรุงศรีอยุธยา", nameEN: "Krungsri Bank", symbol: "BAY", icon: "/icons/BAY.png", color: "#FFD51C" },
    { name: "ทีเอ็มบีธนชาต", fullname: "ธนาคารทีเอ็มบีธนชาต", nameEN: "TMBThanachart Bank", symbol: "TTB", icon: "/icons/TTB.png", color: "#0C55F2" },
    { name: "ยูโอบี", fullname: "ธนาคารยูโอบี", nameEN: "United Overseas Bank", symbol: "UOB", icon: "/icons/UOB.png", color: "#E41A26" },
    { name: "เกียรตินาคิน", fullname: "ธนาคารเกียรตินาคินภัทร", nameEN: "Kiatnakin Phatra Bank", symbol: "KKP", icon: "/icons/KKP.png", color: "#5A547C" },
    { name: "ออมสิน", fullname: "ธนาคารออมสิน", nameEN: "Government Savings Bank", symbol: "GSB", icon: "/icons/GSB.png", color: "#ED1891" },
    { name: "ธ.ก.ส.", fullname: "ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร", nameEN: "Bank for Agriculture and Agricultural Cooperatives", symbol: "BAAC", icon: "/icons/BAAC.png", color: "#CCA41C" },
    { name: "ซีไอเอ็มบี", fullname: "ธนาคารซีไอเอ็มบี", nameEN: "CIMB Thai Bank", symbol: "CIMB", icon: "/icons/CIMB.png", color: "#BD1325" },
    { name: "ซิตี้แบงก์", fullname: "ธนาคารซิตี้แบงก์", nameEN: "citibank", symbol: "CITI", icon: "/icons/CITI.png", color: "#0F3D89" },
    { name: "ธ.อ.ส.", fullname: "ธนาคารอาคารสงเคราะห์", nameEN: "GH Bank", symbol: "GHB", icon: "/icons/GHB.png", color: "#FF8614" },
    { name: "เอชเอสบีซี", fullname: "ธนาคารเอชเอสบีซี", nameEN: "HSBC Bank", symbol: "HSBC", icon: "/icons/HSBC.png", color: "#FF1518" },
    { name: "อิสลามแห่งประเทศไทย", fullname: "ธนาคารอิสลามแห่งประเทศไทย", nameEN: "Islamic Bank of Thailand", symbol: "IBANK", icon: "/icons/IBANK.png", color: "#164626" },
    { name: "ไอซีบีซี", fullname: "ธนาคารไอซีบีซี", nameEN: "ICBC Thai Commercial Bank", symbol: "ICBC", icon: "/icons/ICBC.png", color: "#CD1511" },
    { name: "แลนด์ แอนด์ เฮ้าส์", fullname: "ธนาคารแลนด์ แอนด์ เฮ้าส์", nameEN: "LH Bank", symbol: "LHB", icon: "/icons/LHB.png", color: "#727375" },
    { name: "ไทยเครดิต", fullname: "ธนาคารไทยเครดิต", nameEN: "Thai Credit Bank", symbol: "TCRB", icon: "/icons/TCRB.png", color: "#FF7813" },
    { name: "ทิสโก้", fullname: "ธนาคารทิสโก้", nameEN: "Tisco Bank", symbol: "TISCO", icon: "/icons/TISCO.png", color: "#267CBC" },
    { name: "พร้อมเพย์", fullname: "พร้อมเพย์", nameEN: "PromptPay", symbol: "PromptPay", icon: "/icons/PromptPay.png", color: "#0C4370" },
    { name: "ทรูมันนี่", fullname: "ทรูมันนี่", nameEN: "True Money", symbol: "TrueMoney", icon: "/icons/TrueMoney.png", color: "#EE252B" }
];

export default function BankSettings() {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedBank, setSelectedBank] = useState(THAI_BANKS[1]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [accName, setAccName] = useState("");
    const [accNum, setAccNum] = useState("");

    const fetchBanks = async () => { const res = await fetch("/api/banks"); if (res.ok) setBanks(await res.json()); };

    useEffect(() => {
        fetchBanks();
        const handleClickOutside = (e: MouseEvent) => { if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) { setIsDropdownOpen(false); setSearchTerm(`${selectedBank.symbol} (${selectedBank.name})`); } };
        document.addEventListener("mousedown", handleClickOutside);
        setSearchTerm(`${selectedBank.symbol} (${selectedBank.name})`);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [selectedBank]);

    const filteredBanks = THAI_BANKS.filter(bank => bank.name.includes(searchTerm) || bank.symbol.includes(searchTerm));

    const handleAccNumChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 15);
        const formatted = raw.match(/.{1,3}/g)?.join('-') || raw;
        setAccNum(formatted);
    };

    const handleOpenModal = (bank?: Bank) => {
        if (bank) {
            setEditingId(bank.id); setAccName(bank.accountName); setAccNum(bank.accountNumber);
            const tb = THAI_BANKS.find(b => bank.bankName.includes(b.symbol)) || THAI_BANKS[0];
            setSelectedBank(tb); setSearchTerm(`${tb.symbol} (${tb.name})`);
        } else {
            setEditingId(null); setAccName(""); setAccNum("");
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        const body = JSON.stringify({ id: editingId, bankName: `${selectedBank.symbol} - ${selectedBank.fullname}`, logoUrl: selectedBank.icon, accountName: accName, accountNumber: accNum });
        try {
            const res = await fetch("/api/banks", { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body });
            if (res.ok) { toast.success(editingId ? "อัปเดตสำเร็จ" : "เพิ่มสำเร็จ"); fetchBanks(); setIsModalOpen(false); } else toast.error("เกิดข้อผิดพลาด");
        } catch (error) { toast.error("ระบบขัดข้อง"); }
        setLoading(false);
    };

    const confirmDelete = async () => {
        if (!confirmDialog.id) return;
        const res = await fetch(`/api/banks?id=${confirmDialog.id}`, { method: "DELETE" });
        if (res.ok) { toast.success("ลบสำเร็จ"); fetchBanks(); } else toast.error("ลบไม่ได้");
        setConfirmDialog({ isOpen: false, id: null });
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end mb-4"><button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 cursor-pointer shadow-sm"><Plus size={18} /> เพิ่มบัญชีธนาคาร</button></div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-700 text-white"><tr><th className="px-6 py-4 text-left text-xs font-semibold uppercase">ชื่อธนาคาร</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase">ชื่อบัญชี</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase">เลขที่บัญชี</th><th className="px-6 py-4 text-right text-xs font-semibold uppercase">จัดการ</th></tr></thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                        {banks.map((bank) => (
                            <tr key={bank.id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 flex gap-3">{bank.logoUrl && <img src={bank.logoUrl} alt="logo" className="w-6 h-6 object-contain" onError={(e) => { e.currentTarget.style.display = 'none' }} />} <span className="font-bold text-black">{bank.bankName}</span></td>
                                <td className="px-6 py-4 font-medium"><span className="text-black">{bank.accountName}</span></td>
                                <td className="px-6 py-4"><span className="text-black">{bank.accountNumber}</span></td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleOpenModal(bank)} className="p-1.5 text-slate-400 hover:text-amber-500 cursor-pointer"><Edit size={18} /></button>
                                    <button onClick={() => setConfirmDialog({ isOpen: true, id: bank.id })} className="p-1.5 text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl animate-in zoom-in-95">
                        <div className="px-6 py-4 border-b flex justify-between bg-blue-50/50 rounded-t-2xl"><h2 className="font-bold">{editingId ? "แก้ไขธนาคาร" : "เพิ่มธนาคารใหม่"}</h2><button onClick={() => setIsModalOpen(false)} className="cursor-pointer text-slate-400 hover:text-slate-600"><X size={20} /></button></div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="space-y-1 relative" ref={dropdownRef}>
                                <label className="text-sm font-bold">ธนาคาร *</label>
                                <div className="w-full border rounded-lg bg-white flex items-center px-3 py-2 cursor-text" onClick={() => setIsDropdownOpen(true)}>
                                    {selectedBank && searchTerm === `${selectedBank.symbol} (${selectedBank.name})` ? <img src={selectedBank.icon} className="w-6 h-6 object-contain" /> : <Search size={18} className="text-slate-400" />}
                                    <input type="text" value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }} onFocus={e => { e.target.select(); setIsDropdownOpen(true); }} className="w-full outline-none ml-2 text-sm bg-transparent" />
                                    <ChevronDown size={16} className="text-slate-400 cursor-pointer" onClick={() => setIsDropdownOpen(!isDropdownOpen)} />
                                </div>
                                {isDropdownOpen && (
                                    <div className="absolute z-20 w-full mt-1 bg-white border rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                        {filteredBanks.map((bank) => (
                                            <div key={bank.symbol} onClick={() => { setSelectedBank(bank); setSearchTerm(`${bank.symbol} (${bank.name})`); setIsDropdownOpen(false); }} className="px-3 py-2 hover:bg-slate-50 flex gap-3 cursor-pointer">
                                                <img src={bank.icon} className="w-6 h-6 object-contain" /><div><p className="text-sm font-bold">{bank.symbol}</p><p className="text-xs text-slate-500">{bank.fullname}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1"><label className="text-sm font-bold">ชื่อบัญชี *</label><input required value={accName} onChange={e => setAccName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none" /></div>
                            <div className="space-y-1">
                                <div className="flex justify-between"><label className="text-sm font-bold">เลขที่บัญชี *</label><span className="text-xs text-slate-400">{accNum.replace(/-/g, '').length}/15</span></div>
                                <input required value={accNum} onChange={handleAccNumChange} placeholder="xxx-xxx-xxx-xxx-xxx" className="w-full px-3 py-2 border rounded-lg focus:ring-2 outline-none" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4"><button type="submit" disabled={loading} className="px-8 py-2.5 bg-blue-600 text-white rounded-xl font-bold cursor-pointer">{editingId ? "บันทึกแก้ไข" : "เพิ่มบัญชี"}</button></div>
                        </form>
                    </div>
                </div>
            )}

            {/* แก้ไข Tailwind Warning: เปลี่ยน z-[70] เป็น z-70 */}
            {confirmDialog.isOpen && (
                <div className="fixed inset-0 z-70 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl"><div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div><h2 className="text-xl font-bold mb-2">ยืนยันลบข้อมูล?</h2><p className="text-slate-500 mb-6">ข้อมูลที่ถูกลบจะไม่สามารถกู้คืนได้</p><div className="flex justify-center gap-3"><button onClick={() => setConfirmDialog({ isOpen: false, id: null })} className="px-6 py-2 rounded-xl font-bold bg-slate-100 cursor-pointer">ยกเลิก</button><button onClick={confirmDelete} className="px-6 py-2 rounded-xl font-bold text-white bg-red-600 cursor-pointer">ยืนยันลบ</button></div></div>
                </div>
            )}
        </div>
    );
}