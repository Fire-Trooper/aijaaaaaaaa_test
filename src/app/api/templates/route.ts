import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function GET() {
    const templates = await db.template.findMany({ orderBy: { uploadedAt: "desc" } });
    return NextResponse.json(templates);
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string;

        if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const uploadDir = path.join(process.cwd(), "private/templates");
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const fileName = `${Date.now()}_${file.name}`;
        const filePath = path.join(uploadDir, fileName);
        await writeFile(filePath, buffer);

        const existingTemplate = await db.template.findFirst({ where: { type } });

        let template;
        if (existingTemplate) {
            // ถ้ามีไฟล์เดิมอยู่ ลบไฟล์เก่าทิ้งด้วยเพื่อประหยัดพื้นที่
            try { fs.unlinkSync(existingTemplate.filePath); } catch (e) { }
            template = await db.template.update({
                where: { id: existingTemplate.id },
                data: { name: file.name, filePath: filePath }
            });
        } else {
            template = await db.template.create({
                data: { name: file.name, type, filePath }
            });
        }

        return NextResponse.json(template, { status: 201 });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}

// ลบเทมเพลต (ลบทั้งใน DB และลบไฟล์ออกจากเครื่อง)
export async function DELETE(req: Request) {
    try {
        const id = new URL(req.url).searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ระบุ ID ไม่ถูกต้อง" }, { status: 400 });

        const template = await db.template.findUnique({ where: { id } });
        if (template) {
            try { fs.unlinkSync(template.filePath); } catch (e) { } // ลบไฟล์จริงทิ้ง
            await db.template.delete({ where: { id } });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถลบเทมเพลตได้" }, { status: 500 });
    }
}