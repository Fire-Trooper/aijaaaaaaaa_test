import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const deedNumber = formData.get("deedNumber") as string;
        const landNumber = formData.get("landNumber") as string;
        const surveyPage = formData.get("surveyPage") as string;
        const utmNo = formData.get("utmNo") as string;
        const subDistrict = formData.get("subDistrict") as string;
        const district = formData.get("district") as string;
        const province = formData.get("province") as string;

        // แปลง String กลับเป็น Array
        const selectedZonesStr = formData.get("selectedZones") as string;
        const selectedZones = JSON.parse(selectedZonesStr) as string[];

        // จัดการไฟล์ PDF
        const file = formData.get("file") as File | null;
        let pdfPath = null;

        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadDir = path.join(process.cwd(), "public/documents/deeds");
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const fileName = `Deed_${deedNumber}_${Date.now()}.pdf`;
            const filePath = path.join(uploadDir, fileName);
            await writeFile(filePath, buffer);
            pdfPath = `/documents/deeds/${fileName}`; // เซฟ Path ไปเก็บใน DB
        }

        const newDeed = await db.deed.create({
            data: {
                deedNumber, landNumber, surveyPage, utmNo, subDistrict, district, province,
                powerOfAttorneyPdf: pdfPath,
                zones: {
                    connect: selectedZones.map(id => ({ id })) // ผูกโฉนดเข้ากับโซนหลายๆ โซน
                }
            }
        });

        return NextResponse.json(newDeed, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถเพิ่มข้อมูลโฉนดได้" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const formData = await req.formData();

        const id = formData.get("id") as string;
        const deedNumber = formData.get("deedNumber") as string;
        const landNumber = formData.get("landNumber") as string;
        const surveyPage = formData.get("surveyPage") as string;
        const utmNo = formData.get("utmNo") as string;
        const subDistrict = formData.get("subDistrict") as string;
        const district = formData.get("district") as string;
        const province = formData.get("province") as string;

        const selectedZonesStr = formData.get("selectedZones") as string;
        const selectedZones = JSON.parse(selectedZonesStr) as string[];

        const file = formData.get("file") as File | null;

        // เตรียม Data สำหรับอัปเดต (ตั้งค่าให้ถอดโซนเก่าออกก่อน แล้วผูกใหม่)
        const updateData: any = {
            deedNumber, landNumber, surveyPage, utmNo, subDistrict, district, province,
            zones: { set: [], connect: selectedZones.map(zoneId => ({ id: zoneId })) }
        };

        // ถ้ามีการอัปโหลดไฟล์ใหม่มาทับ
        if (file && file.size > 0) {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadDir = path.join(process.cwd(), "public/documents/deeds");
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const fileName = `Deed_${deedNumber}_${Date.now()}.pdf`;
            const filePath = path.join(uploadDir, fileName);
            await writeFile(filePath, buffer);
            updateData.powerOfAttorneyPdf = `/documents/deeds/${fileName}`;
        }

        const updated = await db.deed.update({ where: { id }, data: updateData });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถแก้ไขโฉนดได้" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const id = new URL(req.url).searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ระบุ ID ไม่ถูกต้อง" }, { status: 400 });
        await db.deed.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถลบโฉนดได้ (อาจมีสัญญาผูกอยู่)" }, { status: 500 });
    }
}