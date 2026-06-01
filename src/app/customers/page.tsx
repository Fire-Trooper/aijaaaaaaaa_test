"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Plus, Edit, Trash2, X, Save, User, Building2, FileText, MapPin, AlertTriangle, Calendar as CalendarIcon, ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import dayjs from "dayjs";
import buddhistEra from "dayjs/plugin/buddhistEra";
import "dayjs/locale/th";

dayjs.extend(buddhistEra);
dayjs.locale("th");

const THAI_LOCATIONS = [
  { subDistrict: "ป่าป้อง", district: "ดอยสะเก็ด", province: "เชียงใหม่", zip: "50220" },
  { subDistrict: "บ้านจันทร์", district: "กัลยาณิวัฒนา", province: "เชียงใหม่", zip: "58130" },
];

type Customer = { id: string; isCorporate: boolean; fullName: string; idCard: string; birthDate: string | null; phone: string; secondaryPhone: string; addressNumber: string; moo: string; subDistrict: string; district: string; province: string; _count: { contracts: number }; };

const MONTHS = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
const currentYear = dayjs().year();
const YEARS = Array.from({ length: 120 }, (_, i) => currentYear + 10 - i);

// นำ Component ไปแทนที่ตัวเก่าด้านบนไฟล์ (ปรับให้กะทัดรัดและใช้ align="right" ได้)
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
      <div onClick={() => setIsOpen(!isOpen)} className={`flex items-center justify-between bg-white hover:bg-blue-50 transition-colors px-3 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold shadow-sm cursor-pointer select-none ${fullWidth ? 'w-full' : ''}`}>
        <div className="flex items-center text-sm">
          <CalendarIcon size={16} className="mr-2 text-blue-600" />
          <span className="truncate">{value ? dayjs(value).format('D MMM BBBB') : "เลือกวันที่"}</span>
        </div>
        {fullWidth && <ChevronDown size={14} className="text-slate-400 ml-1" />}
      </div>

      {isOpen && (
        <div className={`absolute top-full mt-2 ${align === "right" ? "right-0" : "left-0"} z-50 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 w-[280px] animate-in zoom-in-95`}>
          <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-200">
            <button onClick={(e) => { e.preventDefault(); setCurrentDate(currentDate.subtract(1, 'month')); }} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer border border-slate-200"><ChevronLeft size={16} className="text-green-600" /></button>

            <div className="flex gap-1">
              <select value={currentDate.month()} onChange={(e) => setCurrentDate(currentDate.month(Number(e.target.value)))} className="font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-1 py-1 outline-none cursor-pointer text-sm">
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={currentDate.year()} onChange={(e) => setCurrentDate(currentDate.year(Number(e.target.value)))} className="font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-md px-1 py-1 outline-none cursor-pointer text-sm">
                {YEARS.map(y => <option key={y} value={y}>{y + 543}</option>)}
              </select>
            </div>

            <button onClick={(e) => { e.preventDefault(); setCurrentDate(currentDate.add(1, 'month')); }} className="p-1 hover:bg-slate-100 rounded-lg cursor-pointer border border-slate-200"><ChevronRight size={16} className="text-green-600" /></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center mb-2 pb-2 border-b border-slate-100">
            {['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => <div key={d} className="text-[10px] font-bold text-slate-400">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {blanks.map(b => <div key={`blank-${b}`} className="p-1"></div>)}
            {days.map(d => {
              const isSelected = dayjs(value).isSame(currentDate.date(d), 'day');
              return (
                <button key={d} onClick={(e) => { e.preventDefault(); onChange(currentDate.date(d).format('YYYY-MM-DD')); setIsOpen(false); }} className={`p-1 rounded-lg w-7 h-7 flex items-center justify-center text-xs font-bold transition-all cursor-pointer mx-auto ${isSelected ? 'bg-[#00c853] text-white shadow-sm' : 'hover:bg-green-50 text-slate-700'}`}>
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

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, id: string | null }>({ isOpen: false, id: null });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCorporate, setIsCorporate] = useState(false);
  const [formData, setFormData] = useState({ fullName: "", idCard: "", birthDate: "", phone: "", secondaryPhone: "", addressNumber: "", moo: "", subDistrict: "", district: "", province: "" });

  const [locationQuery, setLocationQuery] = useState("");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  const fetchCustomers = async () => { const res = await fetch("/api/customers"); if (res.ok) setCustomers(await res.json()); };

  useEffect(() => {
    fetchCustomers();
    const handleClickOutside = (e: MouseEvent) => { if (locationRef.current && !locationRef.current.contains(e.target as Node)) setShowLocationDropdown(false); };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCustomers = customers.filter(c => c.fullName.includes(searchTerm) || c.idCard.includes(searchTerm) || c.phone?.includes(searchTerm));
  const filteredLocations = THAI_LOCATIONS.filter(l => l.subDistrict.includes(locationQuery) || l.district.includes(locationQuery) || l.province.includes(locationQuery));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let val = value;
    if (name === "idCard") {
      const v = value.replace(/\D/g, '').slice(0, 13);
      val = v.length === 13 ? `${v.slice(0, 1)}-${v.slice(1, 5)}-${v.slice(5, 10)}-${v.slice(10, 12)}-${v.slice(12)}` : v;
    }
    if (name === "phone" || name === "secondaryPhone") {
      const v = value.replace(/\D/g, '').slice(0, 10);
      val = v.length > 6 ? `${v.slice(0, 3)}-${v.slice(3, 6)}-${v.slice(6)}` : v.length > 3 ? `${v.slice(0, 3)}-${v.slice(3)}` : v;
    }
    if (name === "moo") val = value.replace(/\D/g, '');
    setFormData(p => ({ ...p, [name]: val }));
  };

  const handleOpenModal = (cust?: Customer) => {
    if (cust) {
      setEditingId(cust.id); setIsCorporate(cust.isCorporate);
      setFormData({ fullName: cust.fullName, idCard: cust.idCard, birthDate: cust.birthDate || "", phone: cust.phone || "", secondaryPhone: cust.secondaryPhone || "", addressNumber: cust.addressNumber || "", moo: cust.moo || "", subDistrict: cust.subDistrict || "", district: cust.district || "", province: cust.province || "" });
    } else {
      setEditingId(null); setIsCorporate(false);
      setFormData({ fullName: "", idCard: "", birthDate: "", phone: "", secondaryPhone: "", addressNumber: "", moo: "", subDistrict: "", district: "", province: "" });
    }
    setLocationQuery(""); setIsModalOpen(true);
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((p, i) => p.toLowerCase() === query.toLowerCase() ? <span key={i} className="bg-yellow-200 text-yellow-900 px-0.5 rounded">{p}</span> : p);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await fetch("/api/customers", { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...formData, isCorporate, id: editingId }) });
      if (res.ok) { toast.success(editingId ? "แก้ไขสำเร็จ" : "เพิ่มสำเร็จ"); setIsModalOpen(false); fetchCustomers(); }
      else toast.error((await res.json()).error || "เกิดข้อผิดพลาด");
    } catch (error) { toast.error("ระบบขัดข้อง"); }
    setLoading(false);
  };

  const confirmDelete = async () => {
    if (!confirmDialog.id) return;
    const res = await fetch(`/api/customers?id=${confirmDialog.id}`, { method: "DELETE" });
    if (res.ok) { toast.success("ลบสำเร็จ"); fetchCustomers(); } else toast.error("ลบไม่ได้ (มีสัญญาผูกอยู่)");
    setConfirmDialog({ isOpen: false, id: null });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 className="text-2xl font-bold text-slate-800">จัดการลูกค้า</h1><p className="text-slate-500 text-sm mt-1">รายชื่อและข้อมูลลูกค้าทั้งหมดในระบบ</p></div>
        <button onClick={() => handleOpenModal()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 cursor-pointer shadow-sm"><Plus size={18} /> เพิ่มลูกค้าใหม่</button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="relative max-w-md"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="ค้นหาชื่อ, เลขบัตร, หรือเบอร์โทร..." className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" /></div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-700 text-white">
              <tr><th className="px-6 py-4 text-left text-xs font-semibold uppercase">ชื่อ-นามสกุล / นิติบุคคล</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase">ประเภท</th><th className="px-6 py-4 text-left text-xs font-semibold uppercase">เลขประจำตัว</th><th className="px-6 py-4 text-center text-xs font-semibold uppercase">ประวัติสัญญา</th><th className="px-6 py-4 text-right text-xs font-semibold uppercase">จัดการ</th></tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200 text-sm text-slate-700">
              {filteredCustomers.length === 0 ? <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">ไม่พบข้อมูลลูกค้า</td></tr> :
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-blue-700 flex items-center gap-2">
                      {cust.isCorporate ? <Building2 size={16} className="text-indigo-500" /> : <User size={16} className="text-blue-500" />}
                      <Link href={`/customers/${cust.id}`} className="hover:underline cursor-pointer">{cust.fullName}</Link>
                    </td>
                    <td className="px-6 py-4"><span className={`px-2 py-1 text-[10px] font-bold rounded-md border ${cust.isCorporate ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>{cust.isCorporate ? "นิติบุคคล" : "บุคคลธรรมดา"}</span></td>
                    <td className="px-6 py-4">{cust.idCard}</td>
                    <td className="px-6 py-4 text-center"><span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">{cust._count?.contracts || 0} สัญญา</span></td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleOpenModal(cust)} className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-md cursor-pointer"><Edit size={18} /></button>
                        <button onClick={() => setConfirmDialog({ isOpen: true, id: cust.id })} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md cursor-pointer"><Trash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-sm">{isCorporate ? <Building2 size={18} /> : <User size={18} />}</div>
                <div><h2 className="text-lg font-bold text-slate-800 leading-tight">เพิ่มลูกค้าใหม่</h2><p className="text-xs text-slate-500">กรอกข้อมูลเพื่อเพิ่มรายชื่อลงในระบบ</p></div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-white p-2 rounded-full hover:bg-slate-200 transition-colors cursor-pointer"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
              <div className="flex items-center gap-3 mb-2">
                <button type="button" onClick={() => setIsCorporate(!isCorporate)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${isCorporate ? 'bg-blue-600' : 'bg-slate-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isCorporate ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <span className="text-sm font-bold flex items-center gap-2 text-slate-700"><Building2 size={16} className={isCorporate ? "text-blue-600" : "text-slate-400"} /> บริษัท/นิติบุคคล <span className="text-slate-400 font-normal ml-1">(บุคคลธรรมดา)</span></span>
              </div>

              <div className="space-y-1"><label className="text-sm font-bold text-slate-700">{isCorporate ? "ชื่อบริษัท/นิติบุคคล *" : "ชื่อลูกค้า *"}</label><input required name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder={isCorporate ? "ชื่อบริษัท/นิติบุคคล" : "ชื่อ-นามสกุล"} className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" /></div>
              <div className="space-y-1">
                <div className="flex justify-between"><label className="text-sm font-bold text-slate-700">เลขประจำตัวผู้เสียภาษี / บัตร ปชช. *</label><span className="text-xs text-slate-400">{formData.idCard.replace(/\D/g, '').length}/13 หลัก</span></div>
                <input required name="idCard" value={formData.idCard} onChange={handleInputChange} placeholder="X-XXXX-XXXXX-XX-X" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-sm font-bold text-slate-700">เบอร์โทรศัพท์ *</label><input required name="phone" value={formData.phone} onChange={handleInputChange} placeholder="XXX-XXX-XXXX" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div className="space-y-1"><label className="text-sm font-bold text-slate-700">เบอร์สำรอง (ถ้ามี)</label><input name="secondaryPhone" value={formData.secondaryPhone} onChange={handleInputChange} placeholder="XXX-XXX-XXXX" className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              </div>

              <div className="grid grid-cols-12 gap-3">
                <div className="col-span-4 space-y-1">
                  <label className="text-sm font-bold text-slate-700">บ้านเลขที่</label>
                  <input name="addressNumber" value={formData.addressNumber} onChange={handleInputChange} className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-3 space-y-1">
                  <label className="text-sm font-bold text-slate-700">หมู่</label>
                  <input name="moo" value={formData.moo} onChange={handleInputChange} placeholder="หมู่" className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div className="col-span-5 space-y-1">
                  <label className="text-sm font-bold text-slate-700">วัน/เดือน/ปีเกิด</label>
                  {/* สั่ง align="right" เพื่อให้ปฏิทินกางออกทางซ้าย ไม่ทะลุขอบจอ */}
                  <BuddhistDatePicker align="right" value={formData.birthDate} onChange={(date) => setFormData({ ...formData, birthDate: date })} fullWidth />
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4 relative" ref={locationRef}>
                <div className="space-y-1">
                  <label className="text-sm font-bold text-slate-700 flex items-center gap-2"><MapPin size={14} /> ค้นหาที่อยู่ <span className="text-red-500">*</span></label>
                  <input value={locationQuery} onChange={(e) => { setLocationQuery(e.target.value); setShowLocationDropdown(true); }} onFocus={() => setShowLocationDropdown(true)} placeholder="พิมพ์ ตำบล, อำเภอ หรือ จังหวัด เพื่อค้นหาและเลือก..." className="w-full px-4 py-2 border border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white" />
                  {showLocationDropdown && locationQuery.length > 0 && (
                    <div className="absolute z-10 w-[calc(100%-2rem)] mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto">
                      {filteredLocations.map((loc, idx) => (
                        <div key={idx} onClick={() => { setFormData(p => ({ ...p, subDistrict: loc.subDistrict, district: loc.district, province: loc.province })); setLocationQuery(""); setShowLocationDropdown(false); }} className="px-4 py-2 border-b border-slate-50 hover:bg-blue-50 cursor-pointer">
                          <span className="text-sm font-medium text-slate-800">{highlightText(loc.subDistrict, locationQuery)}</span><span className="text-xs text-slate-400 mx-2">»</span><span className="text-sm font-medium text-slate-800">{highlightText(loc.district, locationQuery)}</span><span className="text-xs text-slate-400 mx-2">»</span><span className="text-sm font-bold text-blue-600">{highlightText(loc.province, locationQuery)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-500">ตำบล</label><input required name="subDistrict" value={formData.subDistrict} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg outline-none text-sm bg-white" /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-500">อำเภอ</label><input required name="district" value={formData.district} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg outline-none text-sm bg-white" /></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-slate-500">จังหวัด</label><input required name="province" value={formData.province} onChange={handleInputChange} className="w-full px-3 py-2 border rounded-lg outline-none text-sm bg-white" /></div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 cursor-pointer">ยกเลิก</button>
                <button type="submit" disabled={loading} className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md cursor-pointer disabled:opacity-50">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={32} /></div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">ยืนยันการลบข้อมูล?</h2>
            <p className="text-slate-500 mb-6">ข้อมูลที่ถูกลบจะไม่สามารถกู้คืนได้ คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setConfirmDialog({ isOpen: false, id: null })} className="px-6 py-2 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer">ยกเลิก</button>
              <button onClick={confirmDelete} className="px-6 py-2 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 cursor-pointer shadow-sm">ยืนยันลบข้อมูล</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}