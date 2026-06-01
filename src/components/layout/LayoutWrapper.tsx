"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
            <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'ml-[80px]' : 'ml-64'}`}>
                {/* เพิ่ม padding เพื่อไม่ให้เนื้อหาชิดขอบเกินไป */}
                <div className="p-6 md:p-10 max-w-[1600px] mx-auto w-full">
                    {children}
                </div>
            </main>
        </div>
    );
}