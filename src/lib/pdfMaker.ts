import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit"; // <--- นำเข้า fontkit
import fs from "fs";
import path from "path";
import { bahttext } from "bahttext";

export const generatePdfReceipt = async (templatePath: string, data: any, outputFileName: string) => {
    try {
        const pdfBytes = fs.readFileSync(templatePath);
        const pdfDoc = await PDFDocument.load(pdfBytes);

        // สมัครใช้งาน fontkit เพื่อรองรับ Custom Font
        pdfDoc.registerFontkit(fontkit);

        // โหลดฟอนต์ THSarabunNew จากโฟลเดอร์ public/fonts
        const fontPath = path.join(process.cwd(), "public/fonts/THSarabunNew.ttf");
        let customFont;
        if (fs.existsSync(fontPath)) {
            const fontBytes = fs.readFileSync(fontPath);
            customFont = await pdfDoc.embedFont(fontBytes);
        }

        const form = pdfDoc.getForm();

        const fillField = (fieldName: string, text: string, fontSize: number = 16) => {
            try {
                const field = form.getTextField(fieldName);
                if (field) {
                    field.setText(text);
                    field.setFontSize(fontSize)
                    // ฝังฟอนต์ไทยลงใน Field ฟอร์มนั้นๆ
                    if (customFont) field.updateAppearances(customFont);
                }

                const copyField = form.getTextField(`${fieldName}_copy`);
                if (copyField) {
                    copyField.setText(text);
                    copyField.setFontSize(fontSize);
                    if (customFont) copyField.updateAppearances(customFont);
                }
            } catch (e) { /* ข้ามถ้าหาฟิลด์ไม่เจอ */ }
        };

        const checkCheckbox = (fieldName: string, isChecked: boolean) => {
            try {
                const field = form.getCheckBox(fieldName);
                if (field) isChecked ? field.check() : field.uncheck();

                const copyField = form.getCheckBox(`${fieldName}_copy`);
                if (copyField) isChecked ? copyField.check() : copyField.uncheck();
            } catch (e) { /* ข้ามถ้าหาฟิลด์ไม่เจอ */ }
        };

        fillField('Name', data.customerName);
        fillField('Address', data.customerAddress, 14);
        fillField('ThaiNo', data.customerThaiNo);
        fillField('Date', data.receiptDate);
        fillField('Item', data.itemName, 14);
        fillField('Price', data.amount);
        fillField('Price_total', data.amount);
        fillField('Bathtext', data.bahtText);
        fillField('extend', data.note || "-");

        const cash = Number(data.cashReceive) || 0;
        const transfer = Number(data.transferReceive) || 0;

        if (cash > 0) {
            checkCheckbox('Check_สด', true);
            fillField('num_สด', cash.toLocaleString('en-US', { minimumFractionDigits: 2 }));
        }

        if (transfer > 0) {
            checkCheckbox('Check_โอน', true);
            fillField('num_โอน', transfer.toLocaleString('en-US', { minimumFractionDigits: 2 }));
            fillField('Bank_Name', data.bankName || "หลายบัญชี"); // ถ้าโอนหลายบัญชีให้ขึ้นว่าหลายบัญชี
        }
        form.flatten();
        const pdfOutputBytes = await pdfDoc.save();
        const outputDir = path.join(process.cwd(), "public/documents/receipts");
        if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

        const outputPath = path.join(outputDir, outputFileName);
        fs.writeFileSync(outputPath, pdfOutputBytes);

        return `/documents/receipts/${outputFileName}`;
    } catch (error) {
        console.error("Error generating PDF receipt:", error);
        throw new Error("ไม่สามารถสร้างไฟล์ใบเสร็จได้ กรุณาตรวจสอบฟอนต์ THSarabunNew.ttf");
    }
};