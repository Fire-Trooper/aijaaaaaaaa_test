import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import path from "path";

export const generateWordContract = async (templatePath: string, data: any, outputFileName: string) => {
    try {
        // 1. อ่านไฟล์ Template Word ต้นฉบับ
        const content = fs.readFileSync(templatePath, "binary");
        const zip = new PizZip(content);

        // 2. ตั้งค่า Docxtemplater และกำหนด Delimiter เป็น { และ }
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
            delimiters: { start: '{', end: '}' } // สำคัญมาก: ตรงตามที่คุณออกแบบไว้
        });

        // 3. แทนที่ข้อมูล (Render)
        doc.render(data);

        // 4. สร้างไฟล์ใหม่
        const buf = doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" });

        // 5. บันทึกไฟล์ลงโฟลเดอร์ public เพื่อให้ดาวน์โหลดได้
        const outputDir = path.join(process.cwd(), "public/documents/contracts");
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const outputPath = path.join(outputDir, outputFileName);
        fs.writeFileSync(outputPath, buf);

        // ส่งคืน Path สำหรับเอาไปเซฟลง DB หรือทำปุ่มดาวน์โหลด
        return `/documents/contracts/${outputFileName}`;
    } catch (error) {
        console.error("Error generating Word document:", error);
        throw new Error("ไม่สามารถสร้างไฟล์สัญญาได้");
    }
};