"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Users, Map, Settings, LandPlot, ChevronLeft, ChevronRight } from "lucide-react";

export default function Sidebar({ isCollapsed, setIsCollapsed }: { isCollapsed: boolean, setIsCollapsed: (val: boolean) => void }) {
    const pathname = usePathname();

    const menuItems = [
        { name: "แดชบอร์ด", href: "/", icon: LayoutDashboard },
        { name: "จัดการสัญญา", href: "/contracts", icon: FileText },
        { name: "จัดการลูกค้า", href: "/customers", icon: Users },
        { name: "แปลงที่ดิน", href: "/plot", icon: Map },
        { name: "ตั้งค่าระบบ", href: "/settings", icon: Settings },
    ];

    return (
        <div className={`bg-white/90 backdrop-blur-xl border-r border-slate-200/60 h-screen fixed left-0 top-0 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-50 transition-all duration-300 ${isCollapsed ? 'w-[80px]' : 'w-64'}`}>

            {/* Header */}
            <div className={`p-6 flex items-center border-b border-slate-100/80 transition-all ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="w-10 h-10 shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <LandPlot className="text-white" size={30} />
                </div>
                {!isCollapsed && (
                    <div className="overflow-hidden whitespace-nowrap">
                        <h1 className="font-black text-lg text-slate-800 tracking-tight leading-none">ERP Losoland</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Management</p>
                    </div>
                )}
            </div>

            {/* Menus */}
            <div className="p-4 flex-1 space-y-2 overflow-y-auto overflow-x-hidden">
                {!isCollapsed && <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 mt-2">เมนูหลัก</p>}
                {menuItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                    return (
                        <Link key={item.name} href={item.href} title={isCollapsed ? item.name : ""}
                            className={`flex items-center rounded-2xl font-bold transition-all duration-300 group ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3.5'} ${isActive ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100/50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 border border-transparent'}`}>
                            <item.icon size={22} className={`shrink-0 transition-transform duration-300 ${isActive ? 'text-blue-600 scale-110' : 'group-hover:scale-110'}`} />
                            {!isCollapsed && <span className="truncate">{item.name}</span>}
                        </Link>
                    );
                })}
            </div>

            {/* Toggle Button & User Profile */}
            <div className="p-4 border-t border-slate-100/80 bg-slate-50/50 flex flex-col gap-4 items-center">
                <button onClick={() => setIsCollapsed(!isCollapsed)} className="w-full flex justify-center items-center p-2 rounded-xl text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors">
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                </button>

                <div className={`flex items-center w-full ${isCollapsed ? 'justify-center' : 'gap-3 px-2'}`}>
                    <div className="w-10 h-10 shrink-0 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center font-black text-slate-500">A</div>
                    {!isCollapsed && (
                        <div className="overflow-hidden whitespace-nowrap">
                            <p className="text-sm font-bold text-slate-800">Admin User</p>
                            <p className="text-[10px] font-black text-emerald-500 uppercase">ออนไลน์</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}