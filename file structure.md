real-estate-contract/
├── prisma/
│   └── schema.prisma        # ไฟล์กำหนดโครงสร้าง Database (ตารางลูกค้า, สัญญา, ฯลฯ)
├── public/                  # เก็บไฟล์ที่เข้าถึงได้สาธารณะ (เช่น รูปภาพโลโก้เว็บ, favicon)
├── private/                 
│   └── templates/           # 🔒 เก็บไฟล์ Template .docx และ .pdf (สร้างโฟลเดอร์นี้เอง นอก src)
├── src/
│   ├── app/                 # หน้าเว็บและ API (App Router)
│   │   ├── api/             # Backend APIs ทั้งหมด (ติดต่อ DB, สร้างเอกสาร)
│   │   │   ├── contracts/   # API สำหรับบันทึก/ดึงข้อมูลสัญญา
│   │   │   ├── generate/    # API สำหรับสั่งสร้างไฟล์ Word/PDF
│   │   │   └── ...
│   │   ├── contracts/       # 📄 หน้าจอ: จัดการและทำสัญญาลูกค้า
│   │   ├── customers/       # 👥 หน้าจอ: จัดการลูกค้า
│   │   ├── settings/        # ⚙️ หน้าจอ: ตั้งค่าโครงการ/ธนาคาร/Template
│   │   ├── layout.tsx       # Layout หลักของเว็บ (ใส่ Sidebar, Topbar ไว้ที่นี่)
│   │   └── page.tsx         # หน้า Dashboard หน้าแรก
│   ├── components/          # UI Components ที่ใช้ซ้ำได้หลายที่
│   │   ├── layout/          # Component โครงสร้าง เช่น Sidebar.tsx, Navbar.tsx
│   │   └── ui/              # Component พื้นฐาน (ปุ่ม, ฟอร์ม)
│   ├── lib/                 # โค้ดหลังบ้าน และ Utility Functions
│   │   ├── db.ts            # ตั้งค่าการเชื่อมต่อ Prisma Client
│   │   ├── documentMaker.ts # Logic การอ่านและยัดข้อมูลลงไฟล์ Word (.docx)
│   │   ├── pdfMaker.ts      # Logic การอ่านและกรอกฟอร์มใบเสร็จ (.pdf)
│   │   └── utils.ts         # ฟังก์ชันทั่วไป (เช่น แปลงวันที่ไทย, จัดฟอร์แมตเงิน)
│   └── types/               # TypeScript Interface (ถ้ามี)
├── .env                     # ไฟล์เก็บตัวแปรระบบ เช่น DATABASE_URL="file:./dev.db"
└── package.json