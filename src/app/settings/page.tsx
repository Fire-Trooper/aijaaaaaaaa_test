"use client";

import { useState } from "react";
import { Settings, Building, FileText, Landmark } from "lucide-react";
import ProjectSettings from "@/components/settings/ProjectSettings";
import BankSettings from "@/components/settings/BankSettings";
import TemplateSettings from "@/components/settings/TemplateSettings";

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("projects");

    const tabs = [
        { id: "projects", name: "โครงการ & ทรัพย์สิน", icon: Building },
        { id: "banks", name: "บัญชีธนาคาร", icon: Landmark },
        { id: "templates", name: "เทมเพลตสัญญา", icon: FileText },
    ];

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-24">
            <div className="flex items-center gap-4 mb-8 pl-2">
                <div className="w-14 h-14 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                    <Settings className="text-white" size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-slate-800 tracking-tight">ตั้งค่าระบบ (Settings)</h1>
                    <p className="text-slate-500 font-medium mt-1">จัดการข้อมูลพื้นฐาน โครงการ ธนาคาร และเอกสารสัญญา</p>
                </div>
            </div>

            {/* 🌟 Tab Navigation (Horizontal Pills) */}
            <div className="flex overflow-x-auto hide-scrollbar gap-3 mb-8 pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2.5 px-6 py-3.5 rounded-[1.5rem] font-bold text-sm transition-all duration-300 whitespace-nowrap cursor-pointer ${activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                            : 'bg-white text-slate-500 hover:bg-blue-50 hover:text-blue-700 border border-slate-200/60 shadow-sm'
                            }`}
                    >
                        <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'text-slate-400'} />
                        {tab.name}
                    </button>
                ))}
            </div>

            {/* 🌟 Tab Content Area */}
            <div className="min-w-0">
                {activeTab === "projects" && <ProjectSettings />}
                {activeTab === "banks" && <BankSettings />}
                {activeTab === "templates" && <TemplateSettings />}
            </div>
        </div>
    );
}