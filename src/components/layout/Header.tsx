export default function Header() {
    return (
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm z-10">
            <div className="font-semibold text-slate-700 text-lg">
                {/* ตรงนี้เดี๋ยวเราค่อยทำให้มันเปลี่ยนชื่อตามหน้าต่าง ๆ ได้ทีหลังครับ */}
                ระบบทำสัญญา
            </div>

            {/* <div className="flex items-center gap-3">
                <div className="text-sm text-slate-600">Admin User</div>
                <div className="w-9 h-9 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
                    A
                </div>
            </div> */}
        </header>
    );
}