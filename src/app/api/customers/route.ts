import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
    try {
        const customers = await db.customer.findMany({
            orderBy: { createdAt: "desc" },
            include: { _count: { select: { contracts: true } } }
        });
        return NextResponse.json(customers);
    } catch (error) {
        return NextResponse.json({ error: "ดึงข้อมูลไม่สำเร็จ" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const existing = await db.customer.findUnique({ where: { idCard: body.idCard } });
        if (existing) return NextResponse.json({ error: "เลขบัตร/ผู้เสียภาษีนี้มีในระบบแล้ว" }, { status: 400 });

        const customer = await db.customer.create({
            data: {
                isCorporate: Boolean(body.isCorporate),
                fullName: body.fullName,
                idCard: body.idCard,
                // แก้ไข: ใช้ birthDate แทน age
                birthDate: body.birthDate ? new Date(body.birthDate) : null,
                phone: body.phone,
                secondaryPhone: body.secondaryPhone,
                addressNumber: body.addressNumber,
                moo: body.moo,
                subDistrict: body.subDistrict,
                district: body.district,
                province: body.province,
            }
        });
        return NextResponse.json(customer, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถสร้างลูกค้าได้" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const updated = await db.customer.update({
            where: { id: body.id },
            data: {
                isCorporate: Boolean(body.isCorporate),
                fullName: body.fullName,
                idCard: body.idCard,
                birthDate: body.birthDate ? new Date(body.birthDate) : null,
                phone: body.phone,
                secondaryPhone: body.secondaryPhone,
                addressNumber: body.addressNumber,
                moo: body.moo,
                subDistrict: body.subDistrict,
                district: body.district,
                province: body.province,
            }
        });
        return NextResponse.json(updated);
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถแก้ไขได้" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const id = new URL(req.url).searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID ไม่ถูกต้อง" }, { status: 400 });
        await db.customer.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "ไม่สามารถลบได้ (มีประวัติทำสัญญา)" }, { status: 500 });
    }
}