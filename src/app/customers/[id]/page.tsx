import { ArrowLeft, User, Building2, FileText, Phone, MapPin, CreditCard } from "lucide-react";
import Link from "next/link";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CustomerDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = await params;
    const customer = await db.customer.findUnique({
        where: { id: resolvedParams.id },
        include: { contracts: { include: { deeds: true }, orderBy: { contractDate: 'desc' } } }
    });

    if (!customer) redirect("/customers");

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-20">
            <div className="flex items-center gap-4"><Link href="/customers" className="p-2 hover:bg-slate-200 rounded-full transition-colors cursor-pointer text-slate-600"><ArrowLeft size={24} /></Link><h1 className="text-2xl font-bold text-slate-800">รายละเอียดลูกค้า</h1></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
                        <div className="flex items-center gap-4 mb-6 mt-2">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-sm ${customer.isCorporate ? 'bg-indigo-500' : 'bg-blue-500'}`}>{customer.isCorporate ? <Building2 size={28} /> : <User size={28} />}</div>
                            <div><h2 className="text-xl font-bold text-slate-800">{customer.fullName}</h2><span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${customer.isCorporate ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>{customer.isCorporate ? 'นิติบุคคล' : 'บุคคลธรรมดา'}</span></div>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div className="flex items-start gap-3"><CreditCard className="text-slate-400 mt-0.5" size={18} /><div><p className="text-slate-500 font-medium">เลขประจำตัวผู้เสียภาษี / บัตร ปชช.</p><p className="font-bold text-slate-800">{customer.idCard}</p></div></div>
                            <div className="flex items-start gap-3"><Phone className="text-slate-400 mt-0.5" size={18} /><div><p className="text-slate-500 font-medium">เบอร์โทรศัพท์</p><p className="font-bold text-slate-800">{customer.phone || "-"}</p>{customer.secondaryPhone && <p className="font-bold text-slate-600 mt-1">{customer.secondaryPhone} (สำรอง)</p>}</div></div>
                            <div className="flex items-start gap-3"><MapPin className="text-slate-400 mt-0.5" size={18} /><div><p className="text-slate-500 font-medium">ที่อยู่</p><p className="font-bold text-slate-800">{customer.addressNumber ? `เลขที่ ${customer.addressNumber} ` : ""}{customer.moo ? `ม.${customer.moo} ` : ""}ต.{customer.subDistrict} อ.{customer.district} จ.{customer.province}</p></div></div>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-full">
                        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><FileText className="text-teal-600" size={20} /> ประวัติการทำสัญญา ({customer.contracts.length})</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-200">
                                <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">วันที่</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">โฉนด</th><th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase">ประเภท</th><th className="px-4 py-3 text-right text-xs font-semibold text-slate-500 uppercase">ราคาเต็ม</th></tr></thead>
                                <tbody className="divide-y divide-slate-200 text-sm">
                                    {customer.contracts.length === 0 ? (<tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">ยังไม่มีประวัติทำสัญญา</td></tr>) : (
                                        customer.contracts.map(contract => (
                                            <tr key={contract.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                                                <td className="px-4 py-3 font-medium">{new Date(contract.contractDate).toLocaleDateString('th-TH')}</td>
                                                <td className="px-4 py-3 font-bold text-teal-700">{contract.deeds.map(d => d.deedNumber).join(', ') || "-"}</td>
                                                <td className="px-4 py-3"><span className={`px-2 py-1 text-xs font-bold rounded-full ${contract.contractType === 'CASH' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{contract.contractType === 'CASH' ? 'สด' : 'ผ่อน'}</span></td>
                                                <td className="px-4 py-3 text-right font-bold">{contract.totalPrice.toLocaleString()} ฿</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}