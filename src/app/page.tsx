import { db } from "@/lib/db";
import { Banknote, CreditCard, Wallet, Landmark, TrendingUp, CalendarDays, Activity, LayoutDashboard } from "lucide-react";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";

dayjs.extend(buddhistEra);
dayjs.locale("th");

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const contracts = await db.contract.findMany({
    include: { paymentTransfers: { include: { bank: true } } },
    orderBy: { contractDate: 'asc' }
  });

  let totalCash = 0;
  let totalTransfer = 0;
  let totalSales = 0;
  const bankBalances: Record<string, { name: string, logo: string | null, amount: number }> = {};
  const monthlySales: Record<string, number> = {};

  contracts.forEach(contract => {
    totalSales += contract.totalPrice;
    totalCash += contract.cashReceive || 0;

    contract.paymentTransfers.forEach(t => {
      totalTransfer += t.amount;
      if (!bankBalances[t.bankId]) {
        bankBalances[t.bankId] = { name: t.bank.bankName, logo: t.bank.logoUrl, amount: 0 };
      }
      bankBalances[t.bankId].amount += t.amount;
    });

    const monthKey = dayjs(contract.contractDate).locale('th').format('MMMM BBBB');
    if (!monthlySales[monthKey]) monthlySales[monthKey] = 0;
    monthlySales[monthKey] += contract.totalPrice;
  });

  const currentBalance = totalCash + totalTransfer;
  const activeBanks = Object.values(bankBalances).sort((a, b) => b.amount - a.amount);
  const monthlyData = Object.entries(monthlySales).map(([month, total]) => ({ month, total }));
  const formatMoney = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
          <LayoutDashboard className="text-blue-600" size={28} /> ภาพรวมระบบ (Dashboard)
        </h1>
        <p className="text-slate-500 font-medium mt-1 ml-10">สรุปข้อมูลทางการเงินและยอดขายโครงการ</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2rem] shadow-xl shadow-slate-900/20 text-white relative overflow-hidden group hover:-translate-y-1 transition-transform">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 rounded-full blur-[50px] group-hover:bg-emerald-500/40 transition-colors duration-700"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-6">
              <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/30"><Wallet size={28} className="text-emerald-400" /></div>
              <span className="bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">เงินในระบบสุทธิ</span>
            </div>
            <h3 className="text-4xl font-black tracking-tighter">{formatMoney(currentBalance)} <span className="text-lg text-slate-400 font-bold ml-1">THB</span></h3>
            <p className="text-slate-400 text-sm mt-2 font-medium">ยอดรวมเงินมัดจำ (สด + โอน) ทั้งหมด</p>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-slate-200/60 relative overflow-hidden group hover:shadow-md hover:-translate-y-1 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100"><Banknote size={28} /></div>
            <span className="text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100">CASH</span>
          </div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter relative z-10">{formatMoney(totalCash)}</h3>
          <p className="text-slate-500 text-sm mt-2 font-bold relative z-10">เงินสดในมือ</p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[2rem] shadow-sm border border-slate-200/60 relative overflow-hidden group hover:shadow-md hover:-translate-y-1 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-colors"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center border border-indigo-100"><CreditCard size={28} /></div>
            <span className="text-slate-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-slate-100">TRANSFER</span>
          </div>
          <h3 className="text-3xl font-black text-slate-800 tracking-tighter relative z-10">{formatMoney(totalTransfer)}</h3>
          <p className="text-slate-500 text-sm mt-2 font-bold relative z-10">เงินโอนเข้าบัญชีรวม</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2"><Landmark size={20} className="text-indigo-500" /> ยอดเงินรายบัญชี</h3>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {activeBanks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400"><Landmark size={48} className="opacity-20 mb-3" /><p className="font-bold text-sm">ยังไม่มียอดเงินโอน</p></div>
            ) : (
              activeBanks.map((bank, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all group">
                  <div className="flex items-center gap-3">
                    {bank.logo ? <div className="w-10 h-10 bg-slate-50 rounded-xl border border-slate-100 p-1.5"><img src={bank.logo} alt="bank" className="w-full h-full object-contain" /></div> : <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center"><Landmark size={16} className="text-slate-400" /></div>}
                    <div className="flex flex-col"><span className="font-black text-slate-700 text-sm">{bank.name.split('-')[0].trim()}</span><span className="text-[10px] font-bold text-slate-400">บัญชีรับโอน</span></div>
                  </div>
                  <span className="font-black text-indigo-600 text-base group-hover:scale-105 transition-transform">{formatMoney(bank.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-sm border border-slate-200/60 flex flex-col h-[500px]">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-black text-slate-800 text-lg flex items-center gap-2"><TrendingUp size={20} className="text-blue-500" /> ยอดขายที่ดินรายเดือน</h3>
              <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">อ้างอิงจากราคาที่ดินรวมในสัญญา</p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-800 px-4 py-2 rounded-xl font-black text-base shadow-sm border border-blue-100/50">
              รวม {formatMoney(totalSales)} ฿
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {monthlyData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-400"><Activity size={48} className="opacity-20 mb-3" /><p className="font-bold text-sm">ยังไม่มีข้อมูลยอดขาย</p></div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {monthlyData.map((data, i) => (
                  <div key={i} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-blue-200 hover:shadow-md transition-all">
                    <div className="absolute top-0 right-0 w-2 h-full bg-blue-500"></div>
                    <div className="flex items-center gap-2 mb-4">
                      <CalendarDays size={18} className="text-blue-500" />
                      <span className="font-bold text-slate-600 text-sm">{data.month}</span>
                    </div>
                    <span className="font-black text-2xl text-slate-800 group-hover:text-blue-700 transition-colors">{formatMoney(data.total)} <span className="text-xs font-bold text-slate-400 ml-1">THB</span></span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}