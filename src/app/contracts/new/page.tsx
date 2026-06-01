"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Save, ChevronRight, CheckCircle2, AlertTriangle, Settings, MapPin, Search, Calendar as CalendarIcon, User, FileText, Banknote, UploadCloud, Plus, Trash2, Check, ChevronLeft, ChevronDown, X, Building2, Edit3, Calculator, Layers, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";
import { NumericFormat } from "react-number-format";

dayjs.extend(buddhistEra);
dayjs.locale("th");

const THAI_LOCATIONS = [
    { subDistrict: "ป่าป้อง", district: "ดอยสะเก็ด", province: "เชียงใหม่", zip: "50220" },
    { subDistrict: "สันปูเลย", district: "ดอยสะเก็ด", province: "เชียงใหม่", zip: "50220" },
    { subDistrict: "บ้านจันทร์", district: "กัลยาณิวัฒนา", province: "เชียงใหม่", zip: "58130" },
];

const THAI_BANKS = [
    { name: "กสิกรไทย", symbol: "KBANK", icon: "/icons/KBANK.png" },
    { name: "ไทยพาณิชย์", symbol: "SCB", icon: "/icons/SCB.png" },
    { name: "กรุงไทย", symbol: "KTB", icon: "/icons/KTB.png" },
    { name: "กรุงเทพ", symbol: "BBL", icon: "/icons/BBL.png" },
];

type Deed = { id: string; deedNumber: string; landNumber: string; surveyPage: string; utmNo: string; subDistrict: string; district: string; province: string; };
type Zone = { id: string; name: string; deeds: Deed[] };
type Project = { id: string; name: string; entityType: string; transferDate?: string | null; zones: Zone[] };
type Customer = { id: string; fullName: string; idCard: string; phone: string; secondaryPhone?: string; addressNumber: string; moo: string; subDistrict: string; district: string; province: string; birthDate?: string | null; isCorporate: boolean };
type Bank = { id: string; bankName: string; logoUrl?: string; accountName: string; accountNumber: string };
type Plot = { id: string; plotName: string; areaSqWa: number; status: string; zoneId?: string | null; zone?: { name: string } };

const MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const currentYear = dayjs().year();
const YEARS = Array.from({ length: 120 }, (_, i) => currentYear + 10 - i);

// --- Custom Thai DatePicker (Glassmorphism) ---
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
            <div onClick={() => setIsOpen(!isOpen)} className={`flex items-center justify-between bg-white/80 hover:bg-blue-50/80 transition-all px-4 py-3.5 rounded-2xl border border-slate-200 text-slate-700 font-bold cursor-pointer select-none group focus-within:ring-4 focus-within:ring-blue-500/20 focus-within:border-blue-400 ${fullWidth ? 'w-full' : ''}`}>
                <div className="flex items-center text-sm">
                    <CalendarIcon size={18} className="mr-2 text-blue-500 group-hover:scale-110 transition-transform" />
                    <span className="truncate">{value ? dayjs(value).format('D MMMM BBBB') : "เลือกวันที่"}</span>
                </div>
                {fullWidth && <ChevronDown size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors ml-1" />}
            </div>

            {isOpen && (
                <div className={`absolute top-full mt-2 ${align === "right" ? "right-0" : "left-0"} z-[150] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-100 p-5 w-80 animate-in zoom-in-95`}>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100">
                        <button onClick={(e) => { e.preventDefault(); setCurrentDate(currentDate.subtract(1, 'month')); }} className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-100 shadow-sm"><ChevronLeft size={16} className="text-slate-600" /></button>
                        <div className="flex gap-2">
                            <select value={currentDate.month()} onChange={(e) => setCurrentDate(currentDate.month(Number(e.target.value)))} className="font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 outline-none cursor-pointer text-sm focus:ring-2 focus:ring-blue-500/30">
                                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                            </select>
                            <select value={currentDate.year()} onChange={(e) => setCurrentDate(currentDate.year(Number(e.target.value)))} className="font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 outline-none cursor-pointer text-sm focus:ring-2 focus:ring-blue-500/30">
                                {YEARS.map(y => <option key={y} value={y}>{y + 543}</option>)}
                            </select>
                        </div>
                        <button onClick={(e) => { e.preventDefault(); setCurrentDate(currentDate.add(1, 'month')); }} className="p-2 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-100 shadow-sm"><ChevronRight size={16} className="text-slate-600" /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center mb-3 pb-3 border-b border-slate-100">
                        {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => <div key={d} className="text-[11px] font-black text-slate-400">{d}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center">
                        {blanks.map(b => <div key={`blank-${b}`} className="p-1.5"></div>)}
                        {days.map(d => {
                            const isSelected = dayjs(value).isSame(currentDate.date(d), 'day');
                            return (
                                <button key={d} onClick={(e) => { e.preventDefault(); onChange(currentDate.date(d).format('YYYY-MM-DD')); setIsOpen(false); }} className={`p-2 rounded-xl w-9 h-9 flex items-center justify-center text-sm font-bold transition-all cursor-pointer mx-auto ${isSelected ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-110' : 'hover:bg-blue-50 text-slate-700 hover:text-blue-700'}`}>
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

export default function NewContractStepper() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [setupCheck, setSetupCheck] = useState({ isChecking: true, hasProjects: false, hasTemplates: false });

    const [projects, setProjects] = useState<Project[]>([]);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [banks, setBanks] = useState<Bank[]>([]);

    const [availablePlots, setAvailablePlots] = useState<Plot[]>([]);
    const [selectedPlots, setSelectedPlots] = useState<Plot[]>([]);
    const [isPlotModalOpen, setIsPlotModalOpen] = useState(false);
    const [plotModalZoneFilter, setPlotModalZoneFilter] = useState<string>("");

    const [formData, setFormData] = useState({
        contractDate: dayjs().format('YYYY-MM-DD'),
        projectId: "",
        entityType: "INDIVIDUAL" as "INDIVIDUAL" | "CORPORATE",
        customerId: "", fullName: "", idCard: "", phone: "",
        contractType: "CASH" as "CASH" | "INSTALLMENT",
        areaRai: "", areaNgan: "", areaWa: "", totalPrice: "", deposit: "", remainingPrice: "",
        installmentsCount: "", installmentAmount: "", installmentStartDate: "", installmentPayDay: "", contractEndDate: "",
        cashReceive: "",
    });
    const [isEndDateLocked, setIsEndDateLocked] = useState(true);

    const [transfers, setTransfers] = useState<{ bankId: string, amount: string, file: File | null }[]>([]);
    const [openTransferBankIdx, setOpenTransferBankIdx] = useState<number | null>(null);

    const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
    const [editingCustId, setEditingCustId] = useState<string | null>(null);
    const [customerForm, setCustomerForm] = useState({ fullName: "", idCard: "", birthDate: "", phone: "", secondaryPhone: "", addressNumber: "", moo: "", subDistrict: "", district: "", province: "" });
    const [isCorporateCust, setIsCorporateCust] = useState(false);

    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [bankForm, setBankForm] = useState({ bankName: "", accountNumber: "", accountName: "" });
    const [selectedBankIcon, setSelectedBankIcon] = useState(THAI_BANKS[0]);
    const [bankSearchTerm, setBankSearchTerm] = useState(`${THAI_BANKS[0].symbol} (${THAI_BANKS[0].name})`);
    const [isBankDropdownOpen, setIsBankDropdownOpen] = useState(false);

    const [showCustomerDropdown, setShowLocationCustomer] = useState(false);
    const [customerSearch, setCustomerSearch] = useState("");
    const customerRef = useRef<HTMLDivElement>(null);
    const bankRef = useRef<HTMLDivElement>(null);

    const [locationQuery, setLocationQuery] = useState("");
    const [showLocationDropdown, setShowLocationDropdown] = useState(false);
    const locationRef = useRef<HTMLDivElement>(null);

    const [showPercentCalc, setShowPercentCalc] = useState(false);
    const [percentInput, setPercentInput] = useState("");
    const percentCalcRef = useRef<HTMLDivElement>(null);

    const fetchCustomers = async () => { const res = await fetch('/api/customers'); if (res.ok) setCustomers(await res.json()); };
    const fetchBanks = async () => { const res = await fetch('/api/banks'); if (res.ok) setBanks(await res.json()); };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [projRes, custRes, tplRes, bankRes] = await Promise.all([fetch('/api/projects'), fetch('/api/customers'), fetch('/api/templates'), fetch('/api/banks')]);
                if (projRes.ok) {
                    const p = await projRes.json(); setProjects(p);
                    setSetupCheck(prev => ({ ...prev, hasProjects: p.some((proj: any) => proj.zones.some((z: any) => z.deeds && z.deeds.length > 0)) }));
                }
                if (custRes.ok) setCustomers(await custRes.json());
                if (bankRes.ok) setBanks(await bankRes.json());
                if (tplRes.ok) {
                    const templatesData = await tplRes.json();
                    setSetupCheck(prev => ({ ...prev, hasTemplates: templatesData.length > 0, isChecking: false }));
                } else setSetupCheck(p => ({ ...p, isChecking: false }));
            } catch (error) { setSetupCheck(p => ({ ...p, isChecking: false })); }
        };
        fetchData();

        const handleClickOutside = (e: MouseEvent) => {
            if (locationRef.current && !locationRef.current.contains(e.target as Node)) setShowLocationDropdown(false);
            if (customerRef.current && !customerRef.current.contains(e.target as Node)) setShowLocationCustomer(false);
            if (bankRef.current && !bankRef.current.contains(e.target as Node)) setIsBankDropdownOpen(false);
            if (percentCalcRef.current && !percentCalcRef.current.contains(e.target as Node)) setShowPercentCalc(false);
        };
        document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (selectedPlots.length > 0) {
            const totalWa = selectedPlots.reduce((sum, p) => sum + p.areaSqWa, 0);
            const rai = Math.floor(totalWa / 400);
            const ngan = Math.floor((totalWa % 400) / 100);
            const wa = parseFloat(((totalWa % 400) % 100).toFixed(2));
            setFormData(prev => ({ ...prev, areaRai: rai.toString(), areaNgan: ngan.toString(), areaWa: wa.toString() }));
        } else {
            setFormData(prev => ({ ...prev, areaRai: "", areaNgan: "", areaWa: "" }));
        }
    }, [selectedPlots]);

    const activeProjectData = projects.find(p => p.id === formData.projectId);
    const resolvedDeeds = Array.from(
        new Map(
            selectedPlots.flatMap(plot => {
                const zone = activeProjectData?.zones.find(z => z.id === plot.zoneId);
                return zone?.deeds?.map(d => [d.id, d]) || [];
            })
        ).values()
    ) as Deed[];

    const filteredLocations = THAI_LOCATIONS.filter(l => l.subDistrict.includes(locationQuery) || l.district.includes(locationQuery) || l.province.includes(locationQuery));

    // ค้นหาลูกค้าด้วยชื่อ หรือ เลขประจำตัว
    const cleanSearch = customerSearch.replace(/\D/g, '');
    const filteredCustomers = customers.filter(c => {
        if (!customerSearch) return true;
        const nameMatch = c.fullName.toLowerCase().includes(customerSearch.toLowerCase());
        const idMatch = cleanSearch ? c.idCard.replace(/\D/g, '').includes(cleanSearch) : false;
        return nameMatch || idMatch;
    });

    const parseNum = (val: string | number) => Number(String(val).replace(/,/g, "")) || 0;
    const formatDecimal = (value: string) => {
        let val = value.replace(/[^0-9.]/g, ""); const parts = val.split(".");
        if (parts.length > 2) val = parts[0] + "." + parts.slice(1).join("");
        if (parts[1]?.length > 2) val = parts[0] + "." + parts[1].slice(0, 2);
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ","); return parts.join(".");
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === "installmentPayDay") { const val = parseInt(value); if (val < 1 || val > 31) return; }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleNumberChange = (name: string, value: string) => {
        setFormData(prev => {
            const updated = { ...prev, [name]: value };
            if (name === "totalPrice" || name === "deposit") {
                let total = parseNum(name === "totalPrice" ? value : prev.totalPrice);
                let dep = parseNum(name === "deposit" ? value : prev.deposit);
                if (dep > total && total > 0) { dep = total; updated.deposit = total.toString(); setTimeout(() => toast.error("มัดจำเกินราคาที่ดิน ปรับให้แล้ว", { icon: "⚠️" }), 0); }
                updated.remainingPrice = Math.max(0, total - dep).toString();
            }
            return updated;
        });
    };

    const calculatePercentDeposit = () => {
        const pct = parseFloat(percentInput);
        if (!isNaN(pct)) {
            const total = parseNum(formData.totalPrice);
            const dep = (total * pct) / 100;
            handleNumberChange("deposit", dep.toString());
            setShowPercentCalc(false);
        }
    };

    const handleProjectSelect = async (projectId: string) => {
        const p = projects.find(p => p.id === projectId);
        const defaultExp = p?.transferDate ? dayjs(p.transferDate).format('YYYY-MM-DD') : "";
        setFormData(prev => ({ ...prev, projectId, entityType: p?.entityType as any || "INDIVIDUAL", customerId: "", fullName: "", idCard: "", phone: "", contractEndDate: defaultExp }));
        setCustomerSearch("");
        setIsEndDateLocked(true);
        setSelectedPlots([]);

        if (projectId) {
            const res = await fetch(`/api/plots?projectId=${projectId}`);
            if (res.ok) {
                const data = await res.json();
                setAvailablePlots(data.filter((plot: Plot) => plot.status === "ว่าง"));
            }
        } else {
            setAvailablePlots([]);
        }
    };

    const handleOpenCustomerDropdown = async () => {
        setShowLocationCustomer(!showCustomerDropdown);
        if (!showCustomerDropdown) await fetchCustomers();
    };

    const selectCustomer = (cust: Customer) => {
        setFormData(prev => ({ ...prev, customerId: cust.id, fullName: cust.fullName, idCard: cust.idCard, phone: cust.phone || "" }));
        setCustomerSearch("");
        setShowLocationCustomer(false);
    };

    const openCustomerModal = (cust?: Customer) => {
        if (cust) {
            setEditingCustId(cust.id); setIsCorporateCust(cust.isCorporate);
            setCustomerForm({ fullName: cust.fullName, idCard: cust.idCard, birthDate: cust.birthDate ? dayjs(cust.birthDate).format('YYYY-MM-DD') : "", phone: cust.phone || "", secondaryPhone: cust.secondaryPhone || "", addressNumber: cust.addressNumber || "", moo: cust.moo || "", subDistrict: cust.subDistrict || "", district: cust.district || "", province: cust.province || "" });
        } else {
            setEditingCustId(null); setIsCorporateCust(formData.entityType === 'CORPORATE');
            setCustomerForm({ fullName: "", idCard: "", birthDate: "", phone: "", secondaryPhone: "", addressNumber: "", moo: "", subDistrict: "", district: "", province: "" });
        }
        setShowLocationCustomer(false); setIsCustomerModalOpen(true);
    };

    const saveCustomer = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        try {
            const res = await fetch("/api/customers", { method: editingCustId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...customerForm, id: editingCustId, isCorporate: isCorporateCust }) });
            if (res.ok) {
                const savedCust = await res.json(); toast.success(editingCustId ? "อัปเดตข้อมูลลูกค้าสำเร็จ" : "เพิ่มลูกค้าสำเร็จ");
                await fetchCustomers(); selectCustomer(savedCust); setIsCustomerModalOpen(false);
            } else toast.error((await res.json()).error || "เกิดข้อผิดพลาด");
        } catch (error) { toast.error("ระบบขัดข้อง"); } setLoading(false);
    };

    const saveBank = async (e: React.FormEvent) => {
        e.preventDefault(); setLoading(true);
        const body = JSON.stringify({ bankName: `${selectedBankIcon.symbol} - ${selectedBankIcon.name}`, logoUrl: selectedBankIcon.icon, accountName: bankForm.accountName, accountNumber: bankForm.accountNumber });
        try {
            const res = await fetch("/api/banks", { method: "POST", headers: { "Content-Type": "application/json" }, body });
            if (res.ok) { toast.success("เพิ่มบัญชีสำเร็จ"); await fetchBanks(); setIsBankModalOpen(false); setBankForm({ bankName: "", accountNumber: "", accountName: "" }); } else toast.error("เกิดข้อผิดพลาด");
        } catch (error) { toast.error("ระบบขัดข้อง"); } setLoading(false);
    };

    const handleTransferChange = (index: number, field: string, value: any) => {
        const newTransfers = [...transfers];
        if (field === 'bankId' && newTransfers.some((t, i) => i !== index && t.bankId === value && value !== "")) return toast.error("บัญชีธนาคารนี้ถูกเลือกไปแล้ว");
        newTransfers[index] = { ...newTransfers[index], [field]: value };
        setTransfers(newTransfers);
    };

    const handleDrop = (e: React.DragEvent<HTMLLabelElement>, index: number) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
            handleTransferChange(index, "file", file);
        } else { toast.error("กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น"); }
    };

    const validTransfers = transfers.filter(t => t.bankId);
    const totalTransfers = validTransfers.reduce((sum, t) => sum + parseNum(t.amount), 0);
    const totalReceive = parseNum(formData.cashReceive) + totalTransfers;
    const depositPercent = parseNum(formData.totalPrice) > 0 ? ((parseNum(formData.deposit) / parseNum(formData.totalPrice)) * 100).toFixed(2) : "0.00";
    const previewInstallment = (parseNum(formData.remainingPrice) / (parseInt(formData.installmentsCount) || 1)).toLocaleString('en-US', { maximumFractionDigits: 2 });

    const isStepValid = () => {
        if (step === 1) return formData.projectId && selectedPlots.length > 0 && formData.contractDate;
        if (step === 2) {
            if (!formData.customerId || !formData.totalPrice || !formData.deposit) return false;
            if (parseNum(formData.deposit) !== totalReceive) return false;
            for (const t of validTransfers) { if (!t.amount || parseNum(t.amount) <= 0 || !t.file) return false; }
            if (formData.contractType === 'INSTALLMENT') { if (!formData.installmentsCount || !formData.installmentAmount || !formData.installmentStartDate || !formData.installmentPayDay) return false; }
            return true;
        }
        return true;
    };

    const nextStep = () => {
        if (!isStepValid()) {
            if (step === 1) return toast.error("กรุณาเลือกโครงการและแปลงที่ดินอย่างน้อย 1 แปลง");
            if (step === 2) {
                if (!formData.customerId) return toast.error("กรุณาเลือกลูกค้า");
                const dep = parseNum(formData.deposit);
                if (dep !== totalReceive) return toast.error(`ยอดรับชำระต้องเท่ากับเงินมัดจำ (${formatDecimal(dep.toString())} บาท)`);
                for (const t of validTransfers) { if (!t.amount || parseNum(t.amount) <= 0 || !t.file) return toast.error("กรุณากรอกจำนวนเงินและแนบสลิปให้ครบสำหรับบัญชีที่เลือก"); }
                return toast.error("กรุณากรอกข้อมูลราคาและรูปแบบการชำระให้ครบถ้วน");
            }
        }
        setStep(prev => Math.min(prev + 1, 3)); window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSubmit = async () => {
        if (!isStepValid()) return;
        setLoading(true);
        const fd = new FormData();
        const payloadToSubmit = {
            ...formData,
            plotIds: selectedPlots.map(p => p.id),
            plotName: selectedPlots.map(p => p.plotName).join(", "),
            deedIds: resolvedDeeds.map(d => d.id),
            transfers: validTransfers.map(t => ({ bankId: t.bankId, amount: t.amount }))
        };
        fd.append("data", JSON.stringify(payloadToSubmit));
        validTransfers.forEach((t, i) => { if (t.file) fd.append(`slip_${i}`, t.file); });

        try {
            const res = await fetch("/api/contracts", { method: "POST", body: fd });
            if (res.ok) { toast.success("บันทึกสัญญาเรียบร้อย!"); router.push("/contracts"); }
            else toast.error("เกิดข้อผิดพลาดในการบันทึก");
        } catch (err) { toast.error("ระบบขัดข้อง"); } finally { setLoading(false); }
    };

    if (!setupCheck.isChecking && (!setupCheck.hasProjects || !setupCheck.hasTemplates)) {
        return (
            <div className="max-w-3xl mx-auto mt-20 p-10 bg-white/80 backdrop-blur-xl rounded-3xl border border-red-200 shadow-2xl text-center"><div className="w-24 h-24 bg-red-100/50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner"><AlertTriangle size={48} /></div><h1 className="text-3xl font-black text-slate-800">ระบบยังไม่พร้อมใช้งาน</h1><p className="text-slate-600 mt-3 text-lg">คุณต้องตั้งค่า โครงการ, โซน, โฉนด และอัปโหลดเทมเพลตสัญญาให้เรียบร้อยก่อน</p><div className="pt-8 flex justify-center gap-4"><Link href="/settings" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl flex gap-2 cursor-pointer hover:bg-blue-700 shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-1"><Settings size={20} /> ไปหน้าตั้งค่าระบบ</Link></div></div>
        );
    }

    const highlightText = (text: string, query: string) => {
        if (!query) return text;
        const parts = text.split(new RegExp(`(${query})`, 'gi'));
        return parts.map((p, i) => p.toLowerCase() === query.toLowerCase() ? <span key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{p}</span> : p);
    };

    return (
        <div className="max-w-6xl mx-auto pb-24 bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen px-4 py-8 relative">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-5 mb-12">
                    <Link href="/contracts" className="p-3.5 bg-white border border-slate-200 shadow-sm hover:shadow-md hover:bg-blue-50/50 rounded-2xl transition-all text-slate-600 hover:text-blue-600 cursor-pointer"><ArrowLeft size={24} /></Link>
                    <div><h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">สร้างสัญญาใหม่ <Sparkles className="text-amber-400" size={24} /></h1><p className="text-slate-500 text-sm mt-1.5 flex items-center gap-1.5 font-medium"><FileText size={16} className="text-blue-500" /> ระบบสร้างเอกสารอัจฉริยะ (Smart Contract Generator)</p></div>
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-between w-full max-w-xl mx-auto mb-16 relative z-0">
                    <div className="flex flex-col items-center gap-3 relative z-10 w-16 group">
                        <div className={`w-14 h-14 flex items-center justify-center rounded-2xl font-bold transition-all duration-500 shadow-md ${step > 1 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30' : step === 1 ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30 ring-4 ring-blue-100 scale-110' : 'bg-white text-slate-400 border-2 border-slate-100'}`}>
                            {step > 1 ? <Check size={24} strokeWidth={3} /> : <MapPin size={24} />}
                        </div>
                        <span className={`absolute top-16 text-sm font-bold whitespace-nowrap transition-colors ${step > 1 ? 'text-emerald-600' : step === 1 ? 'text-blue-600' : 'text-slate-400'}`}>ข้อมูลแปลง</span>
                    </div>
                    <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 -mt-1 ${step >= 2 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-slate-200'}`}></div>

                    <div className="flex flex-col items-center gap-3 relative z-10 w-16 group">
                        <div className={`w-14 h-14 flex items-center justify-center rounded-2xl font-bold transition-all duration-500 shadow-md ${step > 2 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30' : step === 2 ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30 ring-4 ring-blue-100 scale-110' : 'bg-white text-slate-400 border-2 border-slate-100'}`}>
                            {step > 2 ? <Check size={24} strokeWidth={3} /> : <User size={24} />}
                        </div>
                        <span className={`absolute top-16 text-sm font-bold whitespace-nowrap transition-colors ${step > 2 ? 'text-emerald-600' : step === 2 ? 'text-blue-600' : 'text-slate-400'}`}>ลูกค้า & ราคา</span>
                    </div>
                    <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 -mt-1 ${step >= 3 ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]' : 'bg-slate-200'}`}></div>

                    <div className="flex flex-col items-center gap-3 relative z-10 w-16 group">
                        <div className={`w-14 h-14 flex items-center justify-center rounded-2xl font-bold transition-all duration-500 shadow-md ${step > 3 ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-emerald-500/30' : step === 3 ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-blue-500/30 ring-4 ring-blue-100 scale-110' : 'bg-white text-slate-400 border-2 border-slate-100'}`}>
                            {step > 3 ? <Check size={24} strokeWidth={3} /> : <FileText size={24} />}
                        </div>
                        <span className={`absolute top-16 text-sm font-bold whitespace-nowrap transition-colors ${step > 3 ? 'text-emerald-600' : step === 3 ? 'text-blue-600' : 'text-slate-400'}`}>ตรวจสอบ</span>
                    </div>
                </div>

                {/* ================= STEP 1: โครงการ & แปลง ================= */}
                {step === 1 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/50 z-10 relative">
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-6 border-b border-slate-100/80 gap-4">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3"><MapPin className="text-blue-600" size={28} /> ข้อมูลโครงการและแปลง</h2>
                                    <p className="text-slate-500 text-sm mt-1 ml-10">เลือกระบุโครงการและแปลงที่ดิน ระบบจะคำนวณเนื้อที่และดึงโฉนดให้อัตโนมัติ</p>
                                </div>
                                <div className="flex items-center gap-3 bg-blue-50/50 px-4 py-2 rounded-2xl border border-blue-100"><span className="text-sm font-bold text-slate-600">วันที่ทำสัญญา:</span><BuddhistDatePicker value={formData.contractDate} onChange={(date) => setFormData(p => ({ ...p, contractDate: date }))} align="right" /></div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-2 relative z-20">
                                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider ml-1">โครงการ (Project) <span className="text-red-500">*</span></label>
                                    <select name="projectId" value={formData.projectId} onChange={(e) => handleProjectSelect(e.target.value)} className={`w-full px-5 py-4 border rounded-2xl outline-none cursor-pointer focus:ring-4 focus:ring-blue-500/20 transition-all font-bold text-lg ${formData.projectId ? 'bg-blue-50/50 border-blue-200 text-blue-900' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-400'}`}><option value="">-- กรุณาเลือกโครงการ --</option>{projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.entityType === 'CORPORATE' ? 'นิติบุคคล' : 'บุคคล'})</option>)}</select>
                                </div>

                                <div className="space-y-3 p-6 bg-slate-50/50 border border-slate-200 rounded-3xl relative overflow-hidden group z-10">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -z-10 group-hover:bg-blue-500/10 transition-colors"></div>
                                    <div className="flex justify-between items-center z-10 relative">
                                        <div>
                                            <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">แปลงที่ดิน (Plots) <span className="text-red-500">*</span></label>
                                            <p className="text-xs text-slate-500 mt-1 font-medium">เลือกได้มากกว่า 1 แปลง ระบบจะรวมพื้นที่ให้อัตโนมัติ</p>
                                        </div>
                                        <button type="button" onClick={() => setIsPlotModalOpen(true)} disabled={!formData.projectId} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl cursor-pointer disabled:opacity-50 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-2">
                                            <Layers size={16} /> เลือกแปลง
                                        </button>
                                    </div>

                                    <div className="min-h-[100px] flex flex-wrap gap-3 mt-4 z-10 relative">
                                        {selectedPlots.length === 0 ? (
                                            <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-slate-300 rounded-2xl bg-white/50 text-slate-400 font-bold p-8">ยังไม่ได้เลือกแปลงที่ดิน</div>
                                        ) :
                                            selectedPlots.map(p => (
                                                <div key={p.id} className="bg-white border-2 border-blue-500 text-blue-900 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-md shadow-blue-500/10 group-hover:border-blue-600 transition-colors">
                                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center"><MapPin size={16} /></div>
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-lg leading-tight">{p.plotName}</span>
                                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded w-max mt-0.5">{p.areaSqWa} ตร.ว.</span>
                                                    </div>
                                                    <button type="button" onClick={() => setSelectedPlots(selectedPlots.filter(s => s.id !== p.id))} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors ml-2 cursor-pointer"><X size={16} /></button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>

                                {resolvedDeeds.length > 0 && (
                                    <div className="p-5 bg-teal-50/50 border border-teal-200 rounded-2xl flex flex-col gap-3 animate-in zoom-in-95">
                                        <div className="flex items-center gap-2 text-teal-800 font-bold"><CheckCircle2 size={18} /> โฉนดที่เชื่อมโยงอัตโนมัติ ({resolvedDeeds.length} ฉบับ)</div>
                                        <div className="flex flex-wrap gap-2">
                                            {resolvedDeeds.map(d => (
                                                <span key={d.id} className="bg-white border border-teal-300 text-teal-700 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">โฉนดเลขที่ {d.deedNumber}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {selectedPlots.length > 0 && resolvedDeeds.length === 0 && (
                                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3 animate-pulse">
                                        <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                                        <p className="text-sm font-bold text-amber-700">แปลงที่คุณเลือกยังไม่มีการผูกโฉนดในระบบ (สามารถทำสัญญาต่อได้ แต่ข้อมูลโฉนดจะว่างเปล่าในเอกสาร)</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= STEP 2: ลูกค้า & ราคา ================= */}
                {step === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 relative z-10">
                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/50 relative z-50">
                            <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3 mb-8 pb-6 border-b border-slate-100/80"><User className="text-indigo-500" size={28} /> 2.1 ข้อมูลลูกค้า ({formData.entityType === 'CORPORATE' ? 'นิติบุคคล' : 'บุคคลธรรมดา'})</h2>

                            <div className="mb-6 relative z-50" ref={customerRef}>
                                <label className="text-sm font-bold text-slate-700 mb-2 block ml-1 uppercase tracking-wider">ค้นหาหรือเพิ่มลูกค้าใหม่ <span className="text-red-500">*</span></label>
                                <div className={`w-full px-5 py-4 border rounded-2xl flex justify-between items-center cursor-pointer transition-all shadow-sm group ${formData.customerId ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:shadow-indigo-500/10'}`} onClick={handleOpenCustomerDropdown}>
                                    <div className={`flex items-center gap-3 font-bold text-lg ${formData.customerId ? 'text-indigo-900' : 'text-slate-500'}`}>
                                        <User size={24} className={formData.customerId ? 'text-indigo-600' : 'text-slate-400'} />
                                        {formData.customerId ? `${formData.fullName} (บัตร: ${formData.idCard})` : "-- เลือกลูกค้าในระบบ --"}
                                    </div>
                                    <ChevronDown size={20} className={`text-slate-400 transition-transform duration-300 ${showCustomerDropdown ? 'rotate-180 text-indigo-500' : 'group-hover:text-indigo-500'}`} />
                                </div>

                                {showCustomerDropdown && (
                                    <div className="absolute z-[60] w-full mt-3 bg-white/95 backdrop-blur-xl border border-slate-200/60 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
                                        <div className="p-4 border-b border-slate-100/80 bg-slate-50/50">
                                            <div className="relative">
                                                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input type="text" value={customerSearch} onChange={e => setCustomerSearch(e.target.value)} placeholder="พิมพ์ชื่อหรือเลขประจำตัว..." className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/30 text-sm font-medium transition-all" autoFocus />
                                            </div>
                                        </div>
                                        <div className="max-h-64 overflow-y-auto p-3 space-y-2 bg-white/50">
                                            {filteredCustomers.map(c => {
                                                const isSelected = formData.customerId === c.id;
                                                return (
                                                    <div key={c.id} className={`p-4 rounded-2xl flex items-center justify-between transition-all border group/item cursor-pointer ${isSelected ? 'bg-indigo-50 border-indigo-300 shadow-sm' : 'bg-white border-transparent hover:bg-indigo-50/50 hover:border-indigo-100'}`} onClick={() => selectCustomer(c)}>
                                                        <div className="flex items-center gap-4 flex-1">
                                                            <div className={`w-12 h-12 shadow-sm border border-slate-100 rounded-full flex items-center justify-center ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-50 group-hover/item:bg-white text-indigo-400'}`}>
                                                                {c.isCorporate ? <Building2 size={20} /> : <User size={20} />}
                                                            </div>
                                                            <div>
                                                                <p className={`font-bold text-base ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>{c.fullName}</p>
                                                                <p className="text-xs text-slate-500 font-medium mt-0.5">{c.idCard}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            {isSelected && <CheckCircle2 size={24} className="text-indigo-600" />}
                                                            <button type="button" onClick={(e) => { e.stopPropagation(); openCustomerModal(c); }} className="p-2.5 text-slate-300 hover:text-amber-500 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer" title="แก้ไขข้อมูลลูกค้า"><Edit3 size={18} /></button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {filteredCustomers.length === 0 && <div className="p-8 text-center flex flex-col items-center justify-center text-slate-400"><Search size={32} className="mb-3 opacity-20" /><span className="font-bold text-lg">ไม่พบรายชื่อในระบบ</span><span className="text-sm mt-1">กดปุ่มด้านล่างเพื่อเพิ่มลูกค้าใหม่</span></div>}
                                        </div>
                                        <div className="p-3 border-t border-slate-100 bg-slate-50/80">
                                            <button type="button" onClick={() => openCustomerModal()} className="w-full p-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-indigo-600/30 active:scale-95"><Plus size={20} /> สร้างโปรไฟล์ลูกค้าใหม่</button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-xl border border-white/50 relative z-40">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 pb-6 border-b border-slate-100/80 gap-4">
                                <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3"><Banknote className="text-emerald-500" size={28} /> 2.2 ข้อมูลราคาและการชำระ</h2>
                                <div className="flex bg-slate-100/80 rounded-2xl p-1 border border-slate-200 shadow-inner">
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, contractType: "CASH" }))} className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${formData.contractType === "CASH" ? "bg-white text-emerald-600 shadow-md scale-105" : "text-slate-500 hover:text-slate-800"}`}>สัญญาสด</button>
                                    <button type="button" onClick={() => setFormData(p => ({ ...p, contractType: "INSTALLMENT" }))} className={`px-8 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${formData.contractType === "INSTALLMENT" ? "bg-white text-emerald-600 shadow-md scale-105" : "text-slate-500 hover:text-slate-800"}`}>สัญญาผ่อน</button>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-5 mb-8 bg-slate-50/50 p-6 rounded-[2rem] border border-slate-200/60 shadow-sm relative overflow-hidden">
                                <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">จำนวน ไร่</label><NumericFormat readOnly value={formData.areaRai} className="w-full px-5 py-4 border border-slate-200 bg-white text-slate-800 rounded-2xl text-right outline-none font-black text-xl shadow-sm" placeholder="0" /></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">จำนวน งาน</label><NumericFormat readOnly value={formData.areaNgan} className="w-full px-5 py-4 border border-slate-200 bg-white text-slate-800 rounded-2xl text-right outline-none font-black text-xl shadow-sm" placeholder="0" /></div>
                                <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">จำนวน ตร.ว.</label><NumericFormat readOnly value={formData.areaWa} className="w-full px-5 py-4 border border-slate-200 bg-white text-slate-800 rounded-2xl text-right outline-none font-black text-xl shadow-sm" placeholder="0.0" /></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2"><label className="text-sm font-bold text-slate-700 ml-1">ค่าที่ทั้งหมด (บาท) <span className="text-red-500">*</span></label><NumericFormat value={formData.totalPrice} onValueChange={(v) => handleNumberChange("totalPrice", v.value || "")} thousandSeparator decimalScale={2} fixedDecimalScale className="w-full px-5 py-4 border border-blue-200 rounded-2xl text-right font-black text-blue-700 text-2xl outline-none focus:ring-4 focus:ring-blue-500/20 shadow-sm bg-blue-50/30 transition-all" placeholder="0.00" /></div>

                                <div className="space-y-2 relative" ref={percentCalcRef}>
                                    <div className="flex justify-between items-center ml-1">
                                        <label className="text-sm font-bold text-slate-700">มัดจำ (บาท) <span className="text-red-500">*</span></label>
                                        <button type="button" onClick={() => setShowPercentCalc(!showPercentCalc)} className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm">
                                            <Calculator size={14} /> {depositPercent}%
                                        </button>
                                    </div>
                                    <NumericFormat value={formData.deposit} onValueChange={(v) => handleNumberChange("deposit", v.value || "")} thousandSeparator decimalScale={2} fixedDecimalScale className="w-full px-5 py-4 border border-amber-200 rounded-2xl text-right font-black text-amber-600 text-2xl outline-none focus:ring-4 focus:ring-amber-500/20 shadow-sm bg-amber-50/30 transition-all" placeholder="0.00" />

                                    {showPercentCalc && (
                                        <div className="absolute top-12 right-0 mt-2 p-5 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-2xl z-30 w-72 animate-in zoom-in-95">
                                            <label className="text-xs font-bold text-slate-500 mb-3 block uppercase tracking-wider">คำนวณมัดจำอัตโนมัติ</label>
                                            <div className="flex gap-2">
                                                <div className="relative flex-1">
                                                    <input type="number" value={percentInput} onChange={e => setPercentInput(e.target.value)} placeholder="ระบุ %" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl text-lg font-bold outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 transition-all" />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                                </div>
                                                <button type="button" onClick={calculatePercentDeposit} className="px-5 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-bold hover:bg-amber-600 cursor-pointer shadow-md transition-transform active:scale-95">ตกลง</button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2"><label className="text-sm font-bold text-slate-700 ml-1">ค้างชำระ (บาท)</label><NumericFormat readOnly value={formData.remainingPrice} thousandSeparator decimalScale={2} fixedDecimalScale className="w-full px-5 py-4 border border-slate-200 rounded-2xl bg-slate-100/80 text-right font-black text-slate-500 text-2xl cursor-not-allowed outline-none shadow-inner" placeholder="0.00" /></div>
                            </div>

                            {formData.contractType === "INSTALLMENT" && (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8 pt-8 border-t border-slate-100/80 animate-in fade-in zoom-in-95 relative z-30">
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white text-xs font-bold text-slate-400 px-3 rounded-full border border-slate-100">ตั้งค่าการผ่อนชำระ</div>
                                    <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">จำนวนงวด *</label><NumericFormat value={formData.installmentsCount} onValueChange={(v) => handleNumberChange("installmentsCount", v.value || "")} className="w-full px-4 py-3 border border-indigo-200 rounded-xl text-right outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50/50 font-bold text-indigo-900 text-lg" /></div>
                                    <div className="space-y-2"><div className="flex justify-between items-center ml-1"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider">ค่าผ่อน / งวด *</label><span className="text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">แนะนำ: {previewInstallment}</span></div><NumericFormat value={formData.installmentAmount} onValueChange={(v) => handleNumberChange("installmentAmount", v.value || "")} thousandSeparator decimalScale={2} fixedDecimalScale className="w-full px-4 py-3 border border-indigo-200 rounded-xl text-right outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-600 bg-indigo-50/50 text-lg" /></div>
                                    <div className="space-y-2 relative z-[110]"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">วันที่เริ่มผ่อน *</label>
                                        <BuddhistDatePicker value={formData.installmentStartDate} onChange={(date) => setFormData(p => ({ ...p, installmentStartDate: date }))} fullWidth={true} align="right" />
                                    </div>
                                    <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">ผ่อนทุกวันที่ * <span className="font-normal">(1-31)</span></label><input type="number" min="1" max="31" name="installmentPayDay" value={formData.installmentPayDay} onChange={handleInputChange} placeholder="1-31" className="w-full px-4 py-3 border border-indigo-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-indigo-50/50 font-bold text-indigo-900 text-lg" /></div>
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 mt-6 p-6 border border-slate-200/60 rounded-[2rem] bg-white/80 backdrop-blur-xl shadow-lg relative z-20">
                            <div className="flex justify-between items-center mb-1 pl-2">
                                <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><CalendarIcon size={16} className="text-blue-500" /> วันที่นัดโอนกรรมสิทธิ์ / วันสิ้นสุดสัญญา</label>
                                <button type="button" onClick={() => setIsEndDateLocked(!isEndDateLocked)} className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 text-slate-500 transition-all cursor-pointer shadow-sm group">
                                    <Edit3 size={16} className="group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                            {isEndDateLocked ? (
                                <div className="w-full px-5 py-4 border border-slate-200 rounded-2xl bg-slate-50/80 text-slate-500 font-bold cursor-not-allowed shadow-inner flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                                    {formData.contractEndDate ? dayjs(formData.contractEndDate).format('D MMMM BBBB') : "ไม่ได้กำหนด (จะอิงตามการตั้งค่าโครงการ)"}
                                </div>
                            ) : (
                                <div className="relative z-[100]"><BuddhistDatePicker value={formData.contractEndDate} onChange={(date) => setFormData(p => ({ ...p, contractEndDate: date }))} fullWidth /></div>
                            )}
                        </div>

                        <div className="bg-slate-900 p-8 rounded-[2rem] shadow-2xl border border-slate-800 text-white relative overflow-hidden group z-10">
                            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[80px] group-hover:bg-emerald-500/20 transition-colors duration-1000"></div>
                            <div className="absolute bottom-0 left-0 w-60 h-60 bg-blue-500/10 rounded-full blur-[60px]"></div>

                            <h2 className="text-2xl font-black flex items-center gap-3 mb-8 pb-6 border-b border-slate-700/80 relative z-10"><Banknote className="text-emerald-400" size={32} /> 2.3 รับชำระเงินมัดจำ</h2>

                            <div className="space-y-6 max-w-4xl mx-auto relative z-10">
                                <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 shadow-inner">
                                    <label className="text-sm font-bold flex justify-between items-center mb-3 text-slate-300">รับเป็นเงินสด (Cash) <span className="text-xs font-medium text-slate-500 bg-slate-900 px-2 py-1 rounded-lg">THB</span></label>
                                    <NumericFormat value={formData.cashReceive} onValueChange={(v) => handleNumberChange("cashReceive", v.value || "")} thousandSeparator decimalScale={2} fixedDecimalScale className="w-full px-6 py-5 bg-slate-950/80 border border-slate-600/80 rounded-2xl text-right font-black text-3xl text-emerald-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner" placeholder="0.00" />
                                </div>

                                <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700 space-y-5 shadow-inner">
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-700/80">
                                        <label className="text-sm font-bold text-slate-200 flex items-center gap-2">รับเป็นเงินโอน (Transfer) <span className="text-xs font-normal text-slate-500 bg-slate-900 px-2 py-0.5 rounded-md hidden sm:block">ถ้าไม่เลือกธนาคาร ระบบจะไม่นับยอด</span></label>
                                        <button type="button" onClick={() => setTransfers([...transfers, { bankId: "", amount: "", file: null }])} className="text-sm font-bold bg-blue-600 hover:bg-blue-500 px-5 py-2.5 rounded-xl flex items-center gap-2 transition-transform active:scale-95 cursor-pointer text-white shadow-lg shadow-blue-900/50"><Plus size={18} /> เพิ่มรายการโอน</button>
                                    </div>

                                    {transfers.map((t, idx) => (
                                        <div key={idx} className={`p-6 rounded-3xl border grid grid-cols-1 md:grid-cols-2 gap-6 relative animate-in slide-in-from-top-4 transition-all duration-300 ${t.bankId ? 'bg-slate-800/90 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'bg-slate-900/50 border-slate-700/80'}`}>
                                            <button type="button" onClick={() => setTransfers(transfers.filter((_, i) => i !== idx))} className="absolute -top-3 -right-3 bg-red-500 p-2.5 rounded-full text-white hover:bg-red-400 shadow-xl shadow-red-900/50 cursor-pointer z-20 hover:scale-110 transition-transform"><Trash2 size={16} /></button>

                                            <div className="space-y-2 relative z-[70]"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">บัญชีที่รับโอน *</label>
                                                <div className="flex gap-3 relative">
                                                    <div className="relative flex-1">
                                                        <div onClick={() => setOpenTransferBankIdx(openTransferBankIdx === idx ? null : idx)}
                                                            className={`w-full px-5 py-4 border rounded-2xl text-base outline-none cursor-pointer font-bold transition-all flex justify-between items-center ${t.bankId ? 'bg-blue-900/30 border-blue-500/60 text-blue-200 shadow-inner' : 'bg-slate-950 border-slate-600 text-slate-300 hover:border-slate-500'}`}>
                                                            {t.bankId ? (
                                                                <div className="flex items-center gap-3">
                                                                    <img src={banks.find(b => b.id === t.bankId)?.logoUrl || ""} className="w-6 h-6 object-contain drop-shadow-md" />
                                                                    <span className="tracking-widest">{banks.find(b => b.id === t.bankId)?.accountNumber} <span className="text-[10px] text-blue-400 font-medium ml-2 hidden sm:inline">- {banks.find(b => b.id === t.bankId)?.accountName}</span></span>
                                                                </div>
                                                            ) : <span className="text-slate-500">-- เลือกบัญชี --</span>}
                                                            <ChevronDown size={18} className="text-slate-400" />
                                                        </div>

                                                        {openTransferBankIdx === idx && (
                                                            <div className="absolute z-[100] w-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                                                                {banks.map(b => (
                                                                    <div key={b.id} onClick={() => { handleTransferChange(idx, "bankId", b.id); setOpenTransferBankIdx(null); }} className="px-5 py-3 hover:bg-blue-50 flex items-center gap-4 cursor-pointer border-b border-slate-100 last:border-0 transition-colors">
                                                                        <img src={b.logoUrl || ""} className="w-8 h-8 object-contain drop-shadow-sm" />
                                                                        <div className="flex flex-col">
                                                                            <span className="text-base font-black text-slate-800 tracking-wider">{b.accountNumber}</span>
                                                                            <span className="text-xs font-bold text-slate-500">{b.accountName}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button type="button" onClick={() => setIsBankModalOpen(true)} className="w-14 h-14 flex items-center justify-center bg-slate-700 hover:bg-slate-600 rounded-2xl text-white cursor-pointer transition-all border border-slate-600 hover:border-slate-500 shadow-md active:scale-95" title="เพิ่มบัญชีใหม่"><Plus size={22} /></button>
                                                </div>
                                            </div>

                                            <div className="space-y-2"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">จำนวนเงิน (THB) *</label>
                                                <NumericFormat disabled={!t.bankId} value={t.amount} onValueChange={(v) => handleTransferChange(idx, "amount", v.value || "")} thousandSeparator decimalScale={2} fixedDecimalScale className="w-full px-5 py-4 bg-slate-950 border border-slate-600 rounded-2xl text-right font-black text-2xl text-blue-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:opacity-40 disabled:cursor-not-allowed shadow-inner transition-all" placeholder="0.00" />
                                            </div>

                                            {t.bankId && (
                                                <div className="md:col-span-2 mt-2 animate-in zoom-in-95 duration-300">
                                                    <label
                                                        onDragOver={(e) => e.preventDefault()}
                                                        onDrop={(e) => handleDrop(e, idx)}
                                                        className={`w-full border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer relative overflow-hidden group/drop ${t.file ? 'border-emerald-500/70 bg-emerald-500/10' : 'border-slate-500 bg-slate-900/50 hover:border-blue-400 hover:bg-blue-900/20'}`}>
                                                        {t.file ? (
                                                            <>
                                                                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/20 to-transparent"></div>
                                                                <FileText size={36} className="mb-3 text-emerald-400 drop-shadow-md group-hover/drop:scale-110 transition-transform" />
                                                                <p className="text-base font-bold text-emerald-300 relative z-10">{t.file.name}</p>
                                                                <p className="text-xs text-emerald-500/70 mt-1.5 font-medium relative z-10">คลิก หรือ ลากไฟล์ใหม่มาวางเพื่อเปลี่ยน</p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <UploadCloud size={40} className="mb-4 text-blue-400 opacity-80 group-hover/drop:scale-110 group-hover/drop:text-blue-300 transition-all" />
                                                                <p className="text-base font-bold text-blue-300 mb-1.5">แนบสลิปโอนเงิน (Slip) *</p>
                                                                <p className="text-sm text-slate-400">คลิกเพื่อเลือกไฟล์ หรือ ลากไฟล์ (PNG, JPG) มาวางที่นี่</p>
                                                            </>
                                                        )}
                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleTransferChange(idx, "file", e.target.files?.[0] || null)} />
                                                    </label>
                                                </div>
                                            )}
                                        </div>
                                    ))}

                                    <div className="pt-6 mt-4 border-t border-slate-700/80 flex justify-between items-center bg-slate-950/50 p-5 rounded-2xl shadow-inner">
                                        <span className="text-slate-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2"><CheckCircle2 size={16} className={totalReceive === parseNum(formData.deposit) ? "text-emerald-500" : "text-slate-600"} /> ยอดรับชำระสุทธิ:</span>
                                        <span className={`font-black text-3xl tracking-tight ${totalReceive === parseNum(formData.deposit) ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'text-red-400'}`}>{formatDecimal(totalReceive.toString())} ฿</span>
                                    </div>
                                    {totalReceive !== parseNum(formData.deposit) && formData.deposit && (
                                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 mt-3 animate-pulse">
                                            <AlertTriangle size={20} className="text-red-400 shrink-0" />
                                            <p className="text-sm text-red-300 font-medium leading-relaxed">ยอดชำระจริง ({formatDecimal(totalReceive.toString())} ฿) ยังไม่ตรงกับเงินมัดจำที่ตั้งไว้ ({formatDecimal(formData.deposit)} ฿)</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ================= STEP 3: ตรวจสอบสรุปข้อมูล ================= */}
                {step === 3 && (
                    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
                        <div className="bg-white/90 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-2xl border border-white flex flex-col items-center">
                            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6 shadow-inner"><FileText size={40} /></div>
                            <h2 className="text-3xl font-black text-slate-800 text-center mb-2">ตรวจสอบสัญญา</h2>
                            <p className="text-slate-500 mb-10 text-center">กรุณาตรวจสอบข้อมูลให้ครบถ้วนก่อนกดสร้างเอกสาร</p>

                            <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
                                <div className="space-y-6 bg-slate-50/80 p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
                                    <h3 className="font-black text-blue-700 flex items-center gap-2 pb-4 border-b border-slate-200 text-lg uppercase tracking-wider"><MapPin size={22} /> ทรัพย์สิน (Property)</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end border-b border-slate-100 pb-2"><span className="text-slate-500 font-medium">โครงการ</span><span className="font-bold text-slate-800 text-right">{projects.find(p => p.id === formData.projectId)?.name || "-"}</span></div>
                                        <div className="flex justify-between items-end border-b border-slate-100 pb-2"><span className="text-slate-500 font-medium">แปลงที่ขาย</span><span className="font-black text-blue-700 bg-blue-100 px-3 py-1 rounded-lg text-right">{selectedPlots.map(p => p.plotName).join(', ')}</span></div>
                                        <div className="flex justify-between items-end border-b border-slate-100 pb-2"><span className="text-slate-500 font-medium">โฉนดอ้างอิง</span><span className="font-bold text-slate-800 text-right">{resolvedDeeds.length} ฉบับ</span></div>
                                        <div className="flex justify-between items-end pb-1"><span className="text-slate-500 font-medium">พื้นที่รวม</span><span className="font-bold text-slate-800 text-right">{formData.areaRai || 0} ไร่ {formData.areaNgan || 0} งาน {formData.areaWa || 0} ตร.ว.</span></div>
                                    </div>
                                </div>

                                <div className="space-y-6 bg-slate-50/80 p-8 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-2 h-full bg-indigo-500"></div>
                                    <h3 className="font-black text-indigo-700 flex items-center gap-2 pb-4 border-b border-slate-200 text-lg uppercase tracking-wider"><User size={22} /> ผู้ซื้อ (Customer)</h3>
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end border-b border-slate-100 pb-2"><span className="text-slate-500 font-medium">ชื่อ-นามสกุล</span><span className="font-bold text-slate-800 text-right">{formData.fullName} <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600 ml-1">{formData.entityType === 'CORPORATE' ? 'นิติ' : 'บุคคล'}</span></span></div>
                                        <div className="flex justify-between items-end border-b border-slate-100 pb-2"><span className="text-slate-500 font-medium">เลขประจำตัว</span><span className="font-bold text-slate-800 text-right">{formData.idCard}</span></div>
                                        <div className="flex justify-between items-end border-b border-slate-100 pb-2"><span className="text-slate-500 font-medium">เบอร์โทรศัพท์</span><span className="font-bold text-slate-800 text-right">{formData.phone}</span></div>
                                        <div className="flex justify-between items-end pb-1"><span className="text-slate-500 font-medium">วันที่ทำสัญญา</span><span className="font-bold text-slate-800 text-right">{dayjs(formData.contractDate).format('D MMM BBBB')}</span></div>
                                    </div>
                                </div>
                            </div>

                            <div className="w-full max-w-3xl mt-8 bg-slate-900 p-8 sm:p-10 rounded-[2.5rem] shadow-2xl border border-slate-800 text-white relative overflow-hidden">
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/20 rounded-full blur-[60px]"></div>

                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-700 pb-6 mb-6 gap-4">
                                    <h3 className="font-black text-emerald-400 text-xl flex items-center gap-3 uppercase tracking-widest"><Banknote size={24} /> สรุปการชำระเงิน</h3>
                                    <span className="text-sm font-bold bg-emerald-500/20 text-emerald-300 px-4 py-1.5 rounded-full">{formData.contractType === 'CASH' ? 'สัญญาสด' : 'สัญญาผ่อน'}</span>
                                </div>

                                <div className="grid grid-cols-3 gap-3 sm:gap-6 text-center relative z-10 mb-8 border-b border-slate-700/50 pb-8">
                                    <div className="bg-slate-800/80 p-4 sm:p-5 rounded-[1.5rem] border border-slate-700 shadow-inner flex flex-col justify-center"><p className="text-slate-400 text-[10px] sm:text-xs mb-2 uppercase tracking-widest font-bold">ราคารวม</p><p className="font-black text-lg sm:text-2xl text-white break-words">{formatDecimal(formData.totalPrice) || "0.00"}</p></div>
                                    <div className="bg-slate-800/80 p-4 sm:p-5 rounded-[1.5rem] border border-slate-700 shadow-inner flex flex-col justify-center"><p className="text-slate-400 text-[10px] sm:text-xs mb-2 uppercase tracking-widest font-bold">มัดจำ</p><p className="font-black text-lg sm:text-2xl text-amber-400 break-words">{formatDecimal(formData.deposit) || "0.00"}</p></div>
                                    <div className="bg-slate-800/80 p-4 sm:p-5 rounded-[1.5rem] border border-slate-700 shadow-inner flex flex-col justify-center"><p className="text-slate-400 text-[10px] sm:text-xs mb-2 uppercase tracking-widest font-bold">ค้างชำระ</p><p className="font-black text-lg sm:text-2xl text-slate-300 break-words">{formatDecimal(formData.remainingPrice) || "0.00"}</p></div>
                                </div>

                                <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10 items-end">
                                    <div className="w-full md:w-1/2 space-y-2">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">รายละเอียดรับชำระ</p>
                                        <div className="flex justify-between items-center bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                                            <span className="text-sm font-medium text-slate-300">เงินสด</span>
                                            <span className="font-bold text-white">{formatDecimal(formData.cashReceive || "0")} <span className="text-[10px] text-slate-500">THB</span></span>
                                        </div>
                                        {validTransfers.map((t, i) => (
                                            <div key={i} className="flex justify-between items-center bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50">
                                                <span className="text-sm font-medium text-slate-300 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>โอน ({banks.find(b => b.id === t.bankId)?.bankName.split('-')[0].trim() || "ไม่ระบุ"})</span>
                                                <span className="font-bold text-blue-300">{formatDecimal(t.amount)} <span className="text-[10px] text-blue-500/50">THB</span></span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="w-full md:w-auto text-right bg-slate-950/50 p-6 rounded-[2rem] border border-emerald-500/30">
                                        <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-1">รับสุทธิ (Net Received)</p>
                                        <p className="text-4xl font-black text-emerald-400 break-all">{formatDecimal(totalReceive.toString())}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Navigation */}
                <div className="flex justify-between items-center mt-12 pt-8 border-t border-slate-200/60 max-w-4xl mx-auto">
                    <button type="button" onClick={() => setStep(p => Math.max(p - 1, 1))} className={`px-8 py-4 rounded-2xl font-bold cursor-pointer transition-all flex items-center gap-2 ${step === 1 ? 'invisible' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 shadow-sm hover:shadow-md'}`}><ChevronLeft size={20} /> ย้อนกลับ</button>

                    {step < 3 ? (
                        <button type="button" disabled={!isStepValid()} onClick={nextStep} className="px-10 py-4 bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center gap-2 cursor-pointer shadow-xl shadow-slate-900/20 transition-all active:scale-95 group">
                            ดำเนินการต่อ <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    ) : (
                        <button type="button" onClick={handleSubmit} disabled={loading || !isStepValid()} className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white rounded-2xl font-black flex items-center gap-2 cursor-pointer shadow-xl shadow-blue-600/30 transition-all active:scale-95 text-lg group">
                            <Save size={22} className="group-hover:scale-110 transition-transform" /> {loading ? "กำลังดำเนินการ..." : "ยืนยันและสร้างเอกสาร"}
                        </button>
                    )}
                </div>
            </div>

            {/* Modal เลือกแปลง (Plot Modal) แบบ Grid แสดงได้เยอะๆ เลื่อนได้ ไม่บีบ */}
            {isPlotModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] w-full max-w-4xl flex flex-col shadow-2xl border border-white/50 animate-in zoom-in-95 duration-300 h-[85vh]">
                        <div className="p-6 sm:p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50/30 rounded-t-[2rem] shrink-0">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white shadow-sm text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100"><Layers size={24} /></div>
                                <div><h2 className="font-black text-xl text-slate-800 tracking-tight">เลือกแปลงที่ดิน</h2><p className="text-sm font-medium text-slate-500 mt-1">เลือกแปลงที่ว่างเพื่อทำสัญญา (เลือกได้หลายแปลง)</p></div>
                            </div>
                            <button onClick={() => setIsPlotModalOpen(false)} className="p-3 bg-white hover:bg-slate-100 rounded-full cursor-pointer shadow-sm transition-colors"><X size={20} className="text-slate-500" /></button>
                        </div>

                        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 bg-white flex items-center gap-4 shadow-sm shrink-0">
                            <label className="text-sm font-bold text-slate-600 uppercase tracking-wider flex items-center gap-2"><MapPin size={16} className="text-blue-500" /> กรองตามโซน:</label>
                            <select value={plotModalZoneFilter} onChange={e => setPlotModalZoneFilter(e.target.value)} className="px-5 py-3 rounded-xl border border-slate-200 outline-none font-bold text-slate-700 w-64 cursor-pointer focus:ring-2 focus:ring-blue-500 bg-slate-50 hover:bg-slate-100 transition-colors">
                                <option value="">-- แสดงทุกโซน --</option>
                                {Array.from(new Set(availablePlots.map(p => p.zone?.name).filter(Boolean))).map((zName: any) => (
                                    <option key={zName} value={zName}>โซน {zName}</option>
                                ))}
                            </select>
                        </div>

                        {/* กล่องแสดงแปลงที่ดิน มี Scroll bar และตั้ง Grid พอดีกับหน้าจอ */}
                        <div className="p-6 sm:p-8 overflow-y-auto flex-1 bg-slate-50/50 custom-scrollbar">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {availablePlots.filter(p => !plotModalZoneFilter || p.zone?.name === plotModalZoneFilter).map(p => {
                                    const isSelected = selectedPlots.some(s => s.id === p.id);
                                    return (
                                        <div key={p.id} onClick={() => isSelected ? setSelectedPlots(selectedPlots.filter(s => s.id !== p.id)) : setSelectedPlots([...selectedPlots, p])}
                                            className={`p-4 border-2 rounded-[1.5rem] cursor-pointer transition-all duration-200 flex flex-col justify-center items-center gap-2 text-center relative ${isSelected ? 'border-blue-600 bg-white shadow-md shadow-blue-500/20 ring-1 ring-blue-600 scale-[1.02]' : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm'}`}>
                                            <div className="flex w-full justify-between items-center mb-1 px-1">
                                                <span className={`font-black text-xl tracking-tight ${isSelected ? 'text-blue-800' : 'text-slate-800'}`}>{p.plotName}</span>
                                                {isSelected ? <CheckCircle2 className="text-blue-600" size={22} /> : <div className="w-5 h-5 rounded-full border border-slate-300"></div>}
                                            </div>
                                            <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded-lg border border-slate-200/60">{p.areaSqWa} ตร.ว.</span>
                                        </div>
                                    );
                                })}
                            </div>
                            {availablePlots.filter(p => !plotModalZoneFilter || p.zone?.name === plotModalZoneFilter).length === 0 && (
                                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                                    <Layers size={48} className="opacity-20 mb-4" />
                                    <span className="font-bold text-lg">ไม่พบแปลงที่ว่างอยู่ในโซนนี้</span>
                                </div>
                            )}
                        </div>

                        <div className="px-6 sm:px-8 py-5 border-t border-slate-100 bg-white rounded-b-[2rem] flex justify-between items-center shadow-[0_-10px_30px_rgba(0,0,0,0.02)] shrink-0">
                            <div className="flex flex-col">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">เลือกแล้ว</p>
                                <p className="text-xl font-black text-blue-600 leading-none mt-1">{selectedPlots.length} <span className="text-sm text-slate-700">แปลง</span></p>
                            </div>
                            <button onClick={() => setIsPlotModalOpen(false)} className="bg-slate-900 hover:bg-black text-white px-8 py-3 rounded-2xl font-black flex items-center gap-2 cursor-pointer shadow-lg shadow-slate-900/20 transition-all active:scale-95 text-base">
                                ยืนยันการเลือก <Check size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal สร้าง/แก้ไข ลูกค้าด่วน */}
            {isCustomerModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 border border-white/50">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-blue-50/30 rounded-t-[2rem]">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-white text-indigo-600 rounded-2xl flex items-center justify-center shadow-sm border border-indigo-100">
                                    {isCorporateCust ? <Building2 size={24} /> : <User size={24} />}
                                </div>
                                <div><h2 className="text-xl font-black text-slate-800 tracking-tight">{editingCustId ? "แก้ไขข้อมูลลูกค้า" : "เพิ่มลูกค้าใหม่"}</h2><p className="text-xs text-slate-500 font-medium mt-0.5">กรอกข้อมูลเพื่อทำสัญญา</p></div>
                            </div>
                            <button onClick={() => setIsCustomerModalOpen(false)} className="bg-white p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer shadow-sm"><X size={20} /></button>
                        </div>
                        <form onSubmit={saveCustomer} className="p-8 overflow-y-auto space-y-6">
                            <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100 w-max">
                                <button type="button" onClick={() => setIsCorporateCust(!isCorporateCust)} className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer shadow-inner ${isCorporateCust ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${isCorporateCust ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                                <span className="text-sm font-bold flex items-center gap-2 text-slate-700">
                                    <Building2 size={16} className={isCorporateCust ? "text-indigo-600" : "text-slate-400"} /> บริษัท/นิติบุคคล <span className="text-slate-400 font-medium ml-1 text-xs">(เปิดถ้าใช่)</span>
                                </span>
                            </div>

                            <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700 ml-1">{isCorporateCust ? "ชื่อบริษัท/นิติบุคคล *" : "ชื่อ-นามสกุล *"}</label><input required name="fullName" value={customerForm.fullName} onChange={(e) => setCustomerForm({ ...customerForm, fullName: e.target.value })} placeholder={isCorporateCust ? "บริษัท ตัวอย่าง จำกัด" : "สมชาย ใจดี"} className="w-full px-5 py-3.5 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 transition-all" /></div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1"><label className="text-sm font-bold text-slate-700">เลขประจำตัวผู้เสียภาษี / บัตร ปชช. *</label><span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-500">{customerForm.idCard.replace(/\D/g, '').length}/13</span></div>
                                <input required name="idCard" value={customerForm.idCard} onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 13); setCustomerForm({ ...customerForm, idCard: val.length === 13 ? `${val.slice(0, 1)}-${val.slice(1, 5)}-${val.slice(5, 10)}-${val.slice(10, 12)}-${val.slice(12)}` : val }); }} placeholder="X-XXXX-XXXXX-XX-X" className="w-full px-5 py-3.5 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 tracking-wider transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700 ml-1">เบอร์โทรศัพท์ *</label><input required name="phone" value={customerForm.phone} onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setCustomerForm({ ...customerForm, phone: val.length > 6 ? `${val.slice(0, 3)}-${val.slice(3, 6)}-${val.slice(6)}` : val.length > 3 ? `${val.slice(0, 3)}-${val.slice(3)}` : val }); }} placeholder="0XX-XXX-XXXX" className="w-full px-5 py-3.5 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 transition-all" /></div>
                                <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700 ml-1">เบอร์สำรอง <span className="font-normal text-slate-400">(ถ้ามี)</span></label><input name="secondaryPhone" value={customerForm.secondaryPhone} onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); setCustomerForm({ ...customerForm, secondaryPhone: val.length > 6 ? `${val.slice(0, 3)}-${val.slice(3, 6)}-${val.slice(6)}` : val.length > 3 ? `${val.slice(0, 3)}-${val.slice(3)}` : val }); }} placeholder="0XX-XXX-XXXX" className="w-full px-5 py-3.5 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 transition-all" /></div>
                            </div>

                            <div className="grid grid-cols-12 gap-4">
                                <div className="col-span-4 space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">บ้านเลขที่</label>
                                    <input name="addressNumber" value={customerForm.addressNumber} onChange={(e) => setCustomerForm({ ...customerForm, addressNumber: e.target.value })} className="w-full px-4 py-3.5 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 transition-all" />
                                </div>
                                <div className="col-span-3 space-y-1.5">
                                    <label className="text-sm font-bold text-slate-700 ml-1">หมู่</label>
                                    <input name="moo" value={customerForm.moo} onChange={(e) => setCustomerForm({ ...customerForm, moo: e.target.value.replace(/\D/g, '') })} placeholder="-" className="w-full px-4 py-3.5 border border-slate-200 bg-slate-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-800 transition-all" />
                                </div>
                                <div className="col-span-5 space-y-1.5 relative z-[80]">
                                    <label className="text-sm font-bold text-slate-700 ml-1">วัน/เดือน/ปีเกิด</label>
                                    <BuddhistDatePicker align="right" value={customerForm.birthDate || ""} onChange={(date) => setCustomerForm({ ...customerForm, birthDate: date })} fullWidth />
                                </div>
                            </div>

                            <div className="p-5 bg-indigo-50/30 border border-indigo-100 rounded-3xl space-y-4 relative z-[70]" ref={locationRef}>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-indigo-900 flex items-center gap-2 ml-1"><MapPin size={16} className="text-indigo-500" /> ค้นหาตำบล/อำเภอ/จังหวัด <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input value={locationQuery} onChange={(e) => { setLocationQuery(e.target.value); setShowLocationDropdown(true); }} onFocus={() => setShowLocationDropdown(true)} placeholder="พิมพ์ชื่อ ตำบล, อำเภอ หรือ จังหวัด..." className="w-full pl-11 pr-4 py-3.5 border border-white shadow-sm rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-bold text-slate-800" />
                                    </div>
                                    {showLocationDropdown && locationQuery.length > 0 && (
                                        <div className="absolute z-20 w-[calc(100%-2.5rem)] mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                                            {filteredLocations.map((loc, idx) => (
                                                <div key={idx} onClick={() => { setCustomerForm(p => ({ ...p, subDistrict: loc.subDistrict, district: loc.district, province: loc.province })); setLocationQuery(""); setShowLocationDropdown(false); }} className="px-5 py-3 border-b border-slate-50 hover:bg-indigo-50 cursor-pointer transition-colors">
                                                    <span className="text-sm font-bold text-slate-700">{highlightText(loc.subDistrict, locationQuery)}</span><span className="text-xs text-slate-300 mx-2">»</span><span className="text-sm font-bold text-slate-700">{highlightText(loc.district, locationQuery)}</span><span className="text-xs text-slate-300 mx-2">»</span><span className="text-sm font-black text-indigo-600">{highlightText(loc.province, locationQuery)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">ตำบล</label><input required name="subDistrict" value={customerForm.subDistrict} onChange={(e) => setCustomerForm({ ...customerForm, subDistrict: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-sm font-bold bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500" /></div>
                                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">อำเภอ</label><input required name="district" value={customerForm.district} onChange={(e) => setCustomerForm({ ...customerForm, district: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-sm font-bold bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500" /></div>
                                    <div className="space-y-1.5"><label className="text-xs font-bold text-slate-500 ml-1">จังหวัด</label><input required name="province" value={customerForm.province} onChange={(e) => setCustomerForm({ ...customerForm, province: e.target.value })} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none text-sm font-bold bg-white text-slate-800 focus:ring-2 focus:ring-indigo-500" /></div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-end gap-4 mt-8">
                                <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="px-8 py-3.5 bg-slate-100 text-slate-600 font-bold rounded-2xl hover:bg-slate-200 cursor-pointer transition-colors">ยกเลิก</button>
                                <button type="submit" disabled={loading} className="px-10 py-3.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50 active:scale-95 transition-all">บันทึกข้อมูล</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal เพิ่มบัญชีธนาคาร (มีฟังก์ชันเพิ่มเหมือนเดิม) */}
            {isBankModalOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md animate-in fade-in">
                    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl animate-in zoom-in-95 overflow-hidden border border-slate-100">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-blue-50/50"><h2 className="font-black text-xl text-slate-800">เพิ่มธนาคารใหม่</h2><button onClick={() => setIsBankModalOpen(false)} className="cursor-pointer p-2 bg-white rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 shadow-sm transition-colors"><X size={20} /></button></div>
                        <form onSubmit={saveBank} className="p-8 space-y-5">
                            <div className="space-y-1.5 relative z-50" ref={bankRef}>
                                <label className="text-sm font-bold text-slate-700 ml-1">เลือกธนาคาร *</label>
                                <div className="w-full border border-slate-200 bg-slate-50 hover:bg-white flex items-center px-4 py-3 cursor-text transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:bg-white rounded-2xl" onClick={() => setIsBankDropdownOpen(true)}>
                                    {selectedBankIcon && bankSearchTerm === `${selectedBankIcon.symbol} (${selectedBankIcon.name})` ? <img src={selectedBankIcon.icon} className="w-7 h-7 object-contain drop-shadow-sm" /> : <Search size={20} className="text-slate-400" />}
                                    <input type="text" value={bankSearchTerm} onChange={e => { setBankSearchTerm(e.target.value); setIsBankDropdownOpen(true); }} className="w-full outline-none ml-3 text-base font-bold text-slate-800 bg-transparent" />
                                    <ChevronDown size={18} className="text-slate-400 cursor-pointer" onClick={() => setIsBankDropdownOpen(!isBankDropdownOpen)} />
                                </div>
                                {isBankDropdownOpen && (
                                    <div className="absolute z-[60] w-full mt-2 bg-white/95 backdrop-blur-xl border border-slate-200 rounded-2xl shadow-xl max-h-60 overflow-y-auto">
                                        {THAI_BANKS.filter(b => b.name.includes(bankSearchTerm) || b.symbol.includes(bankSearchTerm)).map((bank) => (
                                            <div key={bank.symbol} onClick={() => { setSelectedBankIcon(bank); setBankSearchTerm(`${bank.symbol} (${bank.name})`); setIsBankDropdownOpen(false); }} className="px-5 py-3 hover:bg-blue-50 flex items-center gap-4 cursor-pointer border-b border-slate-50 transition-colors">
                                                <img src={bank.icon} className="w-8 h-8 object-contain drop-shadow-sm" /><div><p className="text-base font-black text-slate-800">{bank.symbol}</p><p className="text-xs font-bold text-slate-500 mt-0.5">{bank.name}</p></div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700 ml-1">ชื่อบัญชี *</label><input required value={bankForm.accountName} onChange={e => setBankForm({ ...bankForm, accountName: e.target.value })} className="w-full px-5 py-3.5 border border-slate-200 bg-slate-50 focus:bg-white rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-800 transition-colors" placeholder="ระบุชื่อบัญชีบริษัท" /></div>
                            <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700 ml-1">เลขที่บัญชี *</label><input required value={bankForm.accountNumber} onChange={e => { const raw = e.target.value.replace(/\D/g, '').slice(0, 15); setBankForm({ ...bankForm, accountNumber: raw.match(/.{1,3}/g)?.join('-') || raw }) }} className="w-full px-5 py-3.5 border border-slate-200 bg-slate-50 focus:bg-white rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none font-black text-blue-700 tracking-widest transition-colors text-lg" placeholder="XXX-XXX-XXX-X" /></div>

                            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-slate-100"><button type="button" onClick={() => setIsBankModalOpen(false)} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer hover:bg-slate-200 transition-colors">ยกเลิก</button><button type="submit" disabled={loading} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-black cursor-pointer hover:bg-blue-700 shadow-md shadow-blue-600/30 active:scale-95 transition-all">เพิ่มบัญชี</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}