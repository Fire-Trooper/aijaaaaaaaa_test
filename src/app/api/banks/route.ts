import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const banks = await db.bank.findMany({ orderBy: { createdAt: "desc" } });
        return NextResponse.json(banks);
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถดึงข้อมูลธนาคารได้" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const newBank = await db.bank.create({
            data: { bankName: body.bankName, accountNumber: body.accountNumber, accountName: body.accountName, logoUrl: body.logoUrl }
        });
        return NextResponse.json(newBank, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถเพิ่มข้อมูลธนาคารได้" }, { status: 500 });
    }
}

// อัปเดตข้อมูลธนาคาร
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const updated = await db.bank.update({
            where: { id: body.id },
            data: { bankName: body.bankName, accountNumber: body.accountNumber, accountName: body.accountName, logoUrl: body.logoUrl }
        });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถแก้ไขข้อมูลได้" }, { status: 500 });
    }
}

// ลบธนาคาร
export async function DELETE(req: Request) {
    try {
        const id = new URL(req.url).searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ระบุ ID ไม่ถูกต้อง" }, { status: 400 });

        await db.bank.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถลบธนาคารได้ (อาจมีโครงการใช้งานบัญชีนี้อยู่)" }, { status: 500 });
    }
}